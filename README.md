# AgriMind — Final Full-Stack Project

AgriMind is a React + Vite frontend connected to an Express + MongoDB backend for farmer management and a farm-to-buyer marketplace.

## Project structure

```text
Agri_MInd_Final_Backend_Complete/
├── client/     React + Vite frontend
├── server/     Express + MongoDB backend
├── start-dev.bat
├── package.json
└── README.md
```

## Requirements

- Node.js 18+ recommended
- MongoDB Atlas account or a reachable MongoDB instance
- A MongoDB connection string

## 1. Configure MongoDB

Copy:

```text
server/.env.example
```

to:

```text
server/.env
```

Set at least:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Optional:

```env
DATA_GOV_IN_API_KEY=your_data_gov_in_api_key
```

Do not commit `server/.env`.

## 2. Install dependencies

From the project root:

```bash
npm run install:all
```

Or separately:

```bash
cd server
npm install

cd ../client
npm install
```

## 3. Start the project

### Windows

Double-click:

```text
start-dev.bat
```

### Manual

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/health
```

## Authentication

Authentication is JWT-based.

- Registration creates a MongoDB user with a hashed password.
- Login returns a JWT.
- The frontend stores the JWT and current user locally.
- `ProtectedRoute` controls frontend navigation by role.
- Backend middleware validates the JWT on protected API routes.
- Backend `authorize()` enforces farmer/buyer roles.
- Logout clears the local session.

Important: frontend route protection is for navigation. Real authorization is enforced by the backend.

## Main farmer modules

- Dashboard
- Farm Management
- Crop Management
- Inventory
- My Products
- Government Mandi Rates
- Farmer Orders
- Expenses
- Income
- Harvest
- Fertilizer
- Irrigation
- Profile

## Main buyer modules

- Marketplace
- Product Details
- Wishlist
- Cart
- Checkout
- Buyer Orders
- Reviews
- Notifications
- Profile

## Marketplace flow

```text
Farmer
  ↓
Create Product
  ↓
MongoDB Product
  ↓
Buyer Marketplace
  ↓
Add to Cart
  ↓
Checkout
  ↓
Backend validates stock
  ↓
Order created
  ↓
Product stock reduced
  ↓
Buyer Orders + Farmer Orders
```

The checkout currently supports Cash on Delivery and keeps online payment as a UI/backend-ready option. A real payment gateway still requires provider credentials and payment verification.

## Government rates

The Government Rates page uses the data.gov.in / AGMARKNET API when `DATA_GOV_IN_API_KEY` is configured. Without a key, the page safely shows that official rates are not configured.

## Security notes

- Passwords are hashed with bcrypt.
- JWTs are verified on protected backend routes.
- Farmer CRUD records are scoped to the authenticated farmer.
- Buyer cart and wishlist are scoped to the authenticated buyer.
- Products can only be created/updated/deleted by their owning farmer.
- Orders validate stock on the server.
- Checkout does not trust prices sent by the browser.
- A checkout containing products from multiple farmers is rejected because the current order model represents one farmer per order. Place separate orders for separate farmers.
