# Implementation Plan: Phase 2

> Complete roadmap for building the Orders Management Platform from scratch.
> See [ARCHITECTURE.md](./ARCHITECTURE.md) for design overview.

**Total Duration:** ~21 hours  
**14 Sequential Phases**  
**Current Progress:** ~25% (5.5h / 21h)

---

## 🎯 Quick Status (Last Updated: Feb 8, 2026)

**✅ Completed:**
- Phase 2.1 - BFF Foundation (90% - missing unit tests)
- Phase 2.3 - Landing Page (100%)
- Phase 2.5 - Shared UI (60% - basic components created)

**🚧 Next Priority: Phase 2.2 - Authentication**
Create `areas/auth/login/` component to enable user login functionality.

**⚠️ Critical Missing:**
- Unit tests (0% coverage - target is 80-90%)
- E2E tests
- Authentication UI (Phase 2.2)

---

## 📋 Phase Overview

| # | Phase | Duration | Status | Key Deliverables |
|---|-------|----------|--------|------------------|
| 2.1 | BFF Foundation | 2h | ✅ 90% | Database, repositories, services |
| 2.2 | Authentication | 1.5h | ❌ 0% | Login, guards, session |
| 2.3 | Landing Page | 0.5h | ✅ 100% | Home page, navigation |
| 2.4 | Shop Module | 3h | ⚠️ 10% | Products, cart, checkout |
| 2.5 | Shared UI | 2h | ✅ 60% | Reusable components |
| 2.6 | Admin Layout | 1h | ❌ 0% | Sidebar, routing |
| 2.7 | Dashboard | 1h | ❌ 0% | Stats, widgets |
| 2.8 | Customers | 1h | ❌ 0% | User management |
| 2.9 | Permissions | 1.5h | ❌ 0% | RBAC matrix |
| 2.10 | Orders Board | 2.5h | ❌ 0% | Trello drag-drop |
| 2.11 | Products | 1.5h | ❌ 0% | CRUD, image upload |
| 2.12 | Categories | 1h | ❌ 0% | Category management |
| 2.13 | Seed Data | 1h | ❌ 0% | Demo data |
| 2.14 | Tests & Polish | 2h | ❌ 0% | Coverage, E2E, build |

**Overall Progress:** ~25% (5.5h / 21h estimated)

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

**Shared UI:**
- ✅ MainLayoutComponent
- ✅ TopBarComponent
- ✅ FooterComponent
- ✅ UserMenuComponent
- ✅ CartButtonComponent
- ✅ LayoutService & ScrollService

### ⚠️ In Progress
- Routes configured but areas/auth and areas/admin folders need creation

### ❌ Not Started
- Unit tests (0% coverage)
- E2E tests
- areas/auth implementation (Login component)
- areas/admin implementation
- Shop features (product catalog, cart functionality)
- Admin features (dashboard, CRUD interfaces)

---

## 🚀 Phase 2.1: BFF Foundation (2 hours)

**Goal:** Create data layer with IndexedDB and services

### Deliverables

- [x] `core/bff/database.service.ts` — IndexedDB initialization
- [x] `core/bff/repositories/base.repository.ts` — Base repository pattern
- [x] `core/bff/repositories/user.repository.ts` — User CRUD
- [x] `core/bff/repositories/product.repository.ts` — Product CRUD
- [x] `core/bff/repositories/order.repository.ts` — Order CRUD + status
- [x] `core/bff/repositories/category.repository.ts` — Category CRUD
- [x] `core/bff/repositories/cart.repository.ts` — Cart operations
- [x] `core/services/permission.service.ts` — RBAC (in core/services/)
- [x] `core/services/auth.service.ts` — Session management (in core/services/)
- [x] `core/bff/services/seed.service.ts` — Demo data
- [x] `core/guards/auth.guard.ts` — Require authentication
- [x] `core/guards/admin.guard.ts` — Require admin/manager
- [x] `core/guards/permission.guard.ts` — Custom permissions
- [ ] Unit tests (database, repositories)

### Implementation Details

```typescript
// DatabaseService: Initialize IndexedDB
- Open database ('OrdersDB', version 1)
- Create 7 object stores
- Create indexes on frequently queried fields
- Handle version upgrades
- Run seed on first load (v1.0 → v1.1)

// Repositories follow pattern:
class UserRepository {
  constructor(private db: DatabaseService) {}
  
  async getAll(): Promise<User[]> { }
  async getById(id: string): Promise<User | null> { }
  async create(user: User): Promise<void> { }
  async update(id: string, user: Partial<User>): Promise<void> { }
  async delete(id: string): Promise<void> { }
}

// Services handle business logic
class PermissionService {
  async hasAccess(section: string, action: string): Promise<boolean> { }
  async getPermissions(role: UserRole): Promise<Permission[]> { }
}

class AuthService {
  currentUser$ = signal<User | null>(null);
  
  async login(email: string, password: string): Promise<void> { }
  async logout(): Promise<void> { }
  isAuthenticated(): boolean { }
}
```

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

## 🔐 Phase 2.2: Authentication (1.5 hours)

**Goal:** Implement login/logout with session management in areas/auth/

### Deliverables

- [ ] `areas/auth/login/login.component.ts` — Login form
- [ ] `areas/auth/login/login.component.html` — Material form template
- [ ] `areas/auth/login/login.component.scss` — Styling with gradient
- [ ] `areas/auth/auth.routes.ts` — Auth routing
- [ ] Update `app.routes.ts` — Verify auth routes import
- [ ] Unit tests (login component, auth service)
- [ ] E2E test (login flow)

### Patterns Used

- **ROUTING** — [Functional guards + lazy loading](../../../docs/framework/angular/patterns/ROUTING.md)
- **FORMS** — [Reactive Forms + validation](../../../docs/framework/angular/patterns/FORMS.md) in login.component
- **AUTHENTICATION** — [AuthService signals](../../../docs/framework/angular/patterns/AUTHENTICATION.md) + session management
- **ERROR_HANDLING** — Display invalid credentials error
- **ACCESSIBILITY** — Form labels with aria-describedby, error announcements

### Implementation Details

```typescript
// Login Component: Reactive form
FormGroup {
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  rememberMe: [false]
}

// On submit:
1. Validate form
2. Call auth.service.login(email, password)
3. Store session in sessionStorage
4. Redirect to returnUrl or /shop
5. Show error if login fails

// Auth Guard: Protect routes
export const authGuard = (route, state) => {
  if (auth.isAuthenticated()) return true;
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
}

// Admin Guard: Check role
export const adminGuard = (route, state) => {
  const user = auth.currentUser$();
  return user?.role === 'admin' || user?.role === 'manager';
}
```

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

```html
<div class="landing">
  <header>
    <h1>Orders Management Platform</h1>
    <p>Manage orders, products, and users with ease</p>
  </header>
  
  <div class="cta-buttons">
    <!-- If not logged in -->
    <button routerLink="/auth/login">Login</button>
    
    <!-- If logged in -->
    <button routerLink="/shop" *ngIf="isAuthenticated">Shop</button>
    <button routerLink="/admin" *ngIf="isAdmin">Admin Panel</button>
  </div>
  
  <footer>
    <p>© 2026 Orders Platform</p>
  </footer>
</div>
```

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

```typescript
// Products List Component
@Component({...})
export class ProductsListComponent {
  products$ = signal<Product[]>([]);
  selectedCategory = signal<string | null>(null);
  isLoading = signal(false);
  
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    return this.products$().filter(p => 
      !category || p.categoryId === category
    );
  });
  
  async loadProducts() {
    this.isLoading.set(true);
    this.products$.set(await this.productRepo.getAll());
    this.isLoading.set(false);
  }
  
  onAddToCart(product: Product) {
    this.cartService.addItem(product.id, 1);
  }
}

// Cart Component
@Component({...})
export class CartComponent {
  cart$ = signal<CartItem[]>([]);
  total = computed(() => 
    this.cart$().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  
  async checkout() {
    // Create order from cart
    const order = await this.orderRepo.create({
      userId: this.auth.currentUser$().id,
      items: this.cart$(),
      status: 'queue'
    });
    // Clear cart
    await this.cartRepo.clear();
    // Redirect to profile
    this.router.navigate(['/shop/profile']);
  }
}
```

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

### Table Component

```typescript
@Component({
  selector: 'app-table',
  template: `
    <table>
      <thead>
        <tr>
          <th *ngFor="let col of columns()">{{ col.label }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data(); trackBy: trackBy">
          <td *ngFor="let col of columns()">{{ row[col.key] }}</td>
          <td>
            <button (click)="onEdit.emit(row)">Edit</button>
            <button (click)="onDelete.emit(row)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class TableComponent {
  data = input<any[]>([]);
  columns = input<ColumnDef[]>([]);
  onEdit = output<any>();
  onDelete = output<any>();
  
  trackBy(index: number) { return index; }
}
```

### Modal Component

```typescript
@Component({
  selector: 'app-modal',
  template: `
    <div class="modal-overlay" *ngIf="isOpen()">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ title() }}</h2>
          <button (click)="onClose()">×</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  isOpen = input(false);
  title = input('Modal');
  onClose = output<void>();
}
```

### Success Criteria

- ✅ Table component works in products
- ✅ Modal component works in edit dialogs
- ✅ Reusable across features
- ✅ Styling consistent

---

## 📐 Phase 2.6: Admin Layout (1 hour)

**Goal:** Create admin container with sidebar

### Deliverables

- [ ] `features/admin/admin-layout.component.ts` — Main layout
- [ ] `features/admin/admin-layout.component.html` — With role-based menu
- [ ] `features/admin/admin-layout.component.scss`
- [ ] `features/admin/admin.routes.ts` — Nested routes with guards

### Patterns Used

- **ROUTING** — [Nested routes in admin.routes.ts](../../../docs/framework/angular/patterns/ROUTING.md) with functional guards
- **PERFORMANCE** — [OnPush change detection](../../../docs/framework/angular/patterns/PERFORMANCE.md)
- **ACCESSIBILITY** — [Navigation landmarks](../../../docs/framework/angular/patterns/ACCESSIBILITY.md) (nav, main roles)

### Implementation

```typescript
@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="admin-container">
      <app-sidebar [menuItems]="menuItems()"></app-sidebar>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  permission = inject(PermissionService);
  
  menuItems = computed(() => [
    { 
      label: 'Dashboard', 
      route: '/admin/dashboard',
      show: true 
    },
    { 
      label: 'Orders', 
      route: '/admin/orders',
      show: this.permission.hasAccess('orders', 'view')
    },
    { 
      label: 'Products', 
      route: '/admin/products',
      show: this.permission.hasAccess('products', 'view')
    },
    // ... more menu items based on permissions
  ]);
}
```

### Success Criteria

- ✅ Admin layout renders
- ✅ Sidebar shows role-based menu
- ✅ Routes load in outlet
- ✅ Navigation works

---

## 📊 Phase 2.7: Admin Dashboard (1 hour)

**Goal:** Create dashboard with stats

### Deliverables

- [ ] `features/admin/dashboard/dashboard.component.ts`
- [ ] `features/admin/dashboard/dashboard.component.html`
- [ ] `features/admin/dashboard/dashboard.component.scss`

### Content

```typescript
export class DashboardComponent {
  orderRepo = inject(OrderRepository);
  
  latestOrders = signal<Order[]>([]);
  orderCount = signal(0);
  customerCount = signal(0);
  productCount = signal(0);
  
  async ngOnInit() {
    this.latestOrders.set(await this.orderRepo.getLatest(5));
    this.orderCount.set(await this.orderRepo.count());
    // ... load other stats
  }
}
```

### Layout

```html
<div class="dashboard">
  <div class="stats-row">
    <div class="stat-card">
      <h3>Orders</h3>
      <p class="stat-value">{{ orderCount() }}</p>
    </div>
    <div class="stat-card">
      <h3>Customers</h3>
      <p class="stat-value">{{ customerCount() }}</p>
    </div>
    <div class="stat-card">
      <h3>Products</h3>
      <p class="stat-value">{{ productCount() }}</p>
    </div>
  </div>
  
  <div class="latest-orders">
    <h2>Latest Orders</h2>
    <app-table [data]="latestOrders()" [columns]="orderColumns"></app-table>
  </div>
</div>
```

### Success Criteria

- ✅ Stats load and display
- ✅ Latest orders show
- ✅ Numbers update correctly

---

## 👥 Phase 2.8: Admin Customers (1 hour)

**Goal:** Customer management table

### Deliverables

- [ ] `features/admin/customers/customers.component.ts` — Customer table
- [ ] `features/admin/customers/customer-edit.component.ts` — Edit modal (Reactive Forms)
- [ ] Edit modal for changing roles

### Patterns Used

- **FORMS** — [Reactive Forms in customer-edit](../../../docs/framework/angular/patterns/FORMS.md) for role selection
- **ERROR_HANDLING** — Show delete confirmation, display save errors
- **ACCESSIBILITY** — Modal with proper focus management, form labels

### Implementation

```typescript
export class CustomersComponent {
  users$ = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  showEditModal = signal(false);
  
  async loadUsers() {
    this.users$.set(await this.userRepo.getAll());
  }
  
  onEditUser(user: User) {
    this.selectedUser.set(user);
    this.showEditModal.set(true);
  }
  
  async onSaveUser(user: User) {
    await this.userRepo.update(user.id, { role: user.role });
    await this.loadUsers();
    this.showEditModal.set(false);
  }
  
  async onDeleteUser(user: User) {
    if (confirm(`Delete ${user.email}?`)) {
      await this.userRepo.delete(user.id);
      await this.loadUsers();
    }
  }
}
```

### Success Criteria

- ✅ Users table loads
- ✅ Edit modal works
- ✅ Role can be changed
- ✅ Users can be deleted
- ✅ Admin-only guard works

---

## 🔑 Phase 2.9: Permissions Matrix (1.5 hours)

**Goal:** RBAC UI for managing permissions

### Permissions Structure

- **User**: View own cart/profile, view own orders
- **Manager**: View dashboard, view all orders (can edit status), CRUD products & categories
- **Admin**: All access to everything

### Deliverables

- [ ] `features/admin/permissions/permissions.component.ts`
- [ ] Permissions table (role × section × action)
- [ ] Checkbox toggles for each permission

### Implementation

```typescript
export class PermissionsComponent {
  permissions$ = signal<Permission[]>([]);
  roles: UserRole[] = ['user', 'manager', 'admin'];
  sections = ['shop', 'dashboard', 'orders', 'products', 'categories', 'customers', 'permissions'];
  actions = ['view', 'create', 'edit', 'delete'];
  
  // Permission matrix definition (in seed data)
  defaultPermissions = [
    // User: only shop access
    { role: 'user', section: 'shop', action: 'view', granted: true },
    { role: 'user', section: 'dashboard', action: 'view', granted: false },
    
    // Manager: dashboard, orders (view+edit), products, categories
    { role: 'manager', section: 'dashboard', action: 'view', granted: true },
    { role: 'manager', section: 'orders', action: 'view', granted: true },
    { role: 'manager', section: 'orders', action: 'edit', granted: true },  // Can change status
    { role: 'manager', section: 'orders', action: 'delete', granted: false }, // Cannot delete
    { role: 'manager', section: 'products', action: 'view', granted: true },
    { role: 'manager', section: 'products', action: 'create', granted: true },
    { role: 'manager', section: 'products', action: 'edit', granted: true },
    { role: 'manager', section: 'products', action: 'delete', granted: true },
    { role: 'manager', section: 'categories', action: 'view', granted: true },
    { role: 'manager', section: 'categories', action: 'create', granted: true },
    { role: 'manager', section: 'categories', action: 'edit', granted: true },
    { role: 'manager', section: 'categories', action: 'delete', granted: true },
    { role: 'manager', section: 'customers', action: 'view', granted: false },
    { role: 'manager', section: 'permissions', action: 'view', granted: false },
    
    // Admin: all access
    { role: 'admin', section: '*', action: '*', granted: true },
  ];
  
  async loadPermissions() {
    this.permissions$.set(await this.permissionRepo.getAll());
  }
  
  async onTogglePermission(role: UserRole, section: string, action: string) {
    const permission = this.permissions$().find(p => 
      p.role === role && p.section === section && p.action === action
    );
    if (permission) {
      await this.permissionRepo.update(permission.id, { 
        granted: !permission.granted 
      });
      await this.loadPermissions();
    }
  }
}
```
```

### Matrix Layout

```html
<table class="permissions-matrix">
  <thead>
    <tr>
      <th>Role \ Section \ Action</th>
      <th *ngFor="let section of sections">
        <span *ngFor="let action of actions">{{ section }}-{{ action }}</span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let role of roles">
      <td>{{ role }}</td>
      <td *ngFor="let section of sections; let i = index">
        <input 
          type="checkbox" 
          [checked]="isGranted(role, section, action)"
          (change)="onTogglePermission(role, section, action)"
          *ngFor="let action of actions"
        />
      </td>
    </tr>
  </tbody>
</table>
```

### Success Criteria

- ✅ Permissions load
- ✅ Toggles change permissions
- ✅ Changes persist in IndexedDB
- ✅ Admin-only guard works

---

## 📋 Phase 2.10: Orders Board (2.5 hours)

**Goal:** Trello-like board with drag-drop

### Deliverables

- [ ] `features/admin/orders/orders-board.component.ts`
- [ ] `features/admin/orders/order-detail.component.ts`
- [ ] Drag-drop with CDK

### Implementation

```typescript
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

export class OrdersBoardComponent {
  queue$ = signal<Order[]>([]);
  processing$ = signal<Order[]>([]);
  completed$ = signal<Order[]>([]);
  
  async loadOrders() {
    const orders = await this.orderRepo.getAll();
    this.queue$.set(orders.filter(o => o.status === 'queue'));
    this.processing$.set(orders.filter(o => o.status === 'processing'));
    this.completed$.set(orders.filter(o => o.status === 'completed'));
  }
  
  async drop(event: CdkDragDrop<Order[]>) {
    const order = event.item.data;
    const newStatus = this.getStatusFromIndex(event.container.data);
    
    await this.orderRepo.updateStatus(order.id, newStatus);
    await this.loadOrders();
  }
  
  private getStatusFromIndex(list: Order[]): OrderStatus {
    if (list === this.queue$()) return 'queue';
    if (list === this.processing$()) return 'processing';
    return 'completed';
  }
}
```

### Template

```html
<div class="orders-board" cdkDropListGroup>
  <div class="column">
    <h3>Queue</h3>
    <div 
      cdkDropList 
      [cdkDropListData]="queue$()" 
      class="drop-zone"
      (cdkDropListDropped)="drop($event)"
    >
      <div 
        *ngFor="let order of queue()"
        cdkDrag
        class="order-card"
        (click)="showDetail(order)"
      >
        <h4>Order #{{ order.id }}</h4>
        <p>{{ order.userId }}</p>
        <p>${{ order.total }}</p>
      </div>
    </div>
  </div>
  
  <div class="column">
    <h3>Processing</h3>
    <div 
      cdkDropList 
      [cdkDropListData]="processing$()" 
      class="drop-zone"
      (cdkDropListDropped)="drop($event)"
    >
      <!-- same as queue -->
    </div>
  </div>
  
  <div class="column">
    <h3>Completed</h3>
    <div 
      cdkDropList 
      [cdkDropListData]="completed$()" 
      class="drop-zone"
      (cdkDropListDropped)="drop($event)"
    >
      <!-- same as queue -->
    </div>
  </div>
</div>

<!-- Order Detail Modal -->
<app-modal [isOpen]="showModal()" [title]="'Order Details'">
  <div *ngIf="selectedOrder() as order">
    <p>Order ID: {{ order.id }}</p>
    <p>User: {{ order.userId }}</p>
    <p>Status: {{ order.status }}</p>
    <p>Total: ${{ order.total }}</p>
  </div>
</app-modal>
```

### Success Criteria

- ✅ Board displays 3 columns
- ✅ Orders load correctly
- ✅ Drag-drop updates status
- ✅ Status persists in IndexedDB
- ✅ Detail modal works

---

## 🏷️ Phase 2.11: Products Manager (1.5 hours)

**Goal:** Product CRUD with image upload

### Deliverables

- [ ] `features/admin/products/products.component.ts` — Table
- [ ] `features/admin/products/product-edit.component.ts` — Edit modal (Reactive Forms)
- [ ] `features/admin/products/product-create.component.ts` — Create modal (Reactive Forms)
- [ ] Image upload (base64)

### Patterns Used

- **FORMS** — [Reactive Forms with custom validators](../../../docs/framework/angular/patterns/FORMS.md) for product fields
- **ERROR_HANDLING** — Display validation errors, image upload errors, API errors
- **ACCESSIBILITY** — Form labels, image alt attributes, proper focus management in modal

### Product Edit Component

```typescript
export class ProductEditComponent {
  productForm: FormGroup;
  categories$ = signal<Category[]>([]);
  
  constructor() {
    this.productForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      categoryId: new FormControl('', [Validators.required]),
      image: new FormControl('')
    });
  }
  
  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const base64 = await this.fileToBase64(file);
      this.productForm.patchValue({ image: base64 });
    }
  }
  
  async onSubmit() {
    if (this.productForm.valid) {
      const product = this.productForm.value;
      if (this.isEdit) {
        await this.productRepo.update(this.productId, product);
      } else {
        await this.productRepo.create(product);
      }
      this.onClose();
    }
  }
  
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
```

### Success Criteria

- ✅ Products table loads
- ✅ Add/Edit modal works
- ✅ Image upload converts to base64
- ✅ Products persist
- ✅ Delete confirmation works

---

## 📂 Phase 2.12: Categories Manager (1 hour)

**Goal:** Category CRUD

### Deliverables

- [ ] `features/admin/categories/categories.component.ts` — Table
- [ ] `features/admin/categories/category-edit.component.ts` — Edit modal (Reactive Forms)

### Patterns Used

- **FORMS** — [Simple Reactive Forms validation](../../../docs/framework/angular/patterns/FORMS.md) in category-edit
- **ERROR_HANDLING** — Prevent delete if category has products, show validation errors

### Implementation

```typescript
export class CategoriesComponent {
  categories$ = signal<Category[]>([]);
  
  async loadCategories() {
    this.categories$.set(await this.categoryRepo.getAll());
  }
  
  async onDeleteCategory(category: Category) {
    // Check if category has products
    const products = await this.productRepo.getByCategory(category.id);
    if (products.length > 0) {
      alert('Cannot delete category with products');
      return;
    }
    if (confirm(`Delete ${category.name}?`)) {
      await this.categoryRepo.delete(category.id);
      await this.loadCategories();
    }
  }
}
```

### Success Criteria

- ✅ Categories load and display
- ✅ Add/Edit modal works
- ✅ Cannot delete if has products
- ✅ Persist to IndexedDB

---

## 🌱 Phase 2.13: Seed Data (1 hour)

**Goal:** Initialize demo data

### Deliverables

- [ ] Update `seed.service.ts` with demo data
- [ ] Run seed on first load

### Demo Data

```typescript
const demoUsers = [
  { 
    id: uuid(), 
    email: 'user@demo', 
    password: 'demo', 
    role: 'user' 
  },
  { 
    id: uuid(), 
    email: 'manager@demo', 
    password: 'demo', 
    role: 'manager' 
  },
  { 
    id: uuid(), 
    email: 'admin@demo', 
    password: 'demo', 
    role: 'admin' 
  }
];

const demoCategories = [
  { id: uuid(), name: 'Electronics', description: 'Electronic devices' },
  { id: uuid(), name: 'Clothing', description: 'Apparel and accessories' },
  { id: uuid(), name: 'Books', description: 'Books and reading materials' },
  { id: uuid(), name: 'Home', description: 'Home and garden' }
];

const demoProducts = [
  // 10-15 products across categories
];
```

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
src/app/core/bff/database.service.spec.ts
src/app/core/bff/repositories/*.spec.ts
src/app/core/bff/services/*.spec.ts
src/app/core/guards/*.spec.ts

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
   - Create `app/core/bff/database.service.ts`
   - Implement repositories
   - Write unit tests

3. Follow phases sequentially

Good luck! 🎉
