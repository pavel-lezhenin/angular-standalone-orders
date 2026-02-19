# Phase 2 Implementation Plan

> Orders management with RBAC, IndexedDB BFF, admin dashboard, public shop.

**Status:** In Progress (~90% complete)  
**See detailed status:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## 🏗️ Architecture

**Data Layer:** IndexedDB (7 stores: users, products, orders, categories, cart, order_items, permissions)

**BFF Layer:** `src/bff/` - Repositories, FakeBFFService, domain models  
**Core Layer:** `src/core/` - DTOs, services (auth, permission), guards, interceptors  
**Areas Layer:** `src/areas/` - auth (public), landing (public), shop (user), orders (user), account (user), admin (manager/admin)  
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

/shop                       → Public (no auth needed — guests can browse)
  /                         → Products list + filter
  /product/:id              → Product detail

/orders                     → Mixed access
  /                         → Order history (authGuard)
  /cart                     → Shopping cart (public)
  /checkout                 → Checkout (public — auth at submit)
  /payment                  → Payment (public)
  /details/:id              → Order details (authGuard)
  /confirmation/:id         → Order confirmation (authGuard)

/account                    → Guard: authGuard
                            → Profile, addresses, payment methods

/admin                      → Guard: authGuard + (admin || manager)
  /                         → Admin layout (sidebar + outlet)
  /dashboard                → Dashboard (latest orders, stats)
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

| # | Phase | Duration | Status | Progress |
|---|-------|----------|--------|----------|
| 2.1 | BFF Foundation | 2h | ✅ Done | 100% |
| 2.2 | Authentication | 1.5h | ✅ Done | 100% |
| 2.3 | Landing Page | 0.5h | ✅ Done | 100% |
| 2.4 | Shop Module | 3h | ✅ Mostly done | 95% (cart/checkout/payment implemented) |
| 2.5 | Shared UI | 2h | ✅ Done | 100% |
| 2.6 | Admin Layout | 1h | ✅ Done | 100% |
| 2.7 | Dashboard | 1h | ⏸️ Partial | 30% (needs widgets) |
| 2.8 | Customers | 1h | ✅ Done | 100% |
| 2.9 | Permissions | 1.5h | ✅ Done | 95% |
| 2.10 | Orders Board | 2.5h | ✅ Done | 100% (Kanban + drag-drop + validation) |
| 2.11 | Products | 1.5h | ✅ Done | 100% |
| 2.12 | Categories | 1h | ✅ Done | 100% |
| 2.13 | Seed Data | 1h | ✅ Done | 100% |
| 2.14 | Tests & Polish | 2h | ⏸️ Partial | 25% |

**See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for remaining tasks and priorities.**

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
