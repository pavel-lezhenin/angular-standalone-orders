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

### Feature Modules

```
features/
├── auth/
│   ├── login.component.ts (Email/password form)
│   ├── login.component.html
│   ├── login.component.scss
│   └── auth.routes.ts
│
├── shop/
│   ├── products-list.component.ts (Grid with filtering)
│   ├── product-detail.component.ts (Product modal/page)
│   ├── cart.component.ts (Shopping cart + checkout)
│   ├── user-profile.component.ts (Orders history + profile)
│   ├── category-filter.component.ts (Filter sidebar)
│   └── shop.routes.ts
│
└── admin/
    ├── admin-layout.component.ts (Main admin container + sidebar)
    ├── admin.routes.ts
    ├── dashboard/
    │   ├── dashboard.component.ts (5 latest orders, counters)
    │   ├── dashboard.component.html
    │   └── dashboard.component.scss
    ├── customers/
    │   ├── customers.component.ts (User table)
    │   ├── customer-edit.component.ts (Role/delete modal)
    │   ├── customers.component.html
    │   └── customers.component.scss
    ├── permissions/
    │   ├── permissions.component.ts (Role×Section×Action matrix)
    │   ├── permissions.component.html
    │   └── permissions.component.scss
    ├── orders/
    │   ├── orders-board.component.ts (Drag-drop Trello board)
    │   ├── order-detail.component.ts (Order details modal)
    │   ├── orders-board.component.html
    │   └── orders-board.component.scss
    ├── products/
    │   ├── products.component.ts (Product table)
    │   ├── product-edit.component.ts (Edit/create modal with image upload)
    │   ├── products.component.html
    │   └── products.component.scss
    └── categories/
        ├── categories.component.ts (Category table)
        ├── category-edit.component.ts (Edit/create modal)
        ├── categories.component.html
        └── categories.component.scss
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

## 🎯 Implementation Phases (Sequential)

**Total Duration:** ~21 hours  
**14 Sequential Phases**

| # | Phase | Duration | Key Deliverables |
|---|-------|----------|------------------|
| 2.1 | BFF Foundation | 2h | Database, repositories, services |
| 2.2 | Authentication | 1.5h | Login, guards, session |
| 2.3 | Landing Page | 0.5h | Home page, navigation |
| 2.4 | Shop Module | 3h | Products, cart, checkout |
| 2.5 | Shared UI | 2h | Reusable components |
| 2.6 | Admin Layout | 1h | Sidebar, routing |
| 2.7 | Dashboard | 1h | Stats, widgets |
| 2.8 | Customers | 1h | User management |
| 2.9 | Permissions | 1.5h | RBAC matrix |
| 2.10 | Orders Board | 2.5h | Trello drag-drop |
| 2.11 | Products | 1.5h | CRUD, image upload |
| 2.12 | Categories | 1h | Category management |
| 2.13 | Seed Data | 1h | Demo data |
| 2.14 | Tests & Polish | 2h | Coverage, E2E, build |

---

### Phase 2.1: BFF Foundation (Database + Services)
- [ ] Create IndexedDB database.service.ts
- [ ] Implement all repositories (user, product, order, category, cart)
- [ ] Create permission.service.ts
- [ ] Create seed.service.ts with demo data
- [ ] Create auth.service.ts (session management)
- [ ] **Tests:** Unit tests for database, repositories (target 80%+ coverage)

### Phase 2.2: Authentication & Guards
- [ ] Create features/auth/login.component
- [ ] Create auth.guard.ts (require login)
- [ ] Create admin.guard.ts (require admin/manager)
- [ ] Create auth.interceptor.ts (mock token injection)
- [ ] Setup auth routing

### Phase 2.3: Landing Page
- [ ] Create pages/landing.component
- [ ] Check authentication status on load
- [ ] Show "Shop" button (conditional)
- [ ] Show "Admin" link (if admin/manager)
- [ ] App information display

### Phase 2.4: Shop Module
- [ ] Create shop/products-list.component (grid view)
- [ ] Create shop/category-filter.component (reactive filter)
- [ ] Create shop/product-detail.component (modal or page)
- [ ] Create shop/cart.component (display + checkout)
- [ ] Create shop/user-profile.component (order history)
- [ ] **Reactive Forms:** Products filter, checkout form
- [ ] **Signals:** cart$, products$, categories$

### Phase 2.5: Shared UI Components
- [ ] Create shared/ui/table.component (generic data table)
- [ ] Create shared/ui/modal.component (reusable modal wrapper)
- [ ] Create shared/ui/sidebar.component (admin navigation)
- [ ] Create shared/ui/filter-panel.component
- [ ] Create shared/ui/trello-board.component (CDK drag-drop)
- [ ] Create basic button, form-field, badge components

### Phase 2.6: Admin Layout & Routing
- [ ] Create features/admin/admin-layout.component
- [ ] Admin sidebar with role-based menu
- [ ] Setup admin.routes.ts with nested routes
- [ ] All route guards in place
- [ ] Responsive layout (desktop-first)

### Phase 2.7: Admin Dashboard
- [ ] Dashboard component with 5 latest orders widget
- [ ] Counters: new orders, total customers, total products
- [ ] Stats cards with icons
- [ ] Quick actions (View all orders, Manage products)

### Phase 2.8: Admin Customers Management
- [ ] Customers table component (table.component reuse)
- [ ] Columns: Email, Role, Created, Actions
- [ ] Edit modal: Change role (user/manager/admin)
- [ ] Delete action (confirmation modal)
- [ ] **Guard:** Admin only

### Phase 2.9: Admin Permissions Matrix
- [ ] Permissions table: Role × Section × Action
- [ ] Toggle switch for each permission
- [ ] Load from permission.service
- [ ] Update in permission.repository
- [ ] **Signals:** permissions$ signal for reactivity
- [ ] **Guard:** Admin only

### Phase 2.10: Admin Orders Board (Trello-like)
- [ ] Orders board with 3 columns: Queue → Processing → Completed
- [ ] Drag-drop using @angular/cdk/drag-drop
- [ ] Card: Order #ID, Customer, Total, Items count
- [ ] On drop: updateStatus() → IndexedDB update
- [ ] Click card → Order detail modal
- [ ] Order detail modal: Customer info, items list, timestamps
- [ ] **Guard:** Admin & Manager

### Phase 2.11: Admin Products Manager
- [ ] Products table (table.component reuse)
- [ ] Columns: Name, Price, Category, Image, Created, Actions
- [ ] Edit modal: Name, Description, Price, Category, Image upload
- [ ] Image upload → base64 encoding
- [ ] Category dropdown (with create new option)
- [ ] Delete action
- [ ] **Guard:** Admin & Manager

### Phase 2.12: Admin Categories Manager
- [ ] Categories table (table.component reuse)
- [ ] Columns: Name, Products count, Created, Actions
- [ ] Edit modal: Name, Description, Settings (JSON textarea)
- [ ] Add new category
- [ ] Delete category (if no products)
- [ ] **Guard:** Admin only

### Phase 2.13: Seed Data & Demo Users
- [ ] Demo Users:
  - user@demo (password: "demo") → User role
  - manager@demo (password: "demo") → Manager role
  - admin@demo (password: "demo") → Admin role
- [ ] Demo Categories: Electronics, Clothing, Books, Home
- [ ] Demo Products: 10-15 products across categories
- [ ] Run seed on first app load (check IndexedDB version)

### Phase 2.14: Full Integration & Testing
- [ ] E2E tests: Auth flow, Shop flow, Admin flow
- [ ] Unit tests for all repositories + services (80%+ coverage)
- [ ] Performance: Lazy load all feature routes
- [ ] Error handling: Try-catch, proper error messages
- [ ] Loading states: Spinners, skeletons
- [ ] Mobile responsive (TailwindCSS)

---

## 🛠️ Dependencies Required

### Already Installed
- @angular/core 21.1
- @angular/router
- @angular/forms (Reactive Forms)
- @angular/signals
- TypeScript 5.9

### Need to Add
```json
{
  "@angular/cdk": "^21.0.0",           // Drag-drop, virtual scroll
  "uuid": "^9.0.0"                     // Generate IDs
}
```

Command to install:
```bash
cd packages/angular-standalone-orders
pnpm add @angular/cdk uuid
```

---

## 📝 Key Implementation Details

### IndexedDB Schema Version
```typescript
// Version: 1
// On version upgrade, check if tables exist, create if missing
// First-time users: Seed demo data
// Returning users: Skip seed
```

### Image Handling
- Upload via input[type="file"]
- Convert to base64 with FileReader API
- Store in product.image (string)
- Display in <img [src]="'data:image/...'">

### Form Validation
```typescript
// Use Reactive Forms + Zod for validation
// login: email, password (required)
// product: name, price (required), category, description
// permissions: toggle booleans
```

### Drag-Drop Implementation
```typescript
// @angular/cdk/drag-drop
// cdkDropListGroup on board container
// cdkDropList for each column
// On drop: updateOrder.status, refresh board
```

### Responsive Design
```
Desktop:  table views, 2-3 column layouts
Tablet:   collapsed tables, 1.5 column layouts
Mobile:   stacked views, single column
```

---

## 🧪 Testing Strategy

### Unit Tests (target 80%+ coverage)
- `database.service.spec.ts` - IndexedDB operations
- `*repository.spec.ts` - Each repository (CRUD operations)
- `permission.service.spec.ts` - Access checking logic
- `auth.service.spec.ts` - Session management
- `*.guard.spec.ts` - Route guards

### Component Tests
- Login form validation
- Product filter reactivity
- Cart calculations
- Order status updates (drag-drop)

### E2E Tests (Playwright)
- Complete user journey: Login → Browse → Add to cart → Checkout
- Complete admin journey: Login → Dashboard → Edit product → Update order
- Permission-based navigation (redirects)

### Coverage Targets
- BFF services: 90%+
- Guards: 85%+
- Components: 70%+
- Overall: 80%+

---

## 🚀 Success Criteria

### Phase 2.1 (BFF)
- ✅ IndexedDB initialized on app load
- ✅ Demo data seeded on first load
- ✅ All repositories working (CRUD operations)
- ✅ Permission service returns correct access levels

### Phase 2.2 (Auth)
- ✅ Login form validates email/password
- ✅ Session created in sessionStorage
- ✅ Guards redirect unauthenticated users to /auth/login
- ✅ Demo users: user@demo, manager@demo, admin@demo

### Phase 2.4 (Shop)
- ✅ Products load from IndexedDB
- ✅ Filter by category works reactively
- ✅ Add to cart → updates cart signal
- ✅ Checkout → creates order in IndexedDB
- ✅ User profile shows order history

### Phase 2.10 (Orders Board)
- ✅ Drag-drop updates order.status
- ✅ Column counts update after drop
- ✅ Click card → shows order details
- ✅ Refreshing page preserves board state (from IndexedDB)

### Phase 2.13 (Full App)
- ✅ All roles navigate to correct sections
- ✅ Admin can manage users, products, categories
- ✅ Manager can view dashboard, manage orders/products
- ✅ User can shop and see their order history
- ✅ No hardcoded data (all from IndexedDB)
- ✅ 80%+ test coverage on BFF layer

---

## 📅 Time Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| 2.1   | 2 hours  | Database setup + repositories |
| 2.2   | 1.5 hrs  | Auth module + guards |
| 2.3   | 0.5 hrs  | Simple landing page |
| 2.4   | 3 hours  | Shop module (all components) |
| 2.5   | 2 hours  | Shared UI components |
| 2.6   | 1 hour   | Admin layout + routing |
| 2.7   | 1 hour   | Dashboard widget |
| 2.8   | 1 hour   | Customers table |
| 2.9   | 1.5 hrs  | Permissions matrix |
| 2.10  | 2.5 hrs  | Trello orders board (CDK) |
| 2.11  | 1.5 hrs  | Products manager |
| 2.12  | 1 hour   | Categories manager |
| 2.13  | 1 hour   | Seed data integration |
| 2.14  | 2 hours  | Tests + integration + polish |
| **Total** | **~21 hours** | Can be parallelized |

---

## ✅ Next Steps

1. **Review this plan** - Confirm architecture, make adjustments
2. **Install dependencies** - `@angular/cdk`, `uuid`
3. **Phase 2.1 Start** - Implement BFF layer
4. **Sequential phases** - Follow the implementation phases
5. **Testing** - Write tests as we go (TDD where possible)
6. **Integration** - Connect all modules at the end

---

## 📌 Important Notes

- ✅ Each file should be max 300 lines
- ✅ TypeScript strict mode enabled
- ✅ All public functions need explicit return types
- ✅ Prefer signals for reactivity (not BehaviorSubject)
- ✅ Use lazy loading for all feature routes
- ✅ No hardcoded secrets or passwords in code (seed service only for demo)
- ✅ All tables use `table.component` (reusable)
- ✅ All modals use `modal.component` (reusable)
- ✅ Accessibility: Labels, ARIA, keyboard navigation
- ✅ Mobile responsive (TailwindCSS breakpoints)

---

**Ready to start Phase 2.1?** Confirm this plan and we'll begin implementing the BFF layer!
