# On The Tools — Cutting Edge Supplies

High-performance marketing + ecommerce-style site for the "On The Tools" cutting-disc brand, with a full admin panel.

## Stack
- **Frontend**: React 19, React Router, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI (Python), Motor (async MongoDB), JWT auth (bcrypt)
- **Database**: MongoDB

## Features
- Public site: Home, Products catalogue, Product Detail (with **Buy Now → Amazon** and **Buy in Bulk → contact form**), About, FAQ, Trade Enquiries contact form
- Admin panel at `/admin`:
  - Messages inbox with reply threads
  - Product CRUD (name, description, image URL, Amazon URL, custom specs)
- Mobile-first responsive design
- Black + neon lime (`#C6FF00`) industrial aesthetic with motion design (Framer Motion, CSS sparks)

## Environment Variables

### `backend/.env`
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="onthetools_db"
CORS_ORIGINS="*"
JWT_SECRET="<random-64-char-hex>"
ADMIN_EMAIL="admin@onthetools.com"
ADMIN_PASSWORD="<your-admin-password>"
```

### `frontend/.env`
```
REACT_APP_BACKEND_URL="<your backend URL>"
```

## Local development
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001

# Frontend
cd frontend && yarn install && yarn start
```

Admin is auto-seeded on first startup using `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Three demo products are also seeded.
