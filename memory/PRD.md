# On The Tools — PRD

## Problem statement (verbatim)
> Create me a website for "On The Tools" (cutting discs / metal-cutting supplies brand). Logo must have no background. Need a full admin panel where I can view and reply to contact-form messages. Need to add products with Amazon links. Product catalogue page; clicking a product opens a product page with picture, description, two buttons: "Buy Now" (redirects to Amazon) and "Buy in Bulk" (sends to contact form). Make it look like a $25,000 website — high-level animations, mobile-first. Push to GitHub.

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + Framer Motion + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB) + JWT (bcrypt)
- **Database**: MongoDB collections — `users`, `products`, `messages`
- **Auth**: Bearer token (JWT) stored in `localStorage` under `ott_token`
- **Routing**: All backend endpoints prefixed with `/api`

## User personas
1. **Customer (anonymous)** — browses catalogue, clicks Buy Now to Amazon, or fills Trade Enquiries form for bulk.
2. **Admin (Tahmid)** — logs in at `/admin`, manages products (CRUD), reads & replies to enquiries from inbox.

## Core requirements (static)
- Transparent-background logo (achieved via Pillow white-key preprocessing → `/public/logo.png`)
- Black + neon lime (`#C6FF00`) industrial theme; Anton heading + Barlow body
- Mobile-first, motion design throughout (Framer Motion + CSS sparks)
- Product detail: "Buy Now" → Amazon URL in new tab; "Buy In Bulk" → `/contact?product=…`
- Trade Enquiries form fields: Full Name, Company, Phone, Email, Product (dropdown), Quantity, Message
- Admin inbox shows message + reply thread; reply stored (no real email)
- Product CRUD with image URL + Amazon URL + custom spec key/value pairs

## Implemented (Feb 2026 — Iteration 1)
- ✅ Backend: `/api/auth/login`, `/me`; `/api/products` CRUD; `/api/messages` CRUD + `/reply`; admin & product seeders; bcrypt + JWT auth.
- ✅ Frontend pages: Home (hero + sparks + marquee + why-pros + range + footer badges), Products, ProductDetail, About, FAQ, TradeEnquiries, AdminLogin, AdminDashboard (Messages + Products tabs).
- ✅ Layout (sticky navbar with transparent logo, mobile hamburger, footer).
- ✅ Testing — 100 % backend (16 cases) + 100 % frontend (21 flows) per iteration_1 test report.
- ✅ GitHub repo created and pushed: `https://github.com/tahburn101-netizen/on-the-tools`

## $25k criteria checklist
- [x] Cinematic hero with parallax + sparks particles
- [x] Premium typography (Anton brutalist headings vs Barlow technical body)
- [x] Marquee feature strip
- [x] Scroll-triggered Framer Motion reveals
- [x] Hover micro-interactions (neon drop-shadow, lift, scale on product cards)
- [x] Mobile-first responsive (hamburger nav, stacked grids)
- [x] Custom transparent logo
- [x] Full admin CMS

## Backlog
- P1: Image upload (object storage) for products instead of URL field
- P1: Real email replies via Resend/SendGrid
- P1: Order analytics / Amazon click tracking
- P2: Product filtering & search on catalogue
- P2: Multi-admin roles, password reset flow
- P2: SEO meta + OG image generator
