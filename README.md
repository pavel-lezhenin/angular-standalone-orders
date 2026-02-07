# Angular Orders Management Platform

> **Production-ready Angular template** — Full-stack orders management system with RBAC, IndexedDB BFF, and modern Angular 21 patterns.

**Part of [Front-Templates](../../) collection** — Enterprise-grade template with proven architecture patterns.

## 🎯 What Is This?

A **mid-sized Angular application template** demonstrating:

- ✅ **Modern Angular 21** — Standalone components, signals, reactive patterns
- ✅ **Layered architecture** — Core/Features/Shared/Pages with clear boundaries
- ✅ **Role-based access control** — RBAC system with 3 roles (user/manager/admin)
- ✅ **IndexedDB BFF layer** — Offline-first with repositories pattern
- ✅ **Enterprise patterns** — Guards, interceptors, error handling, testing
- ✅ **TypeScript strict mode** — Full type safety throughout

**Best for:** Learning, prototypes, MVPs, admin dashboards, internal tools

**Not for:** Public SaaS, high-traffic sites, real-time collaboration — [see limitations](./docs/USE_CASES.md)

## 🚀 Quick Start

```bash
# Clone, install root deps
git clone --recursive <repo> && cd front-templates && pnpm install

# Navigate to package (IMPORTANT!)
cd packages/angular-standalone-orders

# Install package deps (separate pnpm-lock.yaml)
pnpm install

# Start dev server
pnpm dev  # http://localhost:4200

# Demo users
user@demo / demo        (User role)
manager@demo / demo     (Manager role)
admin@demo / demo       (Admin role)
```

## 📚 Documentation

**Start here if you want to:**

| Goal | Read |
|------|------|
| Understand the data layer | [docs/FAKEBFF_ARCHITECTURE.md](./docs/FAKEBFF_ARCHITECTURE.md) |
| Understand overall architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| Build Phase 2 features | [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md) |
| See what you can/can't do | [docs/USE_CASES.md](./docs/USE_CASES.md) |
| Deep dive into design | [docs/PHASE2_PLAN.md](./docs/PHASE2_PLAN.md) |

## 🏗️ Architecture (30 Seconds)

### 💻 Development (Current)
```
UI Components (Pages, Features, Shared)
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
UI Components (Pages, Features, Shared)
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
src/app/
├── core/
│   ├── bff/                           # Data layer (IndexedDB)
│   │   ├── database.service.ts        # IndexedDB wrapper
│   │   ├── fake-bff.service.ts        # Mock REST API
│   │   ├── repositories/              # CRUD operations
│   │   │   ├── base.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── seed.service.ts        # Demo data
│   │   │   └── index.ts
│   │   ├── models/                    # TypeScript types
│   │   └── index.ts
│   │
│   ├── services/                      # Application logic
│   │   ├── auth.service.ts            # Authentication
│   │   ├── permission.service.ts      # RBAC
│   │   └── index.ts
│   │
│   ├── guards/                        # Route protection
│   │   ├── auth.guard.ts              # Require login
│   │   ├── admin.guard.ts             # Require admin role
│   │   └── permission.guard.ts        # Custom permissions
│   │
│   └── interceptors/                  # HTTP middleware
│       └── api.interceptor.ts         # Routes /api/* to FakeBFF
│
├── features/                          # Lazy-loaded modules
│   ├── auth/                          # Login page + forms
│   ├── shop/                          # Products + Cart
│   └── admin/                         # Dashboard + Management
│
├── shared/                            # Reusable components & utils
├── pages/                             # Route container components
└── app.routes.ts                      # Root routing config
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full details.

## 🔐 Role-Based Access Control

| Feature | User | Manager | Admin |
|---------|------|---------|-------|
| Shop (Products, Cart) | ✅ | ✅ | ✅ |
| Profile Edit | ✅ | — | ✅ |
| Orders (Own) | ✅ | — | ✅ |
| Orders (All, Manage) | — | ✅ | ✅ |
| Cancelled Orders | — | ✅ | ✅ |
| Customers | — | — | ✅ |
| Products | — | ✅ | ✅ |
| Categories | — | ✅ | ✅ |

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#permissions-matrix) for detailed permissions.

## 📋 Phase 2 Includes

- **BFF Layer** — IndexedDB with 5 repositories (user, product, order, category, cart)
- **Auth Module** — Login, session, guards, 3 demo users
- **Shop** — Products with filter, cart, checkout
- **Admin Dashboard** — Stats, 5 latest orders
- **Orders Board** — Trello-like with drag-drop (CDK)
- **Customers, Products, Categories** — Full CRUD
- **Permissions Matrix** — RBAC UI
- **Shared Components** — Table, modal, sidebar, filter-panel, trello-board
- **Tests** — 80%+ coverage target

**Duration:** ~21 hours (14 sequential phases)

## 🛠️ Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier

# Testing
pnpm test         # Unit tests
pnpm test:watch   # Watch mode
pnpm e2e          # Playwright E2E tests
pnpm test:cov     # Coverage report
```

## 💡 Key Patterns

### Signals for State
```typescript
users$ = signal<User[]>([]);
userCount = computed(() => this.users$().length);
effect(() => console.log(`Users: ${this.userCount()}`));
```

### Repository Pattern
```typescript
async getProducts(): Promise<Product[]> {
  return this.productRepository.getAll();  // All data ops go here
}
```

### Route Guards
```typescript
canActivate: [authGuard, adminGuard]  // Protect sensitive routes
```

### Lazy Loading
```typescript
{ path: 'admin', loadComponent: () => import('./admin-layout.component') }
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for more patterns.

## ⚠️ Important Limitations

**This template is NOT suitable for:**

- ❌ High-traffic public sites (scalability limited by IndexedDB)
- ❌ Multi-device sync (data lives only in browser)
- ❌ Real-time collaboration (no WebSockets)
- ❌ Sensitive financial data (client-side only)
- ❌ Mobile apps (web app only)

**To use in production:**
1. Replace IndexedDB with REST/GraphQL API
2. Implement secure authentication (OAuth/JWT)
3. Move sensitive data to backend
4. Add WebSockets for real-time

See [docs/USE_CASES.md](./docs/USE_CASES.md) for full analysis + migration guide.

## 🧪 Testing

**Targets:**
- BFF services: 90%+ coverage
- Guards: 85%+ coverage
- Components: 70%+ coverage
- Overall: 80%+

```bash
pnpm test          # Run all tests
pnpm test:cov      # Coverage report
pnpm e2e           # E2E tests (3 user journeys)
```

## 📊 Bundle Size

```
Core Angular:     ~150KB
App code:         ~100KB
Gzipped total:    ~65KB
```

## 🚨 Current Status

| Component | Status |
|-----------|--------|
| Phase 1 setup | ✅ Complete |
| Phase 2 planning | ✅ Complete |
| Phase 2 implementation | 🚧 Ready to start |

## 🤝 Contributing

Follow these when adding features:

1. ✅ Keep to the architecture (Core/Shared/Features)
2. ✅ Write tests (80%+ target)
3. ✅ Use TypeScript strict mode
4. ✅ Use signals, not BehaviorSubject
5. ✅ Keep files < 300 lines
6. ✅ Use reactive forms
7. ✅ Make mobile responsive

See [AGENTS.md](./AGENTS.md) for detailed guidelines.

## 📖 Learning Resources

This template teaches:

- Angular 21 standalone components
- Signals & computed properties
- Repository pattern
- RBAC implementation
- Guards & interceptors
- Lazy loading
- Reactive forms
- Testing strategy
- Layered architecture

**Great for:** Learning modern Angular patterns.

## 🔗 Links

- **Root docs:** [../../docs/](../../docs/)
- **Architecture deep dive:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Implementation roadmap:** [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)
- **Use cases & limitations:** [docs/USE_CASES.md](./docs/USE_CASES.md)
- **Complete plan:** [docs/PHASE2_PLAN.md](./docs/PHASE2_PLAN.md)
- **AI agents:** [AGENTS.md](./AGENTS.md)

## 📄 License

MIT — See [../../LICENSE](../../LICENSE)

---

**Ready to build?** Start with [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the design, then [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md) for Phase 2 features.
