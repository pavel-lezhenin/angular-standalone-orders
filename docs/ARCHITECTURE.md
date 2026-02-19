# Architecture: Angular Orders Management Platform

> Deep dive into the layered architecture, design decisions, and technical implementation details.

## 🏗️ Architectural Overview

The application follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    UI LAYER                         │
│  Components (Areas, Shared UI)                      │
│  Reactive Forms, Signals, Change Detection          │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 AREAS LAYER                         │
│  Auth (public), Shop (user), Admin (manager/admin)  │
│  Area Services, Route Guards, Lazy Loading          │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│               SHARED LAYER                          │
│  Reusable Components, Services, Utilities           │
│  NOT singleton, imported where needed               │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 CORE LAYER                          │
│  DTOs, Services, Guards, Interceptors               │
│  Singleton - imported once at root                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 BFF LAYER                           │
│  Database Service, Repositories, Domain Models      │
│  FakeBFFService (dev only)                          │
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

### Areas Layer (`areas/`)

**Purpose:** User-facing areas with different access levels based on RBAC.

```
areas/
├── auth/                     # Public area (authentication)
│   ├── auth.routes.ts
│   └── login/
│       ├── login.component.ts
│       ├── login.component.html
│       └── login.component.scss
│
├── landing/                  # Public home page
│   └── components/
│       └── landing.component.ts
│
├── shop/                     # User area (product browsing)
│   ├── shop.component.ts
│   ├── shop-product-detail/
│   └── ...
│
├── orders/                   # User area (cart, checkout, payment, history)
│   ├── cart/
│   ├── checkout/
│   ├── payment/
│   ├── order-history/
│   ├── order-confirmation/
│   ├── services/
│   └── ui/
│
├── account/                  # User area (profile, addresses, payment methods)
│   └── account.component.ts
│
└── admin/                    # Admin area (manager/admin roles)
    ├── admin.routes.ts
    ├── admin-layout.component.ts
    ├── dashboard/
    ├── customers/
    ├── orders/
    ├── products/
    ├── categories/
    └── permissions/
```

**Key Principles:**
- ✅ Areas are **lazy-loaded** — loaded only when accessed
- ✅ Areas have **route guards** — authGuard, adminGuard, permissionGuard
- ✅ Each area is a standalone component tree (no NgModules)
- ✅ RBAC segregation: Auth/Landing (public) → Shop/Orders/Account (user) → Admin (manager/admin)

### Core Layer (`src/core/`)

**Purpose:** Application DTOs, services, guards, interceptors.

```
core/
├── models/                   # DTOs for application layer
│   ├── user.dto.ts           # UserDTO, UserProfileDTO
│   ├── permission.dto.ts     # PermissionDTO
│   ├── cart.dto.ts           # CartItemDTO, CartDTO
│   └── index.ts              # Barrel export
│
├── types/                    # Shared types
│   └── shared-types.ts       # UserRole, OrderStatus
│
├── services/                 # Application services
│   ├── auth.service.ts       # Session, login/logout
│   └── permission.service.ts # RBAC checks
│
├── guards/                   # Route guards
│   └── index.ts              # authGuard, adminGuard, permissionGuard
│
├── interceptors/             # HTTP interceptors
│   └── api.interceptor.ts    # Routes /api/* to FakeBFFService (dev only)
│
└── index.ts                  # Export all public APIs
```

### BFF Layer (`src/bff/`)

**Purpose:** Backend-for-Frontend simulation. IndexedDB operations, repositories, fake API.

```
bff/
├── models/                   # BFF domain models
│   ├── user.ts               # User (with password, full data)
│   ├── permission.ts         # Permission
│   ├── cart.ts               # CartItem, Cart
│   ├── product.ts            # Product
│   ├── order.ts              # Order, OrderItem
│   └── index.ts              # Barrel export
│
├── database.service.ts       # IndexedDB initialization
│
├── fake-bff.service.ts       # Mock REST API (development only!)
│
├── repositories/             # Data access (CRUD operations)
│   ├── base.repository.ts    # Abstract base
│   ├── user.repository.ts    
│   ├── product.repository.ts 
│   ├── order.repository.ts   
│   ├── category.repository.ts
│   └── cart.repository.ts    
│
└── index.ts                  # Export public APIs
```

**Key Principles:**
- ✅ Core uses DTOs (clean, no sensitive data)
- ✅ BFF has full models (with password, etc)
- ✅ Repositories handle IndexedDB operations

**Development vs Production:**

In **development**:
```
Angular Service → HTTP Request → APIInterceptor → FakeBFFService → Repositories → IndexedDB
```

In **production**:
```
Angular Service → HTTP Request → Real Backend → Database
```

---

## 📦 Real BFF Structure (When Creating Backend)

When ready for production, create a separate `packages/orders-bff/` (Node.js + Express):

```
packages/
├── angular-standalone-orders/      # Frontend
│   └── src/
│       ├── core/                    # DTOs, services, guards
│       ├── bff/                     # (removed in production)
│       └── areas/
│
└── orders-bff/                      # Real Backend-For-Frontend
    ├── src/
    │   ├── routes/
    │   │   ├── auth.routes.ts       
    │   │   ├── products.routes.ts   
    │   │   └── orders.routes.ts     
    │   │
    │   ├── controllers/
    │   │   ├── auth.controller.ts   
    │   │   └── products.controller.ts
    │   │
    │   ├── middleware/
    │   │   └── auth.middleware.ts   
    │   │
    │   ├── database/
    │   │   └── models/
    │   │       ├── User.ts          
    │   │       └── Product.ts
    │   │
    │   └── index.ts                 
    │
    └── package.json
```

**Migration Steps:**
1. Create `packages/orders-bff/` with Express
2. Implement `/api/*` endpoints
3. Remove APIInterceptor from `app.config.ts`
4. Delete `src/bff/`
5. Frontend stays unchanged

---

### Shared Layer (`shared/`)

Reusable components, services, and utilities used across areas.

```
shared/
├── ui/                            # UI components
│   └── ...
│
├── services/                      # Shared services
│   ├── cart.service.ts            # Cart state management
│   └── layout.service.ts          # Layout state
│
├── models/                        # UI-specific models
│   └── nav.ts                     # Navigation types
│
└── utils/                         # Utilities
    └── ...
```

**Key Principles:**
- ✅ Components are **NOT singletons** — instantiated per area
- ✅ Components are **stateless** — accept inputs, emit outputs
- ✅ Utilities are **pure functions** — no side effects
- ✅ All reusable across areas

---

## 🔄 Data Flow Architecture

### Request → Response Cycle

```
User Interaction
    ↓
  Component (in Area)
    ├─ Input: User data
    ├─ Updates form or signal
    └─ Calls service method
    ↓
  Core Service (auth, permission)
  or Shared Service (cart, layout)
    ├─ Makes HTTP request to /api/*
    └─ APIInterceptor routes to FakeBFF
    ↓
  FakeBFFService
    └─ Calls appropriate repository
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
    ├─ Service returns DTOs
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

1. **Lazy Loading** — All areas load on demand
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
   /    \      Areas + Services
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
With: Core loaded (~80KB) + areas on-demand (30-50KB each)
```

- Better startup performance
- Smaller initial bundle
- Progressive loading

---

## 🔗 Architecture Dependencies

```
            ┌───────────────────────────────────────────────────────┐
            │          Area Layer (lazy-loaded)                    │
            │  Auth  Landing  Shop  Orders  Account  Admin         │
            └─────────────────────────────┬────────────────────────┘
                                      ↓
                             Shared UI Components
                                      ↓
                    ┌───────┬─────────────────────┐
                    ↓              ↓             ┃
                   Core            BFF            ┃
                    ↓              ↓             ┃
                 Services     Repositories        ┃
                    ↓              ↓             ┃
              PermissionService  IndexedDB   (area services)
```

**Rule:** No circular dependencies, only top-to-bottom

---

## � Demo Users & Data

**Default Demo Users:**
```
Email               | Password | Role
--------------------|----------|--------
user@demo           | demo     | User
manager@demo        | demo     | Manager
admin@demo          | demo     | Admin
```

**Demo Categories:**
- Electronics
- Clothing
- Books
- Home & Garden

**Demo Products:**
- 10-15 sample products distributed across categories
- Each with name, description, price (10-500), image (base64)
- Pre-assigned to categories

**Initialization:**
- Seed runs automatically on first app load
- Checks IndexedDB version (v1.0)
- Creates demo users, categories, products
- No seed on subsequent app loads

---

## �📖 Summary

This architecture provides:

- ✅ **Clear separation of concerns** — Core, BFF, Areas, Shared
- ✅ **Scalability** — Easy to add new areas
- ✅ **Testability** — Isolated layers, mockable dependencies
- ✅ **Maintainability** — Single responsibility principle
- ✅ **Performance** — Lazy loading, tree shaking, signals
- ✅ **Security** — RBAC, permission guards, no direct data access
- ✅ **Type safety** — TypeScript strict mode throughout
