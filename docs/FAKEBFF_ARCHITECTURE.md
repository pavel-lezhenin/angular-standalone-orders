# FakeBFF Architecture

> Simulating REST API using Angular services and IndexedDB

## Flow

```
Components → HTTP /api/* → APIInterceptor → FakeBFFService → Repositories → IndexedDB
```

**Production:** Remove interceptor, same HTTP calls go to real backend.

---

## Key Components

**1. APIInterceptor** (`src/core/interceptors/api.interceptor.ts`)  
Intercepts `/api/*` requests, routes to FakeBFFService

**2. FakeBFFService** (`src/bff/fake-bff.service.ts`)  
Simulates REST API, validates requests, returns standard HTTP responses

**3. Repositories** (`src/bff/repositories/`)  
CRUD operations: User, Product, Order, Category, Cart

**4. DatabaseService** (`src/bff/database.service.ts`)  
IndexedDB wrapper (7 stores: users, products, orders, categories, cart, order_items, permissions)

**5. AuthService** (`src/core/services/auth.service.ts`)  
Makes HTTP requests (intercepted → FakeBFF in dev, real backend in prod)

---

## API Endpoints

```
Auth:
  POST   /api/auth/login        → { user, token }
  POST   /api/auth/logout       → { message }
  GET    /api/auth/me           → { user }

Products:
  GET    /api/products          → { products }
  GET    /api/products/{id}     → { product }

Categories:
  GET    /api/categories        → { categories }

Orders:
  GET    /api/orders            → { orders }
  POST   /api/orders            → { order }
  GET    /api/orders/{id}       → { order }

Cart:
  GET    /api/users/{userId}/cart              → { cart }
  POST   /api/users/{userId}/cart/items        → { cart }
  DELETE /api/users/{userId}/cart/items/{id}   → { cart }
```

---

## Migration: Dev → Production

### Development (Current)

```
Service
  ↓ HTTP request
APIInterceptor
  ↓ routes to
FakeBFFService
  ↓ reads/writes
IndexedDB
```

### Production (Real Backend)

```
Service
  ↓ HTTP request
Real HTTP Backend (Express, NestJS, etc.)
  ↓ reads/writes
Real Database (PostgreSQL, MongoDB, etc.)
```

**Steps:**
1. Create `packages/orders-bff/` (Express.js backend)
2. Implement same `/api/*` endpoints as FakeBFFService
3. Remove APIInterceptor from `app.config.ts`
4. Update API base URL in providers
5. Delete `src/bff/` folder
6. Services stay unchanged ✅

---

## Benefits

✅ Zero coupling — Services don't know about IndexedDB  
✅ Production-ready — Mirrors real REST API  
✅ Offline-first — Demo works without backend  
✅ Smooth migration — Switch by removing interceptor

**Demo users:** user@demo, manager@demo, admin@demo (password: demo)

---

## When to Use

✅ Development, prototypes, MVPs, learning  
❌ Production, real-time sync, large datasets

---

## Real Backend Structure

When ready for production, create `packages/orders-bff/`:

```
packages/
├── angular-standalone-orders/     # This package (frontend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── bff/              # ← Delete after migrating!
│   │   │   │   ├── guards/
│   │   │   │   └── interceptors/
│   │   │   └── shared/
│   │   ├── areas/                     # User areas (RBAC)
│   │   │   ├── auth/                  # Public: login
│   │   │   ├── shop/                  # User: products, cart
│   │   │   └── admin/                 # Manager/Admin: dashboard, orders
│   │   └── pages/
│   └── package.json
│
└── orders-bff/                    # ← Create this for production
    ├── src/
    │   ├── routes/
    │   │   ├── auth.routes.ts              # POST /api/auth/login
    │   │   ├── products.routes.ts          # GET /api/products
    │   │   ├── orders.routes.ts            # GET/POST /api/orders
    │   │   └── cart.routes.ts              # Cart operations
    │   │
    │   ├── controllers/
    │   │   ├── auth.controller.ts          # Login logic + JWT
    │   │   ├── products.controller.ts
    │   │   ├── orders.controller.ts
    │   │   └── cart.controller.ts
    │   │
    │   ├── middleware/
    │   │   ├── auth.middleware.ts          # JWT verification
    │   │   ├── error-handler.ts            # Global error handling
    │   │   └── logger.ts
    │   │
    │   ├── database/
    │   │   ├── models/
    │   │   │   ├── User.ts                 # Sequelize/TypeORM models
    │   │   │   ├── Product.ts
    │   │   │   ├── Order.ts
    │   │   │   └── Cart.ts
    │   │   ├── seeders/                    # Populate test data
    │   │   └── connection.ts
    │   │
    │   └── index.ts                        # Express app bootstrap
    │
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── pnpm-lock.yaml
    └── README.md
```

### Migration Steps

1. **Create backend package:** `mkdir packages/orders-bff && cd packages/orders-bff`
2. **Install deps:** `pnpm add express cors jsonwebtoken sequelize pg`
3. **Implement endpoints:** Copy structure from FakeBFFService (same `/api/*` routes)
4. **Update frontend config:** Remove APIInterceptor, add `withBaseUrl('http://localhost:3000')`
5. **Delete mock layer:** `rm -rf src/bff/ src/core/interceptors/api.interceptor.ts`

### Comparison

| Aspect | FakeBFF (Dev) | Real Backend (Prod) |
|--------|--------------|---------------------|
| **Location** | `src/bff/` | `packages/orders-bff/` |
| **Technology** | Angular + IndexedDB | Express + PostgreSQL |
| **Persistence** | Browser storage | Real database |
| **API Endpoints** | Identical | Identical |

---

**See also:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Overall system design
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — Building features on top of FakeBFF
