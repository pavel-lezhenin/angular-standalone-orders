# Angular Orders Management Platform — Phase 2 Implementation Plan

## 📋 Overview

Build a complete full-stack orders management application with role-based access control (user/manager/admin), IndexedDB BFF layer, admin dashboard with Trello-like orders board, and public shop with filtering.

**Status:** Planning Phase   

---

## 🏗️ Architecture Overview

### Data Layer (IndexedDB)

```
IndexedDB "OrdersDB" (v1)
├── users (id, email, password, role, profile, createdAt)
├── categories (id, name, description, settings)
├── products (id, name, description, price, categoryId, image, createdAt)
├── orders (id, userId, status, items, total, createdAt, updatedAt)
├── order_items (orderId, productId, quantity, price)
├── cart (userId, items, updatedAt)
└── permissions (id, role, section, action, granted)
```

### BFF Layer (Backend For Frontend)

```
app/core/bff/
├── models/
│   └── index.ts (User, Product, Order, Cart, Permission, Session types)
├── database.service.ts (IndexedDB initialization + lifecycle)
├── repositories/
│   ├── user.repository.ts (User CRUD)
│   ├── product.repository.ts (Product CRUD)
│   ├── order.repository.ts (Order CRUD)
│   ├── category.repository.ts (Category CRUD)
│   └── cart.repository.ts (Cart operations)
├── services/
│   ├── permission.service.ts (Permission checking)
│   ├── auth.service.ts (Session management)
│   └── seed.service.ts (Demo data initialization)
└── interceptors/
    └── auth.interceptor.ts (Token injection - mock)
```

### Areas Structure (RBAC-based)

```
areas/
├── auth/                     # Public area (authentication)
│   ├── auth.routes.ts
│   └── login/
│       ├── login.component.ts
│       ├── login.component.html
│       └── login.component.scss
│
├── shop/                     # User area (shopping)
│   ├── shop.routes.ts
│   ├── shop-layout.component.ts
│   ├── products/
│   │   └── products-list.component.ts
│   ├── cart/
│   │   └── cart.component.ts
│   ├── checkout/
│   │   └── checkout.component.ts
│   └── profile/
│       └── user-profile.component.ts
│
└── admin/                    # Admin/Manager area
    ├── admin.routes.ts
    ├── admin-layout.component.ts
    ├── dashboard/
    │   └── dashboard.component.ts
    ├── customers/
    │   ├── customers.component.ts
    │   └── customer-edit.component.ts
    ├── permissions/
    │   └── permissions.component.ts
    ├── orders/
    │   ├── orders-board.component.ts
    │   └── order-detail.component.ts
    ├── products/
    │   ├── products.component.ts
    │   └── product-edit.component.ts
    └── categories/
        ├── categories.component.ts
        └── category-edit.component.ts
```

### Shared Layer

```
shared/
├── ui/
│   ├── table.component.ts (Reusable data table)
│   ├── modal.component.ts (Generic modal wrapper)
│   ├── sidebar.component.ts (Admin sidebar navigation)
│   ├── filter-panel.component.ts (Product filter panel)
│   ├── trello-board.component.ts (Drag-drop board - CDK)
│   ├── button.component.ts
│   ├── form-field.component.ts
│   └── badge.component.ts
├── utils/
│   ├── permission.utils.ts (hasAccess(), getPermissions() helpers)
│   ├── validation.utils.ts (Form validators)
│   └── formatting.utils.ts (Price, date formatting)
└── types/
    └── index.ts (Shared TypeScript types)
```

### Core Guards & Services

```
app/core/
├── guards/
│   ├── auth.guard.ts (Require authentication)
│   ├── admin.guard.ts (Require admin/manager role)
│   └── permission.guard.ts (Custom permission check)
├── interceptors/
│   └── auth.interceptor.ts (Add token to requests)
└── config/
    └── app.config.ts (Providers setup)
```

### Pages Layer

```
pages/
├── landing.component.ts (Home page - check auth status, Shop button)
├── landing.component.html
└── landing.component.scss
```

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
- **Cart** = Shopping cart management (user can only manage own, admin can manage all)
- **Profile** = User profile editing (email, password, name)
- **Orders (Own)** = Only orders created by the current user (shop flow)
- **Orders (All)** = All orders in system (admin/manager scope)
- **Cancelled Orders** = Separate view for cancelled orders (manager sees reason, admin can restore)

### Permission System

```typescript
// permission.service.hasAccess(section: string, action: string): boolean
// Examples:
- hasAccess('cart', 'edit') → User can edit cart, Admin can edit any cart
- hasAccess('orders', 'edit') → Manager can change order status, Admin full access
- hasAccess('products', 'create') → Manager/Admin can create products

// Sections: cart, profile, orders, cancelled_orders, customers, products, categories
// Actions: view, create, edit, delete, cancel
```

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

## 📊 Entity Relationships

```
User
  ├─ Cart (1:1)
  ├─ Orders (1:many)
  └─ Permissions (through role)

Product
  ├─ Category (N:1)
  ├─ OrderItems (1:many)
  └─ CartItems (1:many)

Order
  ├─ User (N:1)
  ├─ OrderItems (1:many)
  └─ Updates (status changes tracked)

Category
  └─ Products (1:many)
```

---

## 🔄 Data Flow Examples

### Login Flow
```
1. User enters email/password → login.component
2. auth.service.login(email, password)
3. Validate in user.repository
4. Create session (JWT in sessionStorage)
5. auth.service emits authenticated$ signal
6. Router navigates to /shop (from returnUrl or default)
```

### Add to Cart Flow
```
1. User clicks "Add to Cart" on product
2. product-detail.component calls shop.service.addToCart(productId, quantity)
3. cart.repository.addItem(userId, item)
4. cart.component listens to cart$ signal, updates UI
5. User sees "X items in cart" badge
```

### Order Checkout Flow
```
1. User clicks "Checkout" in cart.component
2. Creates Order from cart items
3. order.repository.create(userId, items)
4. Clears cart with cart.repository.clear(userId)
5. Redirects to /shop/profile
6. Shows "Order #123 created" confirmation
7. Order appears in admin orders-board with status="queue"
```

### Manager Updates Order Status
```
1. Manager drags order card on orders-board.component
2. Triggers drag-drop event (CDK)
3. order.repository.updateStatus(orderId, newStatus)
4. IndexedDB updates order.status
5. orders-board.component detects change via signal
6. Board re-renders with updated status
```

### Admin Edits Product
```
1. Admin clicks "Edit" on product table row
2. product-edit.component opens modal with form
3. User uploads image → base64 conversion
4. Form validates (name, price, category required)
5. product.repository.update(productId, data)
6. IndexedDB updates product record
7. products-list.component refreshes from repository
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
| 2.8 | Customers | 1h | User management |
| 2.9 | Permissions | 1.5h | RBAC matrix |
| 2.10 | Orders Board | 2.5h | Trello drag-drop |
| 2.11 | Products | 1.5h | CRUD, image upload |
| 2.12 | Categories | 1h | Category management |
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
