# Architecture: Angular Orders Management Platform

> Deep dive into the layered architecture, design decisions, and technical implementation details.

## 🏗️ Architectural Overview

The application follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    UI LAYER                         │
│  Components (Pages, Features, Shared UI)            │
│  Reactive Forms, Signals, Change Detection          │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 FEATURE LAYER                       │
│  Auth, Shop, Admin Modules                          │
│  Feature Services, Route Guards, Interceptors       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│               SHARED LAYER                          │
│  Reusable Components, Utilities, Types              │
│  NOT singleton, imported where needed               │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           CORE / BFF LAYER                          │
│  Data Access, Business Logic, Services              │
│  Singleton - imported once at root                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  Database Service (IndexedDB)                │   │
│  │  Repositories (CRUD Operations)              │   │
│  │  Services (Auth, Permission, Seed)           │   │
│  │  Guards & Interceptors                       │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          IndexedDB (Single Source of Truth)         │
│  7 Stores: users, products, orders, categories,     │
│  cart, order_items, permissions                     │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Layer Structure

### Core/BFF Layer (`app/core/bff/`)

**Purpose:** Encapsulate all data operations and business logic. IndexedDB is the single source of truth.

```
bff/
├── models/
│   └── index.ts              # TypeScript types (User, Product, Order, etc)
│
├── database.service.ts       # IndexedDB initialization & lifecycle
│
├── repositories/             # Data access objects (CRUD operations)
│   ├── user.repository.ts    # User CRUD + role management
│   ├── product.repository.ts # Product CRUD
│   ├── order.repository.ts   # Order CRUD + status management
│   ├── category.repository.ts# Category CRUD
│   └── cart.repository.ts    # Cart operations (add, remove, clear)
│
├── services/                 # Business logic & cross-cutting concerns
│   ├── permission.service.ts # RBAC: hasAccess(section, action)
│   ├── auth.service.ts       # Session management, login/logout
│   ├── seed.service.ts       # Initialize demo data
│   └── index.ts              # Barrel export
│
├── guards/                   # Route protection
│   ├── auth.guard.ts         # Require authentication
│   ├── admin.guard.ts        # Require admin/manager role
│   └── permission.guard.ts   # Custom permission checking
│
├── interceptors/             # HTTP middleware
│   └── auth.interceptor.ts   # Add token to requests (mock)
│
└── index.ts                  # Export all public APIs
```

**Key Principles:**
- ✅ Repositories follow **data mapper pattern** — clean separation between data & domain
- ✅ Services contain **business logic** — permission checking, session management
- ✅ Guards implement **access control** — checked before route activation
- ✅ All operations are **async** — IndexedDB is promise-based
- ✅ Single **IndexedDB instance** — initialized once, reused throughout app

### Features Layer (`features/`)

Each feature is **self-contained and independently lazy-loaded**. Features can import from Core and Shared, but NOT from other features.

```
features/
├── auth/
│   ├── login.component.ts         # Form with email/password
│   ├── login.component.html       # Template
│   ├── login.component.scss       # Styles
│   ├── login.component.spec.ts    # Unit tests
│   └── auth.routes.ts             # Auth feature routing
│
├── shop/
│   ├── shop.routes.ts             # Shop feature routing
│   ├── products-list.component.ts # Grid with category filter
│   ├── product-detail.component.ts# Modal or detail page
│   ├── cart.component.ts          # Shopping cart + checkout
│   ├── user-profile.component.ts  # Orders history + profile
│   ├── category-filter.component.ts# Reactive filter sidebar
│   └── (+ *.html, *.scss, *.spec.ts for each)
│
└── admin/
    ├── admin-layout.component.ts  # Container with sidebar
    ├── admin.routes.ts            # Admin feature routing
    ├── dashboard/                 # Dashboard feature
    ├── customers/                 # Customer management
    ├── permissions/               # RBAC matrix UI
    ├── orders/                    # Trello-like orders board
    ├── products/                  # Product manager
    └── categories/                # Category manager
```

**Route Configuration Pattern:**
```typescript
// Feature route definition
{
  path: 'shop',
  loadComponent: () => import('./shop-layout.component'),
  canActivate: [authGuard],
  children: [
    { path: '', loadComponent: () => import('./products-list.component') },
    { path: 'product/:id', loadComponent: () => import('./product-detail.component') },
    { path: 'cart', loadComponent: () => import('./cart.component') },
  ]
}
```

**Key Principles:**
- ✅ Each feature is **independently routable** — lazy loaded on demand
- ✅ Features own their **routing, state, and UI** — encapsulation
- ✅ Features **cannot import from other features** — prevents coupling
- ✅ Features inject from **Core & Shared** — unidirectional dependency

### Shared Layer (`shared/`)

Reusable, non-singleton components and utilities that any feature can use.

```
shared/
├── ui/
│   ├── table.component.ts         # Generic data table (header, rows, pagination)
│   ├── modal.component.ts         # Modal wrapper with overlay
│   ├── sidebar.component.ts       # Navigation sidebar
│   ├── filter-panel.component.ts  # Filter controls with checkboxes
│   ├── trello-board.component.ts  # Drag-drop board (CDK)
│   ├── button.component.ts        # Button wrapper with variants
│   ├── form-field.component.ts    # Form field wrapper
│   └── badge.component.ts         # Badge/tag component
│
├── utils/
│   ├── permission.utils.ts        # hasAccess(), getRolePermissions() helpers
│   ├── validation.utils.ts        # Custom form validators
│   └── formatting.utils.ts        # formatPrice(), formatDate()
│
├── types/
│   └── index.ts                   # Shared TypeScript types & constants
│
└── index.ts                       # Barrel export
```

**Key Principles:**
- ✅ Components are **NOT singletons** — instantiated per feature
- ✅ Components are **stateless** — accept inputs, emit outputs
- ✅ Utilities are **pure functions** — no side effects
- ✅ All reusable across features — high modularity

### Pages Layer (`pages/`)

Route components that orchestrate features, NOT business logic.

```
pages/
├── landing.component.ts  # Home page - no business logic
├── landing.component.html
└── landing.component.scss
```

**Key Principle:**
- ✅ Pages **compose features**, never implement logic directly
- ✅ Pages route to feature components
- ✅ Pages check auth status but delegate to services

---

## 🔄 Data Flow Architecture

### Request → Response Cycle

```
User Interaction
    ↓
  Component
    ├─ Input: User data
    ├─ Updates form or signal
    └─ Calls service method
    ↓
  Feature Service (if needed)
    ├─ Implements feature-specific logic
    └─ Calls repository
    ↓
  Repository
    ├─ Maps to/from IndexedDB
    ├─ Handles CRUD operations
    └─ Returns domain objects
    ↓
  IndexedDB
    └─ Persists data
    ↓
  Response travels back up
    ├─ Repository returns data
    ├─ Signal updates in component
    └─ UI re-renders
```

### State Management with Signals

```typescript
// In component or service
users$ = signal<User[]>([]);           // Mutable state
selectedUser = signal<User | null>(null);
isLoading = signal(false);

// Computed derived state
userCount = computed(() => this.users$().length);
hasUsers = computed(() => this.userCount() > 0);

// Effects for side effects
effect(() => {
  if (this.isLoading()) console.log('Loading...');
});
```

**Why Signals:**
- ✅ More efficient than observables for UI updates
- ✅ No unsubscribe needed (automatic cleanup)
- ✅ Synchronous access to state
- ✅ Built-in dependency tracking

---

## 🔐 Role-Based Access Control (RBAC)

### Design

Permission system is **role-based, not user-specific**.

Each user has a role: `user | manager | admin`

Each role has permissions for sections and actions:

```typescript
type Permission = {
  role: 'user' | 'manager' | 'admin';
  section: string;      // 'dashboard', 'products', 'orders', etc
  action: string;       // 'view', 'create', 'edit', 'delete'
  granted: boolean;     // true if allowed
}
```

### Permission Checking

```typescript
// In permission.service.ts
async hasAccess(section: string, action: string): Promise<boolean> {
  const user = await this.authService.getCurrentUser();
  const permissions = await this.permission.repository.getByRole(user.role);
  return permissions.some(p => 
    p.section === section && 
    p.action === action && 
    p.granted
  );
}

// In components
if (await this.permission.hasAccess('products', 'edit')) {
  // Show edit button
}

// In routes
canActivate: [permissionGuard('products', 'edit')]
```

### Permissions Matrix

| Role | Shop (Cart/Profile) | Dashboard | Customers | Permissions | Orders | Products | Categories |
|------|-------------|-----------|-----------|-------------|--------|----------|-----------|
| **User** | ✅ View own cart, profile, orders | ❌ | ❌ | ❌ | ✅ View own | ❌ | ❌ |
| **Manager** | ✅ View own | ✅ View | ❌ | ❌ | ✅ View, Edit (status) | ✅ CRUD | ✅ CRUD |
| **Admin** | ✅ View all | ✅ All | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD |

**Legend:**
- ✅ View = Read access only
- ✅ Edit (status) = Can change order status but not delete
- ✅ CRUD = Create, Read, Update, Delete
- ❌ = No access

---

## 💾 IndexedDB Schema

### Structure

**Database Name:** `OrdersDB`  
**Version:** `1`

### Stores

```typescript
// Users store
{
  keyPath: 'id',
  indexes: ['email']  // For fast email lookups
}

// Products store
{
  keyPath: 'id',
  indexes: ['categoryId']  // Products by category
}

// Orders store
{
  keyPath: 'id',
  indexes: ['userId', 'status']  // Orders by user, by status
}

// Categories store
{
  keyPath: 'id',
  indexes: []
}

// Order Items store
{
  keyPath: 'id',
  indexes: ['orderId', 'productId']
}

// Cart store
{
  keyPath: 'userId'  // One cart per user
}

// Permissions store
{
  keyPath: 'id',
  indexes: ['role']  // Permissions by role
}
```

### Initialization

```typescript
// database.service.ts
async initialize(): Promise<void> {
  const request = indexedDB.open('OrdersDB', 1);
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    // Create stores only if they don't exist
    if (!db.objectStoreNames.contains('users')) {
      db.createObjectStore('users', { keyPath: 'id' });
      // Create indexes
    }
    // ... create other stores
  };
}
```

---

## 🚀 Routing Architecture

### Route Structure

```
/                    (public)
/auth/login          (public)
/shop                (authGuard) + (user | manager | admin)
  /                  → products list
  /product/:id       → product detail
  /cart              → shopping cart
  /profile           → user profile
/admin               (authGuard) + (manager | admin)
  /dashboard         → dashboard
  /customers         → customer mgmt (admin only)
  /permissions       → permissions (admin only)
  /orders            → orders board
  /products          → product manager
  /categories        → category manager (admin only)
```

### Guard Implementation

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isAuthenticated$()) {
    return true;
  }
  
  // Store return URL for redirect after login
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

// admin.guard.ts
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const user = auth.currentUser$();
  
  return user && (user.role === 'admin' || user.role === 'manager');
};
```

---

## 🎯 Component Design Patterns

### Stateless Component Pattern

```typescript
@Component({
  selector: 'app-product-card',
  template: `
    <div class="card">
      <h3>{{ product().name }}</h3>
      <p>${{ product().price }}</p>
      <button (click)="onAddToCart()">Add to Cart</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<{ productId: string; quantity: number }>();
  
  onAddToCart(): void {
    this.addToCart.emit({ 
      productId: this.product().id, 
      quantity: 1 
    });
  }
}
```

### Service Injection Pattern

```typescript
@Component({...})
export class ProductListComponent {
  private productRepo = inject(ProductRepository);
  private permission = inject(PermissionService);
  
  products$ = signal<Product[]>([]);
  isLoading = signal(false);
  canEdit = signal(false);
  
  constructor() {
    this.loadProducts();
    effect(() => {
      this.checkPermissions();
    });
  }
  
  private async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const products = await this.productRepo.getAll();
      this.products$.set(products);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

## ⚡ Performance Considerations

### Bundle Size

```
Angular 21 standalone: ~150KB
App code: ~100KB
Total (gzipped): ~65KB
```

### Optimization Strategies

1. **Lazy Loading** — All features load on demand
2. **Tree Shaking** — Unused code removed in build
3. **OnPush Detection** — All components use it
4. **Signals** — More efficient than observables
5. **CSS Scoping** — Component styles don't leak
6. **Image Optimization** — Base64 for small images

### Performance Checklist

- ✅ Use `ChangeDetectionStrategy.OnPush`
- ✅ Use `trackBy` in `*ngFor`
- ✅ Use `async` pipe for observables
- ✅ Lazy load routes
- ✅ Implement pagination for large lists
- ✅ Defer heavy computations
- ✅ Cache computed results

---

## 🧪 Testing Architecture

### Test Pyramid

```
       /\
      /  \    E2E Tests (Playwright)
     /    \   Critical user journeys
    /______\
    
   /        \
  /  Unit    \  BFF services (80%+ coverage)
 / Tests      \ Repositories, guards
/______________\

     /\
    /  \       Integration Tests
   /    \      Features + Services
  /______\
```

### Testing Strategy

**BFF Services (90%+ coverage)**
- Test database.service.ts initialization
- Test each repository CRUD operation
- Test permission.service.ts logic
- Test auth.service.ts session management

**Component Tests (70%+ coverage)**
- Test form validation
- Test signal updates
- Test user interactions
- Test navigation

**E2E Tests (Playwright)**
- Login → Shop → Add to Cart → Checkout
- Login as Manager → Dashboard → Edit Product
- Login as Admin → Manage Users → Permissions
- Permission-based navigation

---

## 📋 Design Decisions & Rationale

### Why Signals instead of RxJS?

```typescript
// ✅ Signals (new way)
count$ = signal(0);
computed = computed(() => this.count$() * 2);

// ❌ RxJS (old way)
count$ = new BehaviorSubject(0);
computed$ = count$.pipe(map(x => x * 2));
```

**Benefits:**
- Simpler API (no pipe/subscribe)
- Better performance
- Automatic memory management
- Synchronous state access

### Why Repository Pattern?

Decouples domain from data access:

```typescript
// Domain layer (doesn't know about IndexedDB)
class OrderService {
  constructor(private orderRepo: OrderRepository) {}
  
  async getOrders(): Promise<Order[]> {
    return this.orderRepo.getAll();  // Works with any backend
  }
}

// Can switch from IndexedDB to REST API without changing service
```

### Why Lazy Loading?

```
Without: All code loaded at startup (250KB)
With: Core loaded (~80KB) + features on-demand (30-50KB each)
```

- Better startup performance
- Smaller initial bundle
- Progressive loading

---

## 🔗 Architecture Dependencies

```
                  Pages
                    ↓
            ┌───────┴───────┐
            ↓               ↓
          Admin           Shop
            ↓               ↓
      (Feature Layer)  (Feature Layer)
            ↓               ↓
        Shared UI Components
            ↓
    ┌───────┴───────────────────────┐
    ↓                               ↓
  Core/BFF              PermissionService
    ↓                        ↓
 IndexedDB          (Auth + RBAC)
```

**Rule:** No circular dependencies, only top-to-bottom

---

## 📖 Summary

This architecture provides:

- ✅ **Clear separation of concerns** — Core, Features, Shared, Pages
- ✅ **Scalability** — Easy to add new features
- ✅ **Testability** — Isolated layers, mockable dependencies
- ✅ **Maintainability** — Single responsibility principle
- ✅ **Performance** — Lazy loading, tree shaking, signals
- ✅ **Security** — RBAC, permission guards, no direct data access
- ✅ **Type safety** — TypeScript strict mode throughout
