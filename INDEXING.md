# Database indexing (1000+ daily orders)

Indexes are defined on the Mongoose schemas and are created automatically when the app starts (Mongoose calls `ensureIndexes`). For production, you can build them explicitly and monitor usage.

## Indexes in use

### Orders (`orders`)

| Index | Purpose |
|-------|--------|
| `{ userId: 1, createdAt: -1 }` | User order history, list by user newest first (main read path) |
| `{ status: 1, createdAt: -1 }` | Admin: filter by status, time range |
| `{ paymentStatus: 1, createdAt: -1 }` | Payment reports, retries |
| `{ createdAt: -1 }` | Time-series queries, reporting, cleanup |

### Products (`products`)

| Index | Purpose |
|-------|--------|
| `{ category: 1, brand: 1, price: 1 }` | Listing with filters and sort by price |
| `{ createdAt: -1 }` | Newest first / new arrivals |
| `{ category: 1, createdAt: -1 }` | Category listing with default “newest” sort |
| `{ isHero: 1 }` (sparse) | Hero product single lookup |

### Carts (`carts`)

| Index | Purpose |
|-------|--------|
| `{ userId: 1 }` (unique) | One cart per user; all cart lookups by `userId` |

### Users (`users`)

| Index | Purpose |
|-------|--------|
| `email` (unique) | Login / lookup by email (from schema) |
| `{ role: 1 }` | Admin listing, analytics by role |

## Optional: text search

If you add product search by title/description, add a text index in `Product.model.js`:

```js
productSchema.index({ title: 'text', description: 'text' });
```

Then use `Product.find({ $text: { $search: query } })` in the product service.

## Build indexes manually (MongoDB shell)

```bash
# Connect to your DB (e.g. mongosh "mongodb://localhost:27017/spsell")

db.orders.createIndex({ userId: 1, createdAt: -1 })
db.orders.createIndex({ status: 1, createdAt: -1 })
db.orders.createIndex({ paymentStatus: 1, createdAt: -1 })
db.orders.createIndex({ createdAt: -1 })

db.products.createIndex({ category: 1, brand: 1, price: 1 })
db.products.createIndex({ createdAt: -1 })
db.products.createIndex({ category: 1, createdAt: -1 })
db.products.createIndex({ isHero: 1 }, { sparse: true })

db.carts.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
```

## Check index usage

```javascript
// Explain a query (e.g. in mongosh)
db.orders.find({ userId: ObjectId("...") }).sort({ createdAt: -1 }).explain("executionStats")
```

Look for `stage: "IXSCAN"` and the index name in the plan. If you see `COLLSCAN`, add or fix an index for that query pattern.

## Scale tips (1000+ orders/day)

- **Connection pool**: Set `MONGODB_POOL_SIZE=10` (or 10–20) in production so many concurrent order requests share the pool.
- **Order creation**: Backend uses a single `Product.find({ _id: { $in: ids } })` and one `Order.create()` per placement to minimize round-trips.
- **Order listing**: Paginated (e.g. `?page=1&limit=20`); index `(userId, createdAt)` supports this.
- **Product listing**: Paginated with filters; indexes on `(category, brand, price)` and `(category, createdAt)` support filtered and sorted listing.
