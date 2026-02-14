# Phase 2 Implementation Plan

> Orders management with RBAC, IndexedDB BFF, admin dashboard, public shop.

**Status:** In Progress (~58% complete)

---

## 🏗️ Architecture

**Data Layer:** IndexedDB (7 stores: users, products, orders, categories, cart, order_items, permissions)

**BFF Layer:** `src/bff/` - Repositories, FakeBFFService, domain models  
**Core Layer:** `src/core/` - DTOs, services (auth, permission), guards, interceptors  
**Areas Layer:** `src/areas/` - auth (public), shop (user), admin (manager/admin)  
**Shared Layer:** `src/shared/` - Reusable UI components, services, utils

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details.

---

## 🔐 Role-Based Access Control

### Roles & Permissions Matrix

| Role | Cart | Profile | Orders (Own) | Orders (All) | Cancelled Orders | Customers | Products | Categories |
|------|------|---------|--------|----------|----------|-----------|----------|-----------|
| **User** | ⚙️ CRUD | ✏️ Edit | 👁️ View, ✏️ Cancel | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manager** | ❌ | ❌ | ❌ | 👁️ View, ✏️ Edit (status) | 👁️ View | ❌ | ⚙️ CRUD | ⚙️ CRUD |
| **Admin** | ⚙️ CRUD | ⚙️ CRUD | ⚙️ CRUD | ⚙️ CRUD | ⚙️ CRUD | ⚙️ CRUD | ⚙️ CRUD | ⚙️ CRUD |

**Legend:**
- 👁️ View = Read-only access
- ✏️ Edit = Can modify specific fields
- ✏️ Cancel = Can cancel own orders
- ✏️ Edit (status) = Can change order status (queue → processing → completed)
- ⚙️ CRUD = Create, Read, Update, Delete (full access)
- ❌ = No access

**Notes:**
- Cart = User manages own, admin manages all
- Orders (Own) = User's orders only
- Orders (All) = Admin/manager scope
- Manager can change order status (queue → processing → completed)

---

## 🗂️ Complete Routing Structure

```
/                           → Landing (no auth needed)
/auth
  /login                    → Login form

/shop                       → Guard: authGuard
  /                         → Products list + filter
  /product/:id              → Product detail modal
  /cart                     → Shopping cart
  /profile                  → User profile + orders history

/admin                      → Guard: authGuard + (admin || manager)
  /                         → Admin layout (sidebar + outlet)
  /dashboard                → Dashboard (5 latest orders, stats)
  /customers                → Customers table (admin only)
  /permissions              → Permissions matrix (admin only)
  /orders                   → Trello orders board (drag-drop)
  /products                 → Products manager
  /categories               → Categories manager (admin only)
```



---

## 🎯 Implementation Phases

**Total Duration:** ~21 hours (14 sequential phases)

For detailed implementation steps, deliverables, and code examples, see **[IMPLEMENTATION.md](./IMPLEMENTATION.md)**.

| # | Phase | Duration | Key Focus |
|---|-------|----------|-----------|
| 2.1 | BFF Foundation | 2h | IndexedDB, repositories, services |
| 2.2 | Authentication | 1.5h | Login, guards, session |
| 2.3 | Landing Page | 0.5h | Home page |
| 2.4 | Shop Module | 3h | Products, cart, checkout |
| 2.5 | Shared UI | 2h | Reusable components |
| 2.6 | Admin Layout | 1h | Sidebar, routing |
| 2.7 | Dashboard | 1h | Stats widgets |
| 2.8 | Customers | 1h | ✅ 100% | User management |
| 2.9 | Permissions | 1.5h | RBAC matrix |
| 2.10 | Orders Board | 2.5h | Trello drag-drop |
| 2.11 | Products | 1.5h | CRUD, image upload |
| 2.12 | Categories | 1h | ✅ 100% | Category management |
| 2.13 | Seed Data | 1h | Demo data |
| 2.14 | Tests & Polish | 2h | Coverage, E2E, build |

---

## 🛠️ Dependencies Required

### Already Installed
- @angular/core 21.1
- @angular/router
- @angular/forms (Reactive Forms)
- @angular/material 21.1.3
- TypeScript 5.9

### Need to Add
```bash
cd packages/angular-standalone-orders
pnpm add @angular/cdk uuid
```

---

## ✅ Next Steps

1. **Review architecture** - Confirm data layer, RBAC, routing
2. **Install dependencies** - `@angular/cdk`, `uuid`
3. **Follow [IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Sequential phases with code examples
4. **Testing** - Write tests as we go (TDD)

---

**Ready to start?** See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for Phase 2.1 details!
