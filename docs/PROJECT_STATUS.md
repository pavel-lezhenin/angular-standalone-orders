# Project Status

**Angular Orders Management Platform** — Enterprise-grade template

**Overall Progress:** ~90% Complete

**Last Updated:** 2026-02-18

---

## ✅ Completed Features (82%)

### Infrastructure & Core (100%)
- ✅ IndexedDB BFF layer with repositories
- ✅ Authentication system (login, guards, session)
- ✅ Role-based access control (RBAC)
- ✅ SEO optimization (SSR, meta tags, sitemap)
- ✅ Routing with lazy loading
- ✅ Error handling & interceptors
- ✅ Design system (Material + custom theme)

### Public Areas (98%)
- ✅ Landing page (hero, features, FAQ, contact)
- ✅ Shop products list with filters
- ✅ Product detail page with image gallery
- ✅ Search functionality
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Cart page with selection and restore-safe loading
- ✅ Checkout flow (guest + authenticated)
- ✅ Payment page and processing simulation
- ✅ Order confirmation integration after successful payment

### Admin Areas (96%)
- ✅ Admin layout with sidebar navigation
- ✅ **Customers** - Full CRUD (100%)
- ✅ **Products** - Full CRUD with image upload (100%)
- ✅ **Categories** - Full CRUD (100%)
- ✅ **Permissions** - Matrix view with edit dialog (100%)
- ✅ Dashboard page structure
- ✅ Orders board (Kanban UI + live loading + drag-drop + transition validation)

### Shared Components (100%)
- ✅ TopBar, Footer, UserMenu
- ✅ PageLoader, FilterContainer
- ✅ ProductCard, ImageGallery
- ✅ SearchInput, Pagination
- ✅ DialogComponent, ConfirmDialog
- ✅ CartButton (UI only)

### Account & Preferences (100%)
- ✅ Address management (select/add/delete/set default)
- ✅ Payment method management (select/add/delete/set default)
- ✅ Safety constraints for deleting default address/payment method
- ✅ Deduplication of saved payment methods
- ✅ User order history integration (dedicated endpoint, details route, cancel, pagination)

---

## 🚧 Remaining Tasks (non-scope)

### Critical (Must Have)

#### 1. Orders Board (Admin)
**Status:** Completed  
**Priority:** Delivered

- [x] Kanban columns by current order statuses
- [x] Drag-drop transitions with validation
- [x] Order status persistence to IndexedDB via BFF
- [x] Order details with manager operational notes
- [x] Manager-friendly customer metadata on cards

---

#### 2. Dashboard Widgets (~2h)
**Status:** Empty shell  
**Priority:** MEDIUM

**Current:** Basic component  
**Needed:** Real stats widgets

- [ ] Total orders card (count, revenue)
- [ ] Recent orders table (last 5)
- [ ] Orders by status chart
- [ ] Top products widget
- [ ] Customer growth card
- [ ] Load data from BFF repositories

**Acceptance:**
- Shows real-time stats from IndexedDB
- Auto-refreshes on data changes
- Responsive cards layout

---

#### 3. User Orders History
**Status:** Completed  
**Priority:** Delivered

- [x] Connected to dedicated user orders BFF endpoint
- [x] Loads only authenticated user's orders
- [x] Dedicated order details route from history
- [x] Cancel action for eligible statuses only
- [x] Pagination and empty state handling

---

#### 4. Account Profile Editing (~1h)
**Status:** TODO comment  
**Priority:** LOW

**Current:** Form exists, save is TODO  
**Needed:** Persist changes

- [ ] Implement save profile method
- [ ] Connect to users repository
- [ ] Update user in IndexedDB
- [ ] Success/error notifications
- [ ] Form validation

**Acceptance:**
- User can update firstName, lastName, phone
- Changes persist after page reload
- Email remains read-only

---

### Testing & Quality (~4h)

#### 5. Unit Tests
**Status:** Minimal coverage  
**Target:** 80%+ coverage

- [ ] Core services tests (auth, permission)
- [ ] BFF repositories tests
- [ ] Component tests (admin CRUD)
- [ ] Form validation tests
- [ ] Guard tests

---

#### 6. E2E Tests
**Status:** 2 basic tests  
**Target:** Complete user flows

- [ ] Shopping flow (browse → add to cart → checkout)
- [ ] Admin CRUD flows (products, categories, customers)
- [ ] Authentication flows
- [ ] Permission-based access tests
- [ ] Orders workflow

---

#### 7. Permission Persistence
**Status:** TODO comment  
**Priority:** LOW

**Current:** In-memory only  
**Needed:** IndexedDB storage

- [ ] Save permission changes to repository
- [ ] Load permissions on app init
- [ ] Sync with role changes

---

## 📊 Progress by Phase

| Phase | Component | Status | Progress |
|-------|-----------|--------|----------|
| 2.1 | BFF Foundation | ✅ Done | 100% |
| 2.2 | Authentication | ✅ Done | 100% |
| 2.3 | Landing Page | ✅ Done | 100% |
| 2.4 | Shop Module | ✅ Done | 95% (minor polish left) |
| 2.5 | Shared UI | ✅ Done | 100% |
| 2.6 | Admin Layout | ✅ Done | 100% |
| 2.7 | Dashboard | ⏸️ Partial | 30% (needs widgets) |
| 2.8 | Customers | ✅ Done | 100% |
| 2.9 | Permissions | ✅ Done | 95% (persistence TODO) |
| 2.10 | Orders Board | ✅ Done | 100% |
| 2.11 | Products | ✅ Done | 100% |
| 2.12 | Categories | ✅ Done | 100% |
| 2.13 | Seed Data | ✅ Done | 100% |
| 2.14 | Tests & Polish | ⏸️ Partial | 20% |

---

## 🎯 Priority Order (Top → Bottom)

1. **Orders Board** (admin core feature)
2. **Dashboard Widgets** (admin overview)
3. **User Orders History** (essential for users)
4. **Unit Tests** (quality & stability)
5. **E2E Tests** (integration coverage)
6. **Account Profile Save** (minor enhancement)
7. **Permission Persistence** (minor enhancement)

---

## 📝 Notes

- All admin CRUD operations are fully functional
- BFF layer is production-ready for migration
- Design system is complete and documented
- SSR/SEO optimization implemented
- No blockers, all tasks are independent

---

## � Known Architecture Issues

### 1. Payment Forms Duplication (HIGH PRIORITY)

**Status:** 🔴 Open — [PAYMENT_FORMS_REFACTORING.md](./PAYMENT_FORMS_REFACTORING.md)  
**Estimated Effort:** 4-6 hours

**Problem:**
- `shared/ui/payment-form/` (270 lines, Smart)
- `areas/account/ui/payment-method-form/` (85 lines, Dumb)
- ~60% code duplication (card inputs, validation, formatting)

**Impact:**
- Violates DRY principle
- Maintenance burden (changes need 2 locations)
- Unclear responsibility boundaries

**Proposed Solution:**
1. Extract `shared/ui/payment-card-fields/` (Dumb UI component)
2. Refactor both components to use shared UI
3. Move orchestration to domain layers

**Blocker:** None — can be done anytime  
**Recommendation:** Complete after orders area decomposition

---

### 2. Orders Area Decomposition (CRITICAL)

**Status:** 🔴 Open — Needs analysis  
**Estimated Effort:** 8-12 hours

**Problem:**
- Orders domain lacks proper layered decomposition
- Mixed concerns and responsibilities
- `PaymentFormComponent` in `shared/ui/` should be in `areas/orders/ui/`

**Impact:**
- Harder to maintain and extend
- Violates layered architecture boundaries (Areas → Shared → Core → BFF)
- Confusing for new developers

**Proposed Solution:**
1. Analyze orders flow and components
2. Refactor into proper layered structure within `areas/orders/`
3. Move checkout-specific components from `shared/` to `areas/orders/`
4. Separate concerns: layout, components, services

**Blocker:** Requires architectural planning  
**Recommendation:** Complete BEFORE payment forms refactoring

**Related:** See [UI_DECOMPOSITION_ANALYSIS.md](./UI_DECOMPOSITION_ANALYSIS.md)

---

## 🚀 Quick Wins

Easy tasks that add value:

1. **Account profile save** (~1h) - Form ready, just needs BFF call
2. **Permission persistence** (~30min) - Repository exists, just wire it
3. **Dashboard basic stats** (~1h) - Simple count queries
4. **Orders mock → real data** (~1h) - Connect existing BFF

---

**Next recommended task:** Orders area decomposition planning (architectural foundation for future refactoring)

---

## 🔍 Agent Review (2026-02-18)

> Full audit: @architect · @developer · @tester · @design

---

### 🔴 P0 — OnPush Change Detection (66 компонентов)

**Статус:** Open  
**Оценка:** ~2 часа  
**Агент:** @developer + @architect

**Проблема:** Только 5 из 71 компонентов используют `ChangeDetectionStrategy.OnPush` (7%).  
Все компоненты на сигналах — `OnPush` обязателен.

**Шаги:**

- [ ] **Шаг 1.** `src/areas/account/**` — добавить `OnPush` во все компоненты (10 шт.)
- [ ] **Шаг 2.** `src/areas/admin/**` — добавить `OnPush` во все компоненты (~20 шт.)
- [ ] **Шаг 3.** `src/areas/orders/**` — добавить `OnPush` (6 шт.)
- [ ] **Шаг 4.** `src/areas/shop/**`, `auth/`, `landing/` — добавить `OnPush` (~15 шт.)
- [ ] **Шаг 5.** `src/shared/ui/**` — добавить `OnPush` (~20 шт.)
- [ ] **Шаг 6.** `src/app/app.ts` — добавить `OnPush`
- [ ] **Шаг 7.** Запустить тесты — убедиться что всё зелёное после изменений

**Acceptance:** `Get-ChildItem -Path src -Recurse -Filter "*.ts" | Select-String "OnPush"` — 66+ результатов

---

### 🔴 P0 — `<img>` без `alt` (6 компонентов)

**Статус:** Open  
**Оценка:** 20 минут  
**Агент:** @design

**Проблема:** 6 компонентов рендерят `<img>` без атрибута `alt` — нарушение WCAG AA.

**Шаги:**

- [ ] `src/areas/admin/products/product-table/product-table.component.html` → добавить `[alt]="product.name"`
- [ ] `src/areas/orders/order-confirmation/order-confirmation.component.html` → добавить `[alt]="item.productName"`
- [ ] `src/areas/orders/ui/cart-items-table/cart-items-table.component.html` → добавить `[alt]="item.productName"`
- [ ] `src/areas/orders/ui/order-item-row/order-item-row.component.html` → добавить `[alt]="item.productName"`
- [ ] `src/shared/ui/image-zoom-dialog/image-zoom-dialog.component.html` → добавить описательный `alt`
- [ ] `src/shared/ui/product-card/product-card.component.html` → добавить `[alt]="product.name"`

**Acceptance:** `Get-ChildItem -Path src -Recurse -Filter "*.html" | Select-String "<img" | Where-Object { $_ -notmatch "alt=" }` — 0 результатов

---

### 🔴 P1 — Покрытие тестами (14% → 80%)

**Статус:** Open  
**Оценка:** 10-15 часов  
**Агент:** @tester

**Проблема:** 10 spec-файлов из 71 компонента. BFF-репозитории не покрыты вообще.

**Приоритет по слоям:**

- [ ] **Шаг 1. Core (P0)** — уже есть guards + services. Добавить: `api.interceptor.spec.ts`
- [ ] **Шаг 2. BFF repositories (P0)** — `user.repository`, `product.repository`, `order.repository`, `cart.repository`, `category.repository` — unit-тесты с in-memory IndexedDB mock
- [ ] **Шаг 3. areas/orders (P1)** — `cart/`, `checkout/`, `order-history/`, `payment/` компоненты
- [ ] **Шаг 4. areas/account (P1)** — `profile-info`, `saved-addresses-manager`, `saved-payment-methods-manager`
- [ ] **Шаг 5. areas/admin (P1)** — `dashboard`, `customers`, `products`, `categories`, `permissions`
- [ ] **Шаг 6. shared/ui (P2)** — `filter-container`, `pagination`, `top-bar`, `product-card`
- [ ] **Шаг 7.** Запустить `pnpm test:coverage` — убедиться что coverage ≥ 80%

**Acceptance:** `pnpm test:coverage` — строки ≥ 80%, ветки ≥ 75%

---

### 🟡 P2 — Доменные сервисы в `shared/` (нарушение слоёв)

**Статус:** Open  
**Оценка:** 2-3 часа  
**Агент:** @architect

**Проблема:** `order.service.ts`, `payment.service.ts`, `payment-state.service.ts` находятся в `src/shared/services/` — это доменная логика orders-области, а не переиспользуемая утилита.

**Шаги:**

- [ ] **Шаг 1.** Создать `src/areas/orders/services/`
- [ ] **Шаг 2.** Переместить `order.service.ts` → `src/areas/orders/services/`
- [ ] **Шаг 3.** Переместить `payment.service.ts` + `payment-state.service.ts` → `src/areas/orders/services/`
- [ ] **Шаг 4.** Обновить все импорты во всех затронутых компонентах
- [ ] **Шаг 5.** Убедиться что `shared/` ссылается только на переиспользуемые логики (cart, layout, notification, scroll, user-preferences)
- [ ] **Шаг 6.** Запустить тесты

**Acceptance:** `src/shared/services/` не содержит order/payment логики

---

### 🟡 P2 — Убрать `console.log` из production кода

**Статус:** Open  
**Оценка:** 1 час  
**Агент:** @developer

**Проблема:** Debug-logs в `app.config.ts`, `address.handler.ts`, `payment-method.handler.ts`, `account.component.ts` попадают в продакшн-бандл.

**Шаги:**

- [ ] **Шаг 1.** Создать `src/core/services/logger.service.ts` (обёртка, в production — no-op или отправка в monitoring)
- [ ] **Шаг 2.** Заменить `console.log` в `app.config.ts` на `LoggerService` или убрать (там debug-сообщения об инициализации)
- [ ] **Шаг 3.** Заменить `console.log` в `address.handler.ts`, `payment-method.handler.ts`
- [ ] **Шаг 4.** `console.error` в handlers оставить — они сигнализируют о реальных ошибках, но обернуть в `LoggerService.error()`
- [ ] **Шаг 5.** `server.ts` — `console.log` для порта допустим

**Acceptance:** `Get-ChildItem src -Recurse -Filter "*.ts" | Select-String "console\.(log|warn)" | Where-Object { $_ -notmatch "\.spec\." }` — 0 результатов в production-коде

---

### 🟢 P3 — `@media (prefers-color-scheme: dark)` — решение

**Статус:** Требует решения  
**Агент:** @architect + @design

**Проблема:** 3 файла используют `@media (prefers-color-scheme: dark)`. Формально нарушает правило «не использовать @media», но это системное условие, а не брейкпоинт.

**Задача:** Принять архитектурное решение:
- [ ] **Вариант A:** Добавить `.dark-mode` класс в `app.ts` (аналогично `.mobile/.tablet/.desktop`) и перейти на `:host-context(.dark-mode)` — единообразно
- [ ] **Вариант B:** Задокументировать `prefers-color-scheme` как разрешённое исключение в `copilot-instructions.md`

---

### 📊 Сводка по агентам

| Агент | Найденных проблем | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| @architect | 3 | 0 | 0 | 2 | 1 |
| @developer | 3 | 1 | 0 | 1 | 0 |
| @tester | 1 | 1 | 1 | 0 | 0 |
| @design | 2 | 1 | 0 | 0 | 1 |
| **Итого** | **9** | **3** | **1** | **3** | **2** |

