# Implementation Plan: Phase 2

> Complete roadmap for building the Orders Management Platform.  
> **Current progress and remaining tasks:** See [PROJECT_STATUS.md](./PROJECT_STATUS.md) ⭐

**Duration:** ~21 hours | **14 Phases** | **Progress:** ~92% complete

---

## 🎯 Quick Status

**✅ Completed (92%):** BFF, Auth, Landing, Shop (browse/detail/cart/checkout/payment), Admin CRUD (Products/Categories/Customers/Permissions), Shared UI, Seed Data  
**🚧 Remaining (8%):** Orders Board drag-drop + filters, Dashboard widgets, tests

**For detailed remaining tasks and priorities, see [PROJECT_STATUS.md](./PROJECT_STATUS.md)**

---

## 📋 Phase Overview

| # | Phase | Duration | Status | Progress |
|---|-------|----------|--------|----------|
| 2.1 | BFF Foundation | 2h | ✅ Done | 100% |
| 2.2 | Authentication | 1.5h | ✅ Done | 100% |
| 2.3 | Landing Page | 0.5h | ✅ Done | 100% |
| 2.4 | Shop Module | 3h | ⏸️ Partial | 70% |
| 2.5 | Shared UI | 2h | ✅ Done | 100% |
| 2.6 | Admin Layout | 1h | ✅ Done | 100% |
| 2.7 | Dashboard | 1h | ⏸️ Partial | 30% |
| 2.8 | Customers | 1h | ✅ Done | 100% |
| 2.9 | Permissions | 1.5h | ✅ Done | 95% |
| 2.10 | Orders Board | 2.5h | ⏸️ Partial | 45% |
| 2.11 | Products | 1.5h | ✅ Done | 100% |
| 2.12 | Categories | 1h | ✅ Done | 100% |
| 2.13 | Seed Data | 1h | ✅ Done | 100% |
| 2.14 | Tests & Polish | 2h | ⏸️ Partial | 20% |

**Overall Progress:** ~82% (17h / 21h estimated) — **~9 hours remaining**

---

## ✅ Completed Phases (Minimized)

<details>
<summary><strong>Phase 2.1: BFF Foundation (100%)</strong></summary>

- DatabaseService with 7 IndexedDB stores
- All repositories (User, Product, Order, Category, Cart, OrderItem, Permission)
- BFF handlers for REST API simulation
- SeedService with demo data
- FakeBFFService integration
- APIInterceptor for dev routing

**Files:** `src/bff/`, `src/core/services/`, `src/core/guards/`
</details>

<details>
<summary><strong>Phase 2.2: Authentication (100%)</strong></summary>

- Login component with Material forms
- AuthService with signals
- Auth guards (authGuard, adminGuard, permissionGuard)
- Session management via IndexedDB
- Demo users (user@demo, manager@demo, admin@demo)

**Files:** `src/areas/auth/`, `src/core/services/auth.service.ts`
</details>

<details>
<summary><strong>Phase 2.3: Landing Page (100%)</strong></summary>

- Hero, Features, Use Cases, FAQ, Contact sections
- Lead capture form
- Responsive design
- SEO optimization

**Files:** `src/areas/landing/`
</details>

<details>
<summary><strong>Phase 2.5: Shared UI (100%)</strong></summary>

- 15+ components: MainLayout, TopBar, Footer, UserMenu, CartButton, PageLoader, FilterContainer, ProductCard, ImageGallery, SearchInput, Pagination, Dialog, ConfirmDialog, etc.
- Services: LayoutService, ScrollService, NotificationService
- Design system integration

**Files:** `src/shared/ui/`, `src/shared/services/`
</details>

<details>
<summary><strong>Phase 2.6: Admin Layout (100%)</strong></summary>

- AdminLayoutComponent with Material sidebar
- Routing configuration
- Role-based menu items
- Responsive navigation

**Files:** `src/areas/admin/admin-layout.component.*`
</details>

<details>
<summary><strong>Phase 2.8: Customers (100%)</strong></summary>

- Full CRUD operations
- Customer table with pagination
- Filters (search, role)
- Form dialogs (create/edit)
- Delete confirmation
- RBAC integration

**Files:** `src/areas/admin/customers/`
</details>

<details>
<summary><strong>Phase 2.9: Permissions (95%)</strong></summary>

- Permission matrix table
- Create/edit permission dialog
- Form validation
- Role-based display

**TODO:** Repository persistence (currently in-memory)

**Files:** `src/areas/admin/permissions/`
</details>

<details>
<summary><strong>Phase 2.11: Products (100%)</strong></summary>

- Full CRUD operations
- Product table with pagination
- Filters (search, category)
- Image upload via FileStorageService
- Multi-image gallery support
- Category relationships
- Form validation

**Files:** `src/areas/admin/products/`
</details>

<details>
<summary><strong>Phase 2.12: Categories (100%)</strong></summary>

- Full CRUD operations
- Category table with pagination
- Form dialogs
- Delete protection (cascade check)
- Validation

**Files:** `src/areas/admin/categories/`
</details>

<details>
<summary><strong>Phase 2.13: Seed Data (100%)</strong></summary>

- SeedService implementation
- Demo users, products, categories
- Product images via FileStorageService
- Auto-generation on first run

**Files:** `src/bff/services/seed.service.ts`
</details>

---

## 🚧 Phases Needing Work

### 🛍️ Phase 2.4: Shop Module (70% → 100%)

**Status:** Browse + Detail ✅ | Cart + Checkout ❌

#### ✅ Completed (70%)
- Product listing with filters (search, category)
- Product detail page with image gallery
- Search functionality
- Responsive design

#### ❌ Remaining (30% - ~4h)

**1. Cart Page Component**
- Create `src/areas/shop/cart/cart.component.ts`
- Cart items list with quantity controls (+/-)
- Remove item button
- Cart summary (subtotal, tax, total)
- Empty cart state
- Continue shopping button
- Proceed to checkout button

**2. Checkout Page**
- Create `src/areas/shop/checkout/checkout.component.ts`
- Shipping address form (Reactive Forms + validation)
- Order summary review
- Place order button
- Order confirmation page

**3. Integration**
- Connect to CartService (already exists in shared)
- Create orders via BFF OrderRepository
- Clear cart after order placement
- Redirect to order confirmation

**Routes to add:**
```typescript
{
  path: 'shop/cart',
  component: CartComponent,
  title: 'Shopping Cart'
},
{
  path: 'shop/checkout',
  canActivate: [authGuard], // Auth required for checkout
  component: CheckoutComponent,
  title: 'Checkout'
}
```

**Acceptance Criteria:**
- User can view cart with all items
- User can update quantities or remove items
- User can proceed to checkout (login required)
- Order is created and saved to IndexedDB
- Cart is cleared after order placement
- Order confirmation is shown

---

### 📊 Phase 2.7: Dashboard (30% → 100%)

**Status:** Layout ✅ | Widgets ❌

#### ✅ Completed (30%)
- Dashboard component structure
- Route configuration

#### ❌ Remaining (70% - ~2h)

**1. Stats Cards**
- Total orders count + revenue
- Pending orders count
- Completed orders count
- Total customers count
- Load data from OrderRepository and UserRepository

**2. Recent Orders Widget**
- Table showing last 5 orders
- Columns: Order #, Customer, Total, Status, Date
- Click to view order details

**3. Orders by Status Chart** (optional)
- Simple bar/pie chart showing order distribution
- Use Angular Material or chart library

**4. Top Products Widget** (optional)
- List of most ordered products
- Load from order_items + products

**Implementation:**
```typescript
// src/areas/admin/dashboard/dashboard.component.ts
stats = {
  totalOrders: signal(0),
  totalRevenue: signal(0),
  pendingOrders: signal(0),
  completedOrders: signal(0),
  totalCustomers: signal(0)
};

async ngOnInit() {
  // Load from BFF repositories
  const orders = await this.orderRepository.getAll();
  const users = await this.userRepository.getAll();
  
  this.stats.totalOrders.set(orders.length);
  this.stats.totalRevenue.set(orders.reduce((sum, o) => sum + o.total, 0));
  // ... etc
}
```

**Acceptance Criteria:**
- Dashboard shows real-time stats from IndexedDB
- Stats update when data changes
- Recent orders table displays correctly
- Responsive layout

---

### 📋 Phase 2.10: Orders Board (10% → 100%)

**Status:** Stub component ❌ | Need Kanban implementation

#### ❌ Remaining (90% - ~3h)

**1. Kanban Board Layout**
- Install `@angular/cdk` if not present: `pnpm add @angular/cdk`
- Create 4 columns: Queue, Processing, Completed, Cancelled
- Use CSS Grid or Flexbox for columns
- Material cards for each order

**2. Drag-Drop Functionality**
- Import `@angular/cdk/drag-drop`
- Implement `CdkDragDrop` handlers
- Update order status on drop
- Persist to OrderRepository
- Visual feedback during drag

**3. Order Cards**
- Display: Order #, Customer name, Total, Date
- Color-coded by status
- Click to view order details (modal)

**4. Filters**
- Date range picker
- Customer search
- Status filter
- Clear filters button

**Implementation:**
```typescript
// orders-board.component.ts
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

columns = {
  queue: signal<Order[]>([]),
  processing: signal<Order[]>([]),
  completed: signal<Order[]>([]),
  cancelled: signal<Order[]>([])
};

async drop(event: CdkDragDrop<Order[]>, newStatus: OrderStatus) {
  const order = event.item.data;
  
  // Update order status
  await this.orderRepository.updateStatus(order.id, newStatus);
  
  // Update UI
  transferArrayItem(
    event.previousContainer.data,
    event.container.data,
    event.previousIndex,
    event.currentIndex
  );
}
```

**Template:**
```html
<div class="kanban-board">
  <div class="column" cdkDropList [cdkDropListData]="columns.queue()"
       (cdkDropListDropped)="drop($event, 'queue')">
    <h3>Queue ({{ columns.queue().length }})</h3>
    <div *ngFor="let order of columns.queue()" cdkDrag>
      <!-- Order card -->
    </div>
  </div>
  <!-- Repeat for other columns -->
</div>
```

**Acceptance Criteria:**
- Manager can drag orders between columns
- Order status updates in IndexedDB
- Filters work correctly
- Shows order count per column
- Responsive on mobile (stacked columns)

---

### ✅ Phase 2.14: Tests & Polish (20% → 80%)

**Status:** 2 basic E2E tests | Need 80%+ coverage

#### ❌ Remaining (80% - ~4h)

**1. Unit Tests** (Target: 80% coverage)

Priority files:
- `src/core/services/auth.service.spec.ts`
- `src/core/services/permission.service.spec.ts`
- `src/bff/repositories/*.spec.ts`
- `src/areas/admin/*/services/*.spec.ts`
- `src/shared/services/*.spec.ts`

**2. Component Tests**
- Admin CRUD components (customers, products, categories)
- Form validation tests
- Dialog components
- Filter components

**3. E2E Tests** (Playwright)

Critical flows:
- Shopping flow: Browse → Add to cart → Checkout → Order confirmation
- Admin flow: Login as admin → CRUD operations (products, categories)
- Authentication: Login/logout, guard protection
- Permission-based access

**4. Integration Tests**
- BFF layer: Repository operations
- Service layer: Business logic
- Guards: Route protection

**Run tests:**
```bash
# Unit tests
pnpm test

# Coverage report
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

**Acceptance Criteria:**
- 80%+ unit test coverage
- All critical user flows covered by E2E
- No console errors
- Build passes without warnings

---

## 🎯 Recommended Implementation Order

1. **Cart & Checkout** (Phase 2.4) — ~4h — Critical user flow
2. **Orders Board** (Phase 2.10) — ~3h — Admin core feature
3. **Dashboard Widgets** (Phase 2.7) — ~2h — Admin overview
4. **Unit Tests** (Phase 2.14) — ~2h — Quality baseline
5. **E2E Tests** (Phase 2.14) — ~2h — Integration coverage

**Total remaining:** ~13 hours (conservative estimate with testing)

---

## 📝 Notes

- All completed phases are fully functional
- BFF layer is production-ready for backend migration
- Design system is consistent throughout
- SSR/SEO is implemented and working
- No blockers, all remaining tasks are independent

---

## 🔗 Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Detailed Project Status](./PROJECT_STATUS.md)
- [Progress Summary](./PROGRESS_SUMMARY.md)
- [Use Cases & Limitations](./USE_CASES.md)
- [BFF Architecture](./FAKEBFF_ARCHITECTURE.md)
