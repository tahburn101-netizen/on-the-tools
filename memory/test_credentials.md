# Test Credentials

## Admin User
- Email: admin@onthetools.com
- Password: Tahmid12!
- Role: admin

## Auth Endpoints
- POST /api/auth/login  { email, password } -> { access_token, user }
- GET  /api/auth/me     (Bearer token)      -> { user }

## Product / Messages Endpoints
- GET  /api/products
- GET  /api/products/{slug}
- POST /api/products            (admin)
- PUT  /api/products/{id}       (admin)
- DELETE /api/products/{id}     (admin)
- POST /api/messages            (public)
- GET  /api/messages            (admin)
- POST /api/messages/{id}/reply (admin)
