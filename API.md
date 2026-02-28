# SPSell Backend API

Base URL: `http://localhost:3000/api` (or set via env).

All responses follow: `{ success: boolean, message: string, data: T }`.

---

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register. Body: `{ name, email, password }`. Returns `data: { token, user }`. |
| POST | `/auth/login` | No | Login. Body: `{ email, password }`. Returns `data: { token, user }`. |
| GET | `/auth/profile` | Bearer | Get current user profile. |
| PATCH | `/auth/profile` | Bearer | Update profile. Body: `{ name }`. |

---

## Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | No | List products. Query: `page`, `limit`, `category`, `brand`, `minPrice`, `maxPrice`, `sort` (price_asc, price_desc, newest). Returns `data: { products, pagination }`. |
| GET | `/products/categories` | No | List distinct categories. |
| GET | `/products/brands` | No | List distinct brands. |
| GET | `/products/:id` | No | Get single product. |
| POST | `/products` | Admin | Create product. Body: `title`, `description`, `price`, `discount`, `brand`, `category`, `images[]`, `stock`. |
| PATCH | `/products/:id` | Admin | Update product. |
| DELETE | `/products/:id` | Admin | Delete product. |

---

## Cart (all require Bearer auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cart` | Get user cart. Returns `data: { items: [{ product, quantity }] }`. |
| POST | `/cart/add` | Body: `{ productId, quantity? }`. |
| PATCH | `/cart` | Body: `{ productId, quantity }`. |
| POST | `/cart/remove` | Body: `{ productId }`. |

---

## Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Optional | Place order. Body: `{ address: { fullName, phone, addressLine1, ... }, items: [{ productId, quantity }], total, paymentMethod }`. Online payment only (placeholder). |
| GET | `/orders` | Bearer | List current user orders. |
| GET | `/orders/:id` | Bearer | Get single order (own only). |

Order status: `pending` | `shipped` | `delivered`. Payment status: `pending` | `paid` | `failed`.
