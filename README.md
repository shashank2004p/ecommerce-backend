# SPSell Backend

Production-ready Node.js/Express/MongoDB backend for the SPSell electronics e-commerce frontend.

## Stack

- **Node.js** (ES modules)
- **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** (jsonwebtoken) + **bcryptjs** for auth
- **CORS**, **dotenv**

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `MONGODB_URI` – MongoDB connection string (default: `mongodb://localhost:27017/spsell`)
   - `JWT_SECRET` – secret for signing JWTs
   - `PORT` – server port (default: 3000)
   - `CORS_ORIGIN` – allowed origins (e.g. `http://localhost:5173` for Vite frontend)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` – Razorpay API keys
   - `RAZORPAY_WEBHOOK_SECRET` – webhook secret (from Razorpay dashboard)

3. **Run**

   ```bash
   npm run dev   # development with --watch
   npm start     # production
   ```

The API is served at `http://localhost:3000/api`. See **API.md** for route and response details.

## Razorpay payments

- **Create DB order**: `POST /api/orders`
- **Create Razorpay order**: `POST /api/orders/:id/create-payment`
- **Verify payment (signature)**: `POST /api/orders/:id/verify-payment`
- **Webhook (recommended)**: `POST /api/payments/razorpay/webhook`

For webhook setup in Razorpay dashboard, point to `/api/payments/razorpay/webhook` and use the same `RAZORPAY_WEBHOOK_SECRET` configured in the backend.

## First admin user

Create an admin manually in MongoDB or add a seed script that creates a user with `role: 'admin'` so you can use POST `/api/products` (and PATCH/DELETE).

## Project structure

- `src/config/` – env config, DB connection
- `src/controllers/` – request/response handlers
- `src/models/` – Mongoose schemas (User, Product, Cart, Order)
- `src/routes/` – route definitions
- `src/services/` – business logic
- `src/middlewares/` – auth, admin, error handler
- `src/utils/` – ApiResponse, asyncHandler, validation
