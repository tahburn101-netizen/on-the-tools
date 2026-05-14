from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import logging
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from collections import Counter as CCounter

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Response, Header, Query
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
# Object Storage (Emergent)
# ------------------------------------------------------------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "on-the-tools")
_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        return _storage_key
    except Exception as e:
        logging.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 403:
        # Refresh and retry once
        global _storage_key
        _storage_key = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    if resp.status_code == 403:
        global _storage_key
        _storage_key = None
        key = init_storage()
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ------------------------------------------------------------
# Auth
# ------------------------------------------------------------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7


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
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ------------------------------------------------------------
# Models
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
    price: Optional[float] = None
    currency: Optional[str] = "GBP"
    specs: dict = Field(default_factory=dict)
    gallery: List[str] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    amazon_url: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
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
    price: Optional[float] = None
    currency: Optional[str] = "GBP"
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


class ClickEvent(BaseModel):
    product_id: str
    referrer: Optional[str] = ""


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
async def list_products(limit: int = 100, skip: int = 0):
    limit = max(1, min(limit, 200))
    skip = max(0, skip)
    docs = await db.products.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
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
        "price": payload.price,
        "currency": payload.currency or "GBP",
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


# ---- Image upload ----
ALLOWED_IMG = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@api.post("/uploads/image")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    if file.content_type not in ALLOWED_IMG:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    ext = (file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "bin").lower()
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/products/{file_id}.{ext}"
    result = put_object(path, data, file.content_type)
    file_doc = {
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename or f"{file_id}.{ext}",
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": iso_now(),
    }
    await db.files.insert_one(file_doc.copy())
    public_url = f"/api/files/{result['path']}"
    return {"url": public_url, "id": file_id, "path": result["path"]}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(path)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File fetch failed: {e}")
    return Response(content=data, media_type=record.get("content_type", content_type))


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
async def list_messages(admin: dict = Depends(get_current_admin), limit: int = 100, skip: int = 0):
    limit = max(1, min(limit, 500))
    skip = max(0, skip)
    docs = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return docs


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


@api.delete("/messages/{message_id}")
async def delete_message(message_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.messages.delete_one({"id": message_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ---- Click tracking & analytics ----
@api.post("/clicks")
async def log_click(payload: ClickEvent, request: Request):
    product = await db.products.find_one({"id": payload.product_id}, {"_id": 0, "name": 1, "slug": 1})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = {
        "id": str(uuid.uuid4()),
        "product_id": payload.product_id,
        "product_name": product.get("name", ""),
        "product_slug": product.get("slug", ""),
        "referrer": payload.referrer or "",
        "user_agent": request.headers.get("user-agent", "")[:240],
        "ip": (request.client.host if request.client else "")[:60],
        "created_at": iso_now(),
    }
    await db.clicks.insert_one(doc)
    return {"ok": True}


@api.get("/analytics/summary")
async def analytics_summary(admin: dict = Depends(get_current_admin)):
    now = datetime.now(timezone.utc)
    last_24h = (now - timedelta(hours=24)).isoformat()
    last_7d = (now - timedelta(days=7)).isoformat()
    last_30d = (now - timedelta(days=30)).isoformat()

    clicks = await db.clicks.find(
        {"created_at": {"$gte": last_30d}},
        {"_id": 0, "id": 1, "product_id": 1, "product_name": 1, "product_slug": 1, "referrer": 1, "user_agent": 1, "created_at": 1},
    ).sort("created_at", -1).limit(2000).to_list(2000)
    msgs = await db.messages.find({}, {"_id": 0, "created_at": 1, "status": 1}).limit(2000).to_list(2000)
    products = await db.products.find({}, {"_id": 0, "id": 1, "name": 1, "slug": 1}).limit(500).to_list(500)

    total_clicks = await db.clicks.count_documents({})
    clicks_24h = sum(1 for c in clicks if c["created_at"] >= last_24h)
    clicks_7d = sum(1 for c in clicks if c["created_at"] >= last_7d)
    clicks_30d = len(clicks)

    by_product = CCounter()
    for c in clicks:
        by_product[c["product_id"]] += 1

    pmap = {p["id"]: p for p in products}
    top_products = []
    for pid, count in by_product.most_common(5):
        p = pmap.get(pid)
        if p:
            top_products.append({"product_id": pid, "name": p["name"], "slug": p["slug"], "clicks": count})

    # 7-day daily breakdown
    daily = {}
    for i in range(7):
        d = (now - timedelta(days=i)).date().isoformat()
        daily[d] = 0
    for c in clicks:
        d = c["created_at"][:10]
        if d in daily:
            daily[d] += 1
    daily_series = [{"date": d, "clicks": daily[d]} for d in sorted(daily.keys())]

    return {
        "total_clicks": total_clicks,
        "clicks_24h": clicks_24h,
        "clicks_7d": clicks_7d,
        "clicks_30d": clicks_30d,
        "total_messages": len(msgs),
        "new_messages": sum(1 for m in msgs if m.get("status") == "new"),
        "total_products": len(products),
        "top_products": top_products,
        "daily_clicks": daily_series,
        "recent_clicks": clicks[:10],
    }


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
        logging.info(f"Seeded admin user: {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email}, {"$set": {"password_hash": hash_password(password)}}
        )
        logging.info(f"Updated admin password for: {email}")


# Use the transparent processed disc image served by the frontend /public folder
DISC_IMG = "/disc-115mm.png"

SEED_PRODUCTS = [
    {
        "name": "115mm 1mm Metal Cutting Disc",
        "short_description": "Ultra-thin precision cutting for stainless steel and metal sheets.",
        "description": "Engineered for fast, clean cuts on stainless steel, mild steel and metal sheets. The 1mm ultra-thin profile minimises material waste and reduces heat build-up, giving you burr-free finishes every time. EN12413 certified, 13,300 RPM rated.",
        "image_url": DISC_IMG,
        "amazon_url": "https://www.amazon.co.uk/dp/B08EXAMPLE1",
        "price": 14.99,
        "currency": "GBP",
        "specs": {
            "Diameter": "115mm (4.5\")",
            "Thickness": "1.0mm",
            "Bore": "22.2mm",
            "Max RPM": "13,300",
            "Standard": "EN12413 / ISO9001",
            "Material": "Aluminium Oxide",
        },
    },
    {
        "name": "115mm 3mm Metal Cutting Disc",
        "short_description": "All-round 3mm cutting disc for heavy-duty metal work.",
        "description": "The workhorse of the range. A 3mm profile makes this disc ideal for heavy-duty cutting on steel, rebar, and structural metal. Built with reinforced fibreglass mesh for safety and durability under load.",
        "image_url": DISC_IMG,
        "amazon_url": "https://www.amazon.co.uk/dp/B08EXAMPLE2",
        "price": 16.99,
        "currency": "GBP",
        "specs": {
            "Diameter": "115mm (4.5\")",
            "Thickness": "3.0mm",
            "Bore": "22.2mm",
            "Max RPM": "13,300",
            "Standard": "EN12413 / ISO9001",
            "Material": "Aluminium Oxide",
        },
    },
    {
        "name": "115mm 6mm Metal Grinding Disc",
        "short_description": "Heavy-duty 6mm grinding disc for deburring and weld cleaning.",
        "description": "Designed for aggressive stock removal, weld cleaning, and deburring. The 6mm depressed-centre profile delivers long disc life and consistent grinding performance under continuous use.",
        "image_url": DISC_IMG,
        "amazon_url": "https://www.amazon.co.uk/dp/B08EXAMPLE3",
        "price": 19.99,
        "currency": "GBP",
        "specs": {
            "Diameter": "115mm (4.5\")",
            "Thickness": "6.0mm",
            "Bore": "22.2mm",
            "Max RPM": "13,300",
            "Standard": "EN12413 / ISO9001",
            "Material": "Aluminium Oxide",
        },
    },
]


async def seed_products():
    """Idempotent: create if missing, update image_url/specs/price if outdated."""
    for p in SEED_PRODUCTS:
        existing = await db.products.find_one({"name": p["name"]})
        if existing:
            update = {}
            if existing.get("image_url") != p["image_url"]:
                update["image_url"] = p["image_url"]
            if existing.get("specs") != p["specs"]:
                update["specs"] = p["specs"]
            if existing.get("price") is None and p.get("price") is not None:
                update["price"] = p["price"]
                update["currency"] = p.get("currency", "GBP")
            if update:
                await db.products.update_one({"id": existing["id"]}, {"$set": update})
                logging.info(f"Updated seeded product: {p['name']}")
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "slug": slugify(p["name"]),
            **p,
            "gallery": [],
            "created_at": iso_now(),
        }
        await db.products.insert_one(doc)
        logging.info(f"Seeded product: {p['name']}")


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
    await db.clicks.create_index("created_at")
    await db.clicks.create_index("product_id")
    await db.files.create_index("storage_path", unique=True)
    await seed_admin()
    await seed_products()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"Storage init deferred: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
