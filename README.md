# Angular Orders Management Platform

> **Production-ready Angular template** — Full-stack orders management system with RBAC, IndexedDB BFF, and modern Angular 21 patterns.

**Part of [Front-Templates](../../) collection** — Enterprise-grade template with proven architecture patterns.

## 🎯 What Is This?

A **mid-sized Angular application template** demonstrating:

- ✅ **Modern Angular 21** — Standalone components, signals, reactive patterns
- ✅ **Layered architecture** — Areas/Shared/Core/BFF with clear boundaries
- ✅ **Role-based access control** — RBAC system with 3 roles (user/manager/admin)
- ✅ **IndexedDB BFF layer** — Offline-first with repositories pattern
- ✅ **Enterprise patterns** — Guards, interceptors, error handling, testing
- ✅ **TypeScript strict mode** — Full type safety throughout

**Best for:** Learning, prototypes, MVPs, admin dashboards, internal tools

**Not for:** Public SaaS, high-traffic sites, real-time collaboration — [see limitations](./docs/USE_CASES.md)

## 🚀 Quick Start

```bash
# Clone the repo
git clone --recursive <repo>

# Navigate INTO the package (IMPORTANT! Never run commands from root)
cd front-templates/packages/angular-standalone-orders

# Install package deps (isolated pnpm-lock.yaml)
pnpm install

# Start dev server
pnpm dev  # http://localhost:4200

# Demo users
user@demo / demo        (User role)
manager@demo / demo     (Manager role)
admin@demo / demo       (Admin role)
```

## 📚 Documentation

| Goal | Read |
|------|------|
| **Project status & progress** | [docs/PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) ⭐ |
| Understand data layer | [docs/FAKEBFF_ARCHITECTURE.md](./docs/FAKEBFF_ARCHITECTURE.md) |
| Overall architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| Build features | [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md) |
| AI project rules | [docs/AGENTS.md](./docs/AGENTS.md) |
| Limitations & when to use | [docs/USE_CASES.md](./docs/USE_CASES.md) |

## 🏗️ Architecture (30 Seconds)

### 💻 Development (Current)
```
UI Components (Areas, Shared)
    ↓
Feature Services (make HTTP requests to /api/*)
    ↓
APIInterceptor (dev-only, routes to FakeBFF)
    ↓
FakeBFFService (simulates REST API)
    ↓
Repositories + DatabaseService
    ↓
IndexedDB (Single Source of Truth)
```

### 🚀 Production (Future)
```
UI Components (Areas, Shared)
    ↓
Feature Services (make HTTP requests to /api/*)
    ↓
Real Backend (packages/orders-bff/)
    ↓
Real Database (PostgreSQL, MongoDB, etc)
```

**Key principle:** 
- Services make **normal HTTP requests** to `/api/` endpoints
- In **development**: APIInterceptor routes them to FakeBFFService
- In **production**: remove interceptor, real backend handles requests
- **Zero coupling** to mock layer — no code changes needed!

**Migration to Production:**
1. Create `packages/orders-bff/` (Express.js backend)
2. Implement same `/api/*` endpoints as FakeBFFService
3. Remove APIInterceptor from `app.config.ts`
4. Update API base URL in providers
5. Frontend code stays unchanged ✅

See [FAKEBFF_ARCHITECTURE.md](./docs/FAKEBFF_ARCHITECTURE.md) and [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## 📐 File Structure

```
src/
├── core/
│   ├── models/                        # DTOs
│   │   ├── user.dto.ts
│   │   ├── permission.dto.ts
│   │   ├── cart.dto.ts
│   │   └── index.ts
│   │
│   ├── types/                         # Shared types
│   │   └── shared-types.ts            # UserRole, OrderStatus
│   │
│   ├── services/                      # Application logic
│   │   ├── auth.service.ts
│   │   └── permission.service.ts
│   │
│   ├── guards/                        # Route protection
│   │   └── index.ts                   # authGuard, adminGuard
│   │
│   └── interceptors/                  # HTTP middleware
│       └── api.interceptor.ts         # Routes /api/* to FakeBFF
│
├── bff/                               # Data layer (IndexedDB)
│   ├── models/                        # Domain models
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── order.ts
│   │
│   ├── database.service.ts            # IndexedDB wrapper
│   ├── fake-bff.service.ts            # Mock REST API
│   │
│   └── repositories/                  # CRUD operations
│       ├── base.repository.ts
│       ├── user.repository.ts
│       └── product.repository.ts
│
├── areas/                             # Lazy-loaded modules
│   ├── auth/                          # Login, register
│   ├── shop/                          # Products, search
│   ├── orders/                        # Cart, checkout, payment, history
│   ├── account/                       # Profile, addresses, payment methods
│   ├── admin/                         # Dashboard + Management
│   └── landing/                       # Public home page
│
├── shared/                            # Reusable components & utils
├── app/                               # App root config
└── mocks/                             # MSW handlers
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full details.

## 🔐 RBAC

| Feature | User | Manager | Admin |
|---------|------|---------|-------|
| Shop (Products, Cart) | ✅ | ✅ | ✅ |
| Profile Edit | ✅ | — | ✅ |
| Orders (Own) | ✅ | — | ✅ |
| Orders (All) | — | ✅ | ✅ |
| Customers, Products, Categories | — | ✅/— | ✅ |

## ✅ What Was Built (Phase 2)

- **BFF Layer** — IndexedDB with 8 repositories (user, product, order, category, cart, address, payment-method, file)
- **Auth Module** — Login, session, guards, 3 demo users
- **Shop** — Products with filter, cart, checkout, payment
- **Orders** — Cart, checkout, payment, order history, order confirmation
- **Account** — Profile, address management, payment methods
- **Admin Dashboard** — Layout with sidebar, orders board (Kanban + drag-drop CDK)
- **Customers, Products, Categories** — Full CRUD
- **Permissions Matrix** — RBAC UI
- **Shared Components** — Table, modal, sidebar, filter-panel, trello-board
- **Tests** — In progress (target 80%+ coverage)

**See [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) for remaining tasks.**

## � Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm test         # Unit tests
pnpm e2e          # E2E tests
```

## ⚠️ Limitations

**NOT suitable for:**
- ❌ High-traffic public sites (IndexedDB limits)
- ❌ Multi-device sync (browser-only data)
- ❌ Real-time collaboration (no WebSockets)
- ❌ Sensitive financial data (client-side only)

**For production:** Add REST/GraphQL backend, OAuth/JWT auth, server-side data storage.

See [docs/USE_CASES.md](./docs/USE_CASES.md) for migration guide.

## 🧪 Testing

**Targets:** 80%+ overall coverage

```bash
pnpm test          # Run tests
pnpm test:cov      # Coverage report
pnpm e2e           # E2E tests
```

---

**Ready to build?** Start with [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) → [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)
