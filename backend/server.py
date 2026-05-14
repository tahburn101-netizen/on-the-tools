from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ------------------------------------------------------------
# Database
# ------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


# ------------------------------------------------------------
# Auth helpers
# ------------------------------------------------------------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7-day token for admin convenience


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ------------------------------------------------------------
# Utility
# ------------------------------------------------------------
def slugify(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ------------------------------------------------------------
# Pydantic Models
# ------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    user: dict


class ProductCreate(BaseModel):
    name: str
    short_description: str
    description: str
    image_url: str
    amazon_url: str
    specs: dict = Field(default_factory=dict)
    gallery: List[str] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    amazon_url: Optional[str] = None
    specs: Optional[dict] = None
    gallery: Optional[List[str]] = None


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    name: str
    short_description: str
    description: str
    image_url: str
    amazon_url: str
    specs: dict = Field(default_factory=dict)
    gallery: List[str] = Field(default_factory=list)
    created_at: str


class MessageCreate(BaseModel):
    full_name: str
    company: Optional[str] = ""
    phone: str
    email: EmailStr
    product_needed: Optional[str] = ""
    quantity: Optional[str] = ""
    message: str


class ReplyCreate(BaseModel):
    body: str


# ------------------------------------------------------------
# FastAPI
# ------------------------------------------------------------
app = FastAPI(title="On The Tools API")
api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"status": "ok", "service": "On The Tools"}


# ---- Auth ----
@api.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    user_out = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "user": user_out}


@api.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# ---- Products ----
@api.get("/products", response_model=List[Product])
async def list_products():
    docs = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return doc


@api.post("/products", response_model=Product)
async def create_product(payload: ProductCreate, admin: dict = Depends(get_current_admin)):
    base_slug = slugify(payload.name)
    slug = base_slug
    n = 1
    while await db.products.find_one({"slug": slug}):
        n += 1
        slug = f"{base_slug}-{n}"
    doc = {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "name": payload.name,
        "short_description": payload.short_description,
        "description": payload.description,
        "image_url": payload.image_url,
        "amazon_url": payload.amazon_url,
        "specs": payload.specs,
        "gallery": payload.gallery,
        "created_at": iso_now(),
    }
    await db.products.insert_one(doc.copy())
    return doc


@api.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductUpdate, admin: dict = Depends(get_current_admin)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "name" in update and update["name"] != existing["name"]:
        base_slug = slugify(update["name"])
        slug = base_slug
        n = 1
        while await db.products.find_one({"slug": slug, "id": {"$ne": product_id}}):
            n += 1
            slug = f"{base_slug}-{n}"
        update["slug"] = slug
    if update:
        await db.products.update_one({"id": product_id}, {"$set": update})
    fresh = await db.products.find_one({"id": product_id}, {"_id": 0})
    return fresh


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# ---- Messages ----
@api.post("/messages")
async def submit_message(payload: MessageCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "full_name": payload.full_name,
        "company": payload.company or "",
        "phone": payload.phone,
        "email": payload.email,
        "product_needed": payload.product_needed or "",
        "quantity": payload.quantity or "",
        "message": payload.message,
        "status": "new",
        "replies": [],
        "created_at": iso_now(),
    }
    await db.messages.insert_one(doc.copy())
    return {"ok": True, "id": doc["id"]}


@api.get("/messages")
async def list_messages(admin: dict = Depends(get_current_admin)):
    docs = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return docs


@api.get("/messages/{message_id}")
async def get_message(message_id: str, admin: dict = Depends(get_current_admin)):
    doc = await db.messages.find_one({"id": message_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@api.post("/messages/{message_id}/reply")
async def reply_message(message_id: str, payload: ReplyCreate, admin: dict = Depends(get_current_admin)):
    reply = {
        "id": str(uuid.uuid4()),
        "body": payload.body,
        "author": admin.get("email"),
        "created_at": iso_now(),
    }
    res = await db.messages.update_one(
        {"id": message_id},
        {"$push": {"replies": reply}, "$set": {"status": "replied"}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return reply


@api.patch("/messages/{message_id}/status")
async def update_status(message_id: str, body: dict, admin: dict = Depends(get_current_admin)):
    new_status = body.get("status", "new")
    res = await db.messages.update_one({"id": message_id}, {"$set": {"status": new_status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api.delete("/messages/{message_id}")
async def delete_message(message_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.messages.delete_one({"id": message_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ------------------------------------------------------------
# Seeders
# ------------------------------------------------------------
async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower().strip()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if not existing:
        doc = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": "Admin",
            "role": "admin",
            "password_hash": hash_password(password),
            "created_at": iso_now(),
        }
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin user: {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email}, {"$set": {"password_hash": hash_password(password)}}
        )
        logger.info(f"Updated admin password for: {email}")


SEED_PRODUCTS = [
    {
        "name": "115mm 1mm Metal Cutting Disc",
        "short_description": "Ultra-thin precision cutting for stainless steel and metal sheets.",
        "description": "Engineered for fast, clean cuts on stainless steel, mild steel and metal sheets. The 1mm ultra-thin profile minimises material waste and reduces heat build-up, giving you burr-free finishes every time. EN12413 certified, 13,300 RPM rated.",
        "image_url": "https://customer-assets.emergentagent.com/job_f207eb6c-e5d0-4f53-a1ed-2d0d257bf71c/artifacts/bs3n5039_IMG-20260422-WA0000.jpg",
        "amazon_url": "https://www.amazon.co.uk/dp/B08EXAMPLE1",
        "specs": {
            "Diameter": "115mm (4.5\")",
            "Thickness": "1.0mm",
            "Bore": "22.2mm",
            "Max RPM": "13,300",
            "Standard": "EN12413 / ISO9001",
            "Material": "Aluminium Oxide",
        },
        "gallery": [],
    },
    {
        "name": "115mm 3mm Metal Cutting Disc",
        "short_description": "All-round 3mm cutting disc for heavy-duty metal work.",
        "description": "The workhorse of the range. A 3mm profile makes this disc ideal for heavy-duty cutting on steel, rebar, and structural metal. Built with reinforced fibreglass mesh for safety and durability under load.",
        "image_url": "https://customer-assets.emergentagent.com/job_f207eb6c-e5d0-4f53-a1ed-2d0d257bf71c/artifacts/bs3n5039_IMG-20260422-WA0000.jpg",
        "amazon_url": "https://www.amazon.co.uk/dp/B08EXAMPLE2",
        "specs": {
            "Diameter": "115mm (4.5\")",
            "Thickness": "3.0mm",
            "Bore": "22.2mm",
            "Max RPM": "13,300",
            "Standard": "EN12413 / ISO9001",
            "Material": "Aluminium Oxide",
        },
        "gallery": [],
    },
    {
        "name": "115mm 6mm Metal Grinding Disc",
        "short_description": "Heavy-duty 6mm grinding disc for deburring and weld cleaning.",
        "description": "Designed for aggressive stock removal, weld cleaning, and deburring. The 6mm depressed-centre profile delivers long disc life and consistent grinding performance under continuous use.",
        "image_url": "https://customer-assets.emergentagent.com/job_f207eb6c-e5d0-4f53-a1ed-2d0d257bf71c/artifacts/bs3n5039_IMG-20260422-WA0000.jpg",
        "amazon_url": "https://www.amazon.co.uk/dp/B08EXAMPLE3",
        "specs": {
            "Diameter": "115mm (4.5\")",
            "Thickness": "6.0mm",
            "Bore": "22.2mm",
            "Max RPM": "13,300",
            "Standard": "EN12413 / ISO9001",
            "Material": "Aluminium Oxide",
        },
        "gallery": [],
    },
]


async def seed_products():
    for p in SEED_PRODUCTS:
        existing = await db.products.find_one({"name": p["name"]})
        if existing:
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "slug": slugify(p["name"]),
            **p,
            "created_at": iso_now(),
        }
        await db.products.insert_one(doc)
        logger.info(f"Seeded product: {p['name']}")


# ------------------------------------------------------------
# App lifecycle
# ------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("id", unique=True)
    await db.messages.create_index("id", unique=True)
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
