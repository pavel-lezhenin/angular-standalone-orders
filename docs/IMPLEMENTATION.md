# Implementation Plan: Phase 2

> Complete roadmap for building the Orders Management Platform.  
> See [ARCHITECTURE.md](./ARCHITECTURE.md) for design details.

**Duration:** ~21 hours | **14 Phases** | **Progress:** ~58%

---

## 🎯 Status

**✅ Completed:** BFF, Auth, Landing, Admin Layout, Customers (CRUD), Categories (CRUD)  
**🚧 In Progress:** Shop, Dashboard, Orders Board, Products, Permissions  
**❌ Missing:** Tests (0% → target 80%), Phase 2.4 Shop, seed data

---

## 📋 Phase Overview

| # | Phase | Duration | Status | Key Deliverables |
|---|-------|----------|--------|------------------|
| 2.1 | BFF Foundation | 2h | ✅ 90% | Database, repositories, services |
| 2.2 | Authentication | 1.5h | ✅ 100% | Login, guards, session |
| 2.3 | Landing Page | 0.5h | ✅ 100% | Home page, navigation |
| 2.4 | Shop Module | 3h | ⚠️ 10% | Products, cart, checkout |
| 2.5 | Shared UI | 2h | ✅ 60% | Reusable components |
| 2.6 | Admin Layout | 1h | ✅ 100% | Sidebar, routing |
| 2.7 | Dashboard | 1h | ⚠️ 40% | Stats, widgets |
| 2.8 | Customers | 1h | ✅ 100% | User management |
| 2.9 | Permissions | 1.5h | ⚠️ 30% | RBAC matrix |
| 2.10 | Orders Board | 2.5h | ⚠️ 30% | Trello drag-drop |
| 2.11 | Products | 1.5h | ⚠️ 30% | CRUD, image upload |
| 2.12 | Categories | 1h | ✅ 100% | Category management |
| 2.13 | Seed Data | 1h | ❌ 0% | Demo data |
| 2.14 | Tests & Polish | 2h | ❌ 0% | Coverage, E2E, build |

**Overall Progress:** ~58% (12h / 21h estimated)

---

## 🎯 Current Status Summary

### ✅ Completed Components

**Core Infrastructure:**
- ✅ DatabaseService (IndexedDB setup)
- ✅ All repositories (User, Product, Order, Category, Cart)
- ✅ AuthService & PermissionService
- ✅ All guards (auth, admin, permission)
- ✅ SeedService

**Pages:**
- ✅ Landing page with full sections (Hero, Features, Use Cases, FAQ, Contact)
- ✅ Orders page (basic scaffold)
- ✅ Account page (profile management)

**Authentication:**
- ✅ Login component (areas/auth/login/)
- ✅ Login form with Material Design
- ✅ Auth routes configured
- ✅ Demo users setup (user@demo, manager@demo, admin@demo)

**Shared UI:**
- ✅ MainLayoutComponent
- ✅ TopBarComponent
- ✅ FooterComponent
- ✅ UserMenuComponent
- ✅ CartButtonComponent
- ✅ LayoutService & ScrollService

**Admin Area:**
- ✅ AdminLayoutComponent with sidebar (Phase 2.6 ✅)
- ✅ Admin routes fully configured
- ✅ CustomersComponent (Phase 2.8 ✅) - CRUD with pagination, filters, dialogs
- ✅ CategoriesComponent (Phase 2.12 ✅) - CRUD with validation, delete protection
- ⚠️ DashboardComponent (scaffold created)
- ⚠️ OrdersBoardComponent (scaffold created)
- ⚠️ ProductsComponent (scaffold created)
- ⚠️ PermissionsComponent (scaffold created)

### ⚠️ In Progress (Scaffolds Created, Need Implementation)
- Admin components: Dashboard, Orders Board, Products, Permissions
- Shop module needs implementation

### ❌ Not Started
- Unit tests (0% coverage - target 80-90%)
- E2E tests  
- Phase 2.4 - Shop Module (product catalog, cart, checkout)
- Phase 2.13 - Seed Data (demo data generation)
- Data integration for Dashboard, Orders Board, Products, Permissions
- Drag-drop functionality for Orders Board
- Permission matrix UI

---

## 🚀 Phase 2.1: BFF Foundation (2 hours)

**Goal:** Create data layer with IndexedDB and services

### Deliverables

- [x] `src/bff/database.service.ts` — IndexedDB initialization
- [x] `src/bff/repositories/base.repository.ts` — Base repository pattern
- [x] `src/bff/repositories/user.repository.ts` — User CRUD
- [x] `src/bff/repositories/product.repository.ts` — Product CRUD
- [x] `src/bff/repositories/order.repository.ts` — Order CRUD + status
- [x] `src/bff/repositories/category.repository.ts` — Category CRUD
- [x] `src/bff/repositories/cart.repository.ts` — Cart operations
- [x] `src/core/models/*.dto.ts` — DTOs for application layer
- [x] `src/core/services/permission.service.ts` — RBAC
- [x] `src/core/services/auth.service.ts` — Session management
- [x] `src/core/guards/` — Auth, admin, permission guards
- [ ] Unit tests

### Implementation Details
- DatabaseService: IndexedDB with 7 object stores, indexes, version upgrades
- Repositories: Standard CRUD pattern (getAll, getById, create, update, delete)
- Services: PermissionService (RBAC), AuthService (session management, signals)

### Patterns Used

- **ROUTING** — No lazy loading yet, simple service structure
- **FORMS** — Will be used in Phase 2.2 (login)
- **ERROR_HANDLING** — Service error states, try-catch blocks
- **AUTHENTICATION** — Session management via AuthService
- **PERFORMANCE** — Signals for reactive state updates

### Testing

```bash
# Unit tests cover:
✅ Database initialization
✅ Repository operations
✅ Service business logic
```

---

## 🔐 Phase 2.2: Authentication (1.5 hours) ✅ COMPLETED

**Goal:** Implement login/logout with session management in areas/auth/

### Deliverables

- [x] `areas/auth/login/login.component.ts` — Login form
- [x] `areas/auth/login/login.component.html` — Material form template
- [x] `areas/auth/login/login.component.scss` — Styling with gradient
- [x] `areas/auth/auth.routes.ts` — Auth routing
- [x] `app.routes.ts` — Auth routes imported and configured
- [ ] Unit tests (login component, auth service)
- [ ] E2E test (login flow)

### Patterns Used

- **ROUTING** — [Functional guards + lazy loading](../../../docs/framework/angular/patterns/ROUTING.md)
- **FORMS** — [Reactive Forms + validation](../../../docs/framework/angular/patterns/FORMS.md) in login.component
- **AUTHENTICATION** — [AuthService signals](../../../docs/framework/angular/patterns/AUTHENTICATION.md) + session management
- **ERROR_HANDLING** — Display invalid credentials error
- **ACCESSIBILITY** — Form labels with aria-describedby, error announcements

### Implementation Details
- Login Component: Reactive form (email, password, rememberMe) with validation
- Auth flow: Validate → login() → sessionStorage → redirect
- Guards: authGuard (redirect to login), adminGuard (check role: admin/manager)

### Demo Users

```
user@demo / demo → User role
manager@demo / demo → Manager role
admin@demo / demo → Admin role
```

### Success Criteria

- [x] Login form validates correctly
- [x] Session stored in sessionStorage
- [x] Auth guard redirects unauthenticated users (implemented)
- [x] Admin guard blocks regular users (implemented)
- [x] Demo users can login via UI
- [x] areas/auth folder created with login component

---

## 🏠 Phase 2.3: Landing Page (0.5 hours) ✅ COMPLETED

**Goal:** Create home page with navigation

### Deliverables

- [x] `pages/landing/landing.component.ts` — Main landing page component
- [x] `pages/landing/landing.component.html` — Template with semantic HTML
- [x] `pages/landing/landing.component.scss` — Styling
- [x] `pages/landing/components/hero-section/` — Hero section with CTA
- [x] `pages/landing/components/features-section/` — Features showcase
- [x] `pages/landing/components/use-cases-section/` — Use cases
- [x] `pages/landing/components/faq-section/` — FAQ section
- [x] `pages/landing/components/contact-section/` — Contact form
- [x] `shared/ui/footer/` — Footer component
- [x] `shared/services/layout.service.ts` — Layout state management
- [x] `shared/services/scroll.service.ts` — Smooth scrolling

### Patterns Used

- **ACCESSIBILITY** — [Semantic HTML, proper heading hierarchy](../../../docs/framework/angular/patterns/ACCESSIBILITY.md)
- **ROUTING** — Links to auth/shop/admin using routerLink

### Content
- Hero, Features, Use Cases, FAQ, Contact sections
- CTA buttons: Login (guest) / Shop (user) / Admin Panel (admin)
- Footer, smooth scrolling navigation

### Success Criteria

- ✅ Landing page loads with all sections
- ✅ Hero, Features, Use Cases, FAQ, Contact sections implemented
- ✅ Smooth scrolling navigation works
- ✅ Footer component created
- ✅ Layout service manages title and nav items

---

## 🛍️ Phase 2.4: Shop Module (3 hours)

**Goal:** Build product catalog, cart, and checkout

### Deliverables

- [ ] `features/shop/products-list.component` — Grid with filter
- [ ] `features/shop/category-filter.component` — Category sidebar
- [ ] `features/shop/product-detail.component` — Modal or page
- [ ] `features/shop/cart.component` — Shopping cart
- [ ] `features/shop/checkout.component` — Order creation (Reactive Forms)
- [ ] `features/shop/user-profile.component` — Orders history
- [ ] `features/shop/shop.routes.ts`

### Patterns Used

- **FORMS** — [Reactive Forms in checkout](../../../docs/framework/angular/patterns/FORMS.md) for address/payment
- **PERFORMANCE** — [OnPush + @for with track](../../../docs/framework/angular/patterns/PERFORMANCE.md) for products grid
- **ERROR_HANDLING** — Show validation errors in checkout form, handle cart save errors
- **ACCESSIBILITY** — Product images with alt text, form labels with aria-describedby

### Implementation Pattern
- ProductsList: signals for products/category, computed filteredProducts, addToCart()
- Cart: computed total, checkout() creates order → clears cart → redirects

### Success Criteria

- ✅ Products load and display
- ✅ Filter by category works
- ✅ Add to cart updates signal
- ✅ Cart calculations correct
- ✅ Checkout creates order
- ✅ Order appears in admin board

---

## 🧩 Phase 2.5: Shared UI Components (2 hours)

**Goal:** Create reusable components

### Deliverables

- [ ] `shared/ui/table.component.ts` — Generic data table with accessibility
- [ ] `shared/ui/modal.component.ts` — Modal wrapper (a11y focused)
- [ ] `shared/ui/sidebar.component.ts` — Navigation sidebar
- [ ] `shared/ui/filter-panel.component.ts` — Filter controls
- [ ] `shared/ui/trello-board.component.ts` — Drag-drop board (CDK)

### Patterns Used

- **PERFORMANCE** — [OnPush for all components](../../../docs/framework/angular/patterns/PERFORMANCE.md)
- **ACCESSIBILITY** — [ARIA roles, labels, focus management](../../../docs/framework/angular/patterns/ACCESSIBILITY.md) in table & modal
- **ERROR_HANDLING** — Empty states in table when no data

### Components
- Table: Generic data table with columns input, Edit/Delete outputs
- Modal: Overlay with title, isOpen input, onClose output
- Sidebar, FilterPanel, TrelloBoard (CDK drag-drop)

### Success Criteria

- ✅ Table component works in products
- ✅ Modal component works in edit dialogs
- ✅ Reusable across features
- ✅ Styling consistent

---

## 📐 Phase 2.6: Admin Layout (1 hour) ✅ COMPLETED

**Goal:** Create admin container with sidebar

### Deliverables

- [x] `areas/admin/admin-layout.component.ts` — Main layout
- [x] `areas/admin/admin-layout.component.html` — With role-based menu
- [x] `areas/admin/admin-layout.component.scss`
- [x] `areas/admin/admin.routes.ts` — Nested routes with guards

### Patterns Used

- **ROUTING** — [Nested routes in admin.routes.ts](../../../docs/framework/angular/patterns/ROUTING.md) with functional guards
- **PERFORMANCE** — [OnPush change detection](../../../docs/framework/angular/patterns/PERFORMANCE.md)
- **ACCESSIBILITY** — [Navigation landmarks](../../../docs/framework/angular/patterns/ACCESSIBILITY.md) (nav, main roles)

### Implementation
- AdminLayout: Sidebar with role-based menu (computed from PermissionService)
- Menu items: Dashboard, Orders, Products, Categories, Customers, Permissions
- Each item visibility based on hasAccess(section, 'view')

### Success Criteria

- ✅ Admin layout renders
- ✅ Sidebar shows role-based menu
- ✅ Routes load in outlet
- ✅ Navigation works

---

## 📊 Phase 2.7: Admin Dashboard (1 hour) ⚠️ SCAFFOLD CREATED

**Goal:** Create dashboard with stats

### Deliverables

- [x] `areas/admin/dashboard/dashboard.component.ts` — Scaffold created
- [x] `areas/admin/dashboard/dashboard.component.html` — Basic template
- [x] `areas/admin/dashboard/dashboard.component.scss` — Styling
- [ ] Data integration (connect to repositories)
- [ ] Load real stats from IndexedDB
- [ ] Display latest orders

### Content
- Stat cards: Orders count, Customers count, Products count
- Latest 5 orders table
- Load stats from repositories in ngOnInit()

### Success Criteria

- ✅ Stats load and display
- ✅ Latest orders show
- ✅ Numbers update correctly

---

## 👥 Phase 2.8: Admin Customers (1 hour) ⚠️ SCAFFOLD CREATED

**Goal:** Customer management table

### Deliverables

- [x] `areas/admin/customers/customers.component.ts` — Scaffold created
- [x] `areas/admin/customers/customers.component.html` — Basic template
- [x] `areas/admin/customers/customers.component.scss` — Styling
- [ ] Load users from UserRepository
- [ ] Display user table with filters
- [ ] Add/Edit/Delete user functionality
- [ ] Edit modal for changing roles

### Patterns Used

- **FORMS** — [Reactive Forms in customer-edit](../../../docs/framework/angular/patterns/FORMS.md) for role selection
- **ERROR_HANDLING** — Show delete confirmation, display save errors
- **ACCESSIBILITY** — Modal with proper focus management, form labels

### Implementation
- Users table with filters, Edit/Delete actions
- Edit modal for changing roles (Reactive Forms)
- Delete confirmation dialog

### Success Criteria

- ✅ Users table loads
- ✅ Edit modal works
- ✅ Role can be changed
- ✅ Users can be deleted
- ✅ Admin-only guard works

---

## 🔑 Phase 2.9: Permissions Matrix (1.5 hours) ⚠️ SCAFFOLD CREATED

**Goal:** RBAC UI for managing permissions

### Permissions Structure

- **User**: View own cart/profile, view own orders
- **Manager**: View dashboard, view all orders (can edit status), CRUD products & categories
- **Admin**: All access to everything

### Deliverables

- [x] `areas/admin/permissions/permissions.component.ts` — Scaffold created
- [x] `areas/admin/permissions/permissions.component.html` — Basic template
- [x] `areas/admin/permissions/permissions.component.scss` — Styling
- [ ] Display permission matrix (role × section × action)
- [ ] Checkbox toggles for each permission
- [ ] Save permission changes

### Implementation
- RBAC Matrix: roles × sections × actions checkboxes
- User: shop only | Manager: dashboard, orders (view+edit), products, categories | Admin: all
- onTogglePermission() updates permission in IndexedDB

### Success Criteria

- ✅ Permissions load
- ✅ Toggles change permissions
- ✅ Changes persist in IndexedDB
- ✅ Admin-only guard works

---

## 📋 Phase 2.10: Orders Board (2.5 hours) ⚠️ SCAFFOLD CREATED

**Goal:** Trello-like board with drag-drop

### Deliverables

- [x] `areas/admin/orders/orders-board.component.ts` — Scaffold created
- [x] `areas/admin/orders/orders-board.component.html` — Basic template
- [x] `areas/admin/orders/orders-board.component.scss` — Styling
- [ ] Implement Kanban columns (pending, processing, shipped, delivered)
- [ ] Add drag-drop with Angular CDK
- [ ] Load orders from OrderRepository
- [ ] Update order status on drop
- [ ] Add order detail modal

### Implementation
- Kanban board: 3 columns (Queue, Processing, Completed)
- Angular CDK drag-drop: drop() event updates order status
- Detail modal on order click

### Success Criteria

- ✅ Board displays 3 columns
- ✅ Orders load correctly
- ✅ Drag-drop updates status
- ✅ Status persists in IndexedDB
- ✅ Detail modal works

---

## 🏷️ Phase 2.11: Products Manager (1.5 hours) ⚠️ SCAFFOLD CREATED

**Goal:** Product CRUD

### Deliverables

- [x] `areas/admin/products/products.component.ts` — Scaffold created
- [x] `areas/admin/products/products.component.html` — Basic template
- [x] `areas/admin/products/products.component.scss` — Styling
- [ ] Load products from ProductRepository
- [ ] Add/Edit/Delete product functionality
- [ ] Image upload support (base64)
- [ ] Category assignment
- [ ] Product edit modal with Reactive Forms

### Patterns Used

- **FORMS** — [Reactive Forms with custom validators](../../../docs/framework/angular/patterns/FORMS.md) for product fields
- **ERROR_HANDLING** — Display validation errors, image upload errors, API errors
- **ACCESSIBILITY** — Form labels, image alt attributes, proper focus management in modal

### Product Edit Component
- Reactive Form: name, description, price, categoryId, image
- Image upload: FileReader → base64 → productForm.patchValue()
- CRUD: create() or update() based on isEdit flag

### Success Criteria

- ✅ Products table loads
- ✅ Add/Edit modal works
- ✅ Image upload converts to base64
- ✅ Products persist
- ✅ Delete confirmation works

---

## 📂 Phase 2.12: Categories Manager (1 hour) ✅ COMPLETED

**Goal:** Build category CRUD with data validation

### Deliverables

- [x] `areas/admin/categories/model/types.ts` — DTOs and types
- [x] `areas/admin/categories/services/category.service.ts` — HTTP service with CRUD
- [x] `areas/admin/categories/category-table/` — Table component with pagination
- [x] `areas/admin/categories/category-form-dialog/` — Create/Edit dialog
- [x] `areas/admin/categories/categories.component.ts` — Orchestrator component
- [x] `core/models/category.dto.ts` — CategoryDTO in @core (not @bff!)
- [x] BFF endpoints: GET, POST, PUT, DELETE /api/categories
- [x] Data validation: name max 32 chars, description max 128 chars
- [x] Delete protection: Cannot delete category with products
- [x] Character count hints on form fields
- [ ] Unit tests

### Patterns Used

- **FORMS** — [Reactive Forms with validators](../../../docs/framework/angular/patterns/FORMS.md): `Validators.maxLength(32)`, `Validators.required`
- **PERFORMANCE** — Signals for state, OnPush components
- **ERROR_HANDLING** — BFF validation (400 errors), UI error messages
- **ARCHITECTURE** — @core DTOs (not @bff imports in areas!)

### Implementation Details

**Frontend:**
- CategoryService: HTTP CRUD with pagination support
- CategoryFormDialog: Reactive form with maxLength validators + character hints
- CategoryTable: ID, Name, Description columns with actions
- Validation: required + maxLength on client side

**BFF Layer:**
- GET /api/categories?page=1&limit=20&search=text — Paginated list
- POST /api/categories — Create with validation (trim, maxLength check)
- PUT /api/categories/:id — Update with partial validation
- DELETE /api/categories/:id — Delete with product check (400 if has products)
- Validation: name ≤ 32, description ≤ 128, trim values

**Data Layer:**
- CategoryRepository: Standard CRUD, extends BaseRepository
- ProductRepository.getByCategoryId() — Check for dependent products
- Delete protection: Cannot remove category if products exist

### Success Criteria

- ✅ Categories load and display with ID column
- ✅ Create/Edit dialog with validation hints
- ✅ Character counter shows: "5/32", "24/128"
- ✅ Cannot exceed max lengths (HTML maxlength + validators)
- ✅ BFF validates and returns 400 on validation errors
- ✅ Cannot delete category with products (400 error)
- ✅ Trim whitespace on save
- ✅ No @bff imports in areas (uses CategoryDTO from @core)
- ✅ Generic generateDeleteMessage() helper

---

## 🌱 Phase 2.13: Seed Data (1 hour)

**Goal:** Initialize demo data

### Deliverables

- [ ] Update `seed.service.ts` with demo data
- [ ] Run seed on first load

### Demo Data
- 3 demo users: user@demo, manager@demo, admin@demo (password: demo)
- 4 categories: Electronics, Clothing, Books, Home & Garden
- 10-15 products across categories

### Success Criteria

- ✅ Demo users exist in IndexedDB
- ✅ Can login with demo accounts
- ✅ Products and categories seed
- ✅ Seed runs only once

---

## ✅ Phase 2.14: Tests & Integration (2 hours)

**Goal:** Ensure quality and completeness

### Deliverables

- [ ] Unit tests (80%+ coverage on BFF)
- [ ] E2E tests (3 user journeys)
- [ ] Performance verification
- [ ] Build success

### Patterns Used

- **ERROR_HANDLING** — E2E tests verify error states, validation messages
- **ACCESSIBILITY** — Verify form labels, ARIA attributes in E2E tests
- **PERFORMANCE** — Verify OnPush works, @for track with no DOM thrashing

### Unit Tests

```bash
# BFF Services
src/bff/database.service.spec.ts
src/bff/repositories/*.spec.ts
src/core/guards/*.spec.ts

# Target: 90%+ coverage
```

### E2E Tests (Playwright)

```typescript
// Journey 1: User shops
test('User login → Browse products → Add to cart → Checkout', async () => {
  // Login
  // Browse products
  // Filter by category
  // Add to cart
  // Checkout
  // Verify order created
});

// Journey 2: Manager manages orders
test('Manager login → Dashboard → View orders → Drag-drop status', async () => {
  // Login as manager
  // View dashboard stats
  // View orders board
  // Drag order from Queue to Processing
  // Verify status updated
});

// Journey 3: Admin manages products
test('Admin login → Products → Edit product → Delete product', async () => {
  // Login as admin
  // View products
  // Edit product (image, price, category)
  // Create new product
  // Delete product
  // Verify changes
});
```

### Performance Check

```bash
# Build production
pnpm build
# Should produce ~65KB gzipped
# Load time should be <2 seconds
```

### Success Criteria

- ✅ All unit tests pass
- ✅ 80%+ coverage on BFF services
- ✅ All E2E tests pass
- ✅ Build succeeds
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Performance acceptable

---

## 🎯 Success Criteria Summary

### Phase 2.1 (BFF)
- ✅ IndexedDB initialized
- ✅ All CRUD operations work
- ✅ 90%+ test coverage

### Phase 2.2 (Auth)
- ✅ Login/logout works
- ✅ Guards protect routes
- ✅ Demo users login

### Phases 2.3-2.5
- ✅ All components render
- ✅ No errors in console
- ✅ Responsive on mobile

### Phases 2.6-2.12 (Features)
- ✅ All features functional
- ✅ CRUD operations complete
- ✅ Role-based access works
- ✅ Drag-drop board functional
- ✅ Image upload working

### Phase 2.13 (Seed)
- ✅ Demo data loads
- ✅ Can login as all 3 roles
- ✅ Products and categories exist

### Phase 2.14 (Tests)
- ✅ 80%+ overall coverage
- ✅ All E2E tests pass
- ✅ Build succeeds
- ✅ Performance acceptable

---

## 📅 Estimated Timeline

```
Day 1: Phases 2.1-2.3 (4 hours)
  2.1: BFF Foundation (2h)
  2.2: Authentication (1.5h)
  2.3: Landing Page (0.5h)

Day 2: Phases 2.4-2.5 (5 hours)
  2.4: Shop Module (3h)
  2.5: Shared Components (2h)

Day 3: Phases 2.6-2.9 (3.5 hours)
  2.6: Admin Layout (1h)
  2.7: Dashboard (1h)
  2.8: Customers (1h)
  2.9: Permissions (1.5h)

Day 4: Phases 2.10-2.14 (8 hours)
  2.10: Orders Board (2.5h)
  2.11: Products (1.5h)
  2.12: Categories (1h)
  2.13: Seed Data (1h)
  2.14: Tests & Polish (2h)

Total: ~21 hours (4-5 full days)
```

---

## � Patterns Used in Phase 2

This implementation uses the following Angular framework patterns. Refer to these guides for detailed examples:

| Pattern | Phases | Purpose |
|---------|--------|---------|
| [ROUTING](../../../docs/framework/angular/patterns/ROUTING.md) | 2.2, 2.3, 2.6, 2.14 | Lazy-loaded areas, functional guards, nested routes |
| [FORMS](../../../docs/framework/angular/patterns/FORMS.md) | 2.2, 2.4, 2.8, 2.11, 2.12 | Reactive Forms, validation, error handling |
| [ERROR_HANDLING](../../../docs/framework/angular/patterns/ERROR_HANDLING.md) | All phases | Service error states, UI error display, try-catch |
| [AUTHENTICATION](../../../docs/framework/angular/patterns/AUTHENTICATION.md) | 2.1, 2.2 | AuthService signals, session management, guards |
| [PERFORMANCE](../../../docs/framework/angular/patterns/PERFORMANCE.md) | 2.4, 2.5, 2.6+ | OnPush change detection, @for track, lazy loading |
| [ACCESSIBILITY](../../../docs/framework/angular/patterns/ACCESSIBILITY.md) | 2.3, 2.5, 2.8, 2.11, 2.14 | Semantic HTML, ARIA roles, form labels |

**Not Used:**
- **STATE_MANAGEMENT** — Signals are built into services; no separate state management library needed
- **API_MOCKING** — BFF uses IndexedDB; MSW not needed. Can add for E2E tests if desired

---

## �🚀 Starting Phase 2.1

To begin:

1. Install dependencies
   ```bash
   cd packages/angular-standalone-orders
   pnpm add @angular/cdk uuid
   ```

2. Start Phase 2.1: BFF Foundation
   - Create `src/bff/database.service.ts`
   - Implement repositories
   - Write unit tests

3. Follow phases sequentially

Good luck! 🎉
