# FakeBFF Architecture

> **Frontend Backend-For-Frontend Pattern** — Simulating a real REST API using Angular services and IndexedDB

## Overview

```
┌─────────────────────────────────────┐
│   Angular Components/Services        │
│   (make normal HTTP requests)        │
└──────────────┬──────────────────────┘
               │ /api/auth/login
               │ POST
               ↓
┌─────────────────────────────────────┐
│   APIInterceptor                     │
│   (intercepts /api/* requests)       │
└──────────────┬──────────────────────┘
               │ redirect to
               ↓
┌─────────────────────────────────────┐
│   FakeBFFService                     │
│   (simulates REST API)               │
│   - Validates requests               │
│   - Routes to handlers               │
└──────────────┬──────────────────────┘
               │ read/write
               ↓
┌─────────────────────────────────────┐
│   Repositories + Database            │
│   (IndexedDB operations)             │
│   - DatabaseService                  │
│   - UserRepository                   │
│   - ProductRepository                │
│   - OrderRepository, etc.            │
└─────────────────────────────────────┘
```

## Key Components

### 1. **APIInterceptor** (`core/interceptors/api.interceptor.ts`)

Intercepts all HTTP requests to `/api/*` endpoints and routes them to FakeBFFService.

```typescript
// Service makes normal HTTP request
this.http.post('/api/auth/login', { email, password })

// Interceptor catches it
if (request.url.startsWith('/api/')) {
  return from(this.fakeBFF.handleRequest(request))
}
```

**In production:**
- Remove APIInterceptor from app.config
- Change API base URL to real backend
- Everything else stays the same!

### 2. **FakeBFFService** (`core/bff/fake-bff.service.ts`)

Simulates a real REST API server. Routes requests to appropriate handlers.

```typescript
// Handles: POST /api/auth/login
async handleAuthLogin(req: HttpRequest)
  → Finds user in UserRepository
  → Validates password
  → Returns user + mock JWT token

// Handles: GET /api/products
async handleGetProducts(req: HttpRequest)
  → Queries ProductRepository.getAll()
  → Returns product list

// Handles: POST /api/orders
async handleCreateOrder(req: HttpRequest)
  → Creates order in OrderRepository
  → Returns created order
```

**API Endpoints Implemented:**

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

### 3. **Repositories** (`core/bff/repositories/`)

Handle all data persistence in IndexedDB.

- **BaseRepository<T>** — Abstract class with standard CRUD
- **UserRepository** — User queries + email index
- **ProductRepository** — Product queries + category index
- **OrderRepository** — Order queries + user/status indexes
- **CategoryRepository** — Category CRUD
- **CartRepository** — Cart operations (special: userId as key)

### 4. **DatabaseService** (`core/bff/database.service.ts`)

Wrapper around IndexedDB API with promise-based interface.

```typescript
// Initialize DB (called on app bootstrap)
await db.initialize()
  → Creates stores: users, products, orders, categories, cart, permissions

// Query operations
const user = await db.read('users', userId)
const products = await db.getAll('products')
const count = await db.count('users')
```

### 5. **AuthService** (`core/bff/services/auth.service.ts`)

Makes HTTP requests (intercepted by APIInterceptor → FakeBFF).

```typescript
// Service code stays the same!
async login(email: string, password: string) {
  return this.http
    .post('/api/auth/login', { email, password })
    .toPromise()
}

// In production: just remove APIInterceptor, points to real backend
```

## Migration Path: Development → Production

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

**What changes?**
1. ✅ Remove `{ provide: HTTP_INTERCEPTORS, useClass: APIInterceptor }` from `app.config.ts`
2. ✅ Add API base URL: `provideHttpClient(withBaseUrl('https://api.example.com'))`
3. ✅ Nothing else! Services stay identical

## Benefits

✅ **Zero coupling** — Services don't know about IndexedDB  
✅ **Easy testing** — Mock FakeBFF response without changing services  
✅ **Production-ready structure** — Mirrors real REST API  
✅ **Offline-first** — Demo works without backend  
✅ **Smooth migration** — Switch backends by removing interceptor  

## Demo Data Initialization

First app load triggers:

```
AuthService.initialize()
  → FakeBFF.initialize()
    → Check user count
      → If 0: run SeedService.seedAll()
        → seedUsers() + seedCategories() + seedProducts()
        → Populates IndexedDB with demo data
```

Demo users created:
- `user@demo` / password: `demo` (User role)
- `manager@demo` / password: `demo` (Manager role)
- `admin@demo` / password: `demo` (Admin role)

## Error Handling

FakeBFF returns standard HTTP responses:

```typescript
// Success
new HttpResponse({ status: 200, body: { products } })

// Not found
new HttpResponse({ status: 404, body: { error: 'Not found' } })

// Validation error
new HttpResponse({ status: 400, body: { error: 'Invalid parameters' } })

// Server error
new HttpResponse({ status: 500, body: { error: 'Internal server error' } })
```

## When to Use FakeBFF?

✅ **Great for:**
- Development & testing without backend
- UI component development
- Learning Angular patterns
- Prototypes & MVPs
- Demo environments

❌ **NOT suitable for:**
- Production (use real backend!)
- Real-time sync (doesn't handle concurrent updates)
- Large datasets (IndexedDB isn't optimized for heavy data)

## Real Backend Implementation

When you create a real backend, follow the same structure:

```typescript
// Express example (packages/orders-bff/)
app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user || user.password !== req.body.password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
  res.json({ user, token })
})

// Your service doesn't change!
// Just remove APIInterceptor
```

---

**See also:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Overall system design
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — Building features on top of FakeBFF
