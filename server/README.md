# AgriMind Backend

Node.js + Express + MongoDB/Mongoose backend for the AgriMind Smart Farm & Marketplace project.

## Start

1. Make sure MongoDB Atlas is configured.
2. Create `server/.env` from `.env.example`.
3. Install packages:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

Server:
`http://localhost:5000`

Health:
`GET /api/health`

## Authentication

### Register
`POST /api/auth/register`

```json
{
  "firstName": "Aryan",
  "lastName": "Chandel",
  "email": "aryan@example.com",
  "phone": "9876543210",
  "password": "Test123456",
  "role": "farmer"
}
```

### Login
`POST /api/auth/login`

```json
{
  "email": "aryan@example.com",
  "password": "Test123456"
}
```

The response contains a JWT. Send it on protected requests:

`Authorization: Bearer YOUR_TOKEN`

### Current user
`GET /api/auth/me`

### Update profile
`PUT /api/auth/profile`

### Change password
`PUT /api/auth/password`

## Farmer APIs

All require a farmer JWT.

- `GET/POST /api/farms`
- `GET/PUT/DELETE /api/farms/:id`
- `GET/POST /api/crops`
- `GET/PUT/DELETE /api/crops/:id`
- `GET/POST /api/inventory`
- `GET/PUT/DELETE /api/inventory/:id`
- `GET/POST /api/expenses`
- `GET/PUT/DELETE /api/expenses/:id`
- `GET/POST /api/income`
- `GET/PUT/DELETE /api/income/:id`
- `GET/POST /api/harvests`
- `GET/PUT/DELETE /api/harvests/:id`
- `GET/POST /api/fertilizers`
- `GET/PUT/DELETE /api/fertilizers/:id`
- `GET/POST /api/irrigation`
- `GET/PUT/DELETE /api/irrigation/:id`

## Marketplace

Public:

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/government-rates`

Farmer:

- `GET /api/products/my-products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

## Orders

Buyer:

- `POST /api/orders`
- `GET /api/orders/buyer`
- `GET /api/orders/buyer/:id`
- `PUT /api/orders/buyer/:id/cancel`

Farmer:

- `GET /api/orders/farmer`
- `PUT /api/orders/farmer/:id/status`

## Reviews

Buyer:

- `GET /api/reviews`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

## Notes

- Passwords are hashed with bcryptjs.
- Authentication uses JWT.
- Farmer-owned records are isolated by the authenticated user's ID.
- Government/market rate values are the same reference/demo values used by the current frontend. They are not a live government feed.
- Payment gateway integration is not included; the current order API supports the frontend's payment method field and treats non-COD methods as paid for prototype purposes.
