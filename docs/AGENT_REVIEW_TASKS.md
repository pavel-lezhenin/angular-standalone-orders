# Agent Review Tasks (2026-02-18)

> Результаты аудита: @architect · @developer · @tester · @design  
> Статус: 🔴 В работе

---

## 🔴 P0-1 — OnPush Change Detection

**Агент:** @developer + @architect  
**Оценка:** ~2 часа  
**Контекст:** Только 5 из 71 компонентов используют `ChangeDetectionStrategy.OnPush` (7%). Все компоненты работают на сигналах — `OnPush` обязателен.

- [ ] `src/areas/account/**` — добавить `OnPush` во все компоненты (10 шт.)
- [ ] `src/areas/admin/**` — добавить `OnPush` во все компоненты (~20 шт.)
- [ ] `src/areas/orders/**` — добавить `OnPush` (6 шт.)
- [ ] `src/areas/shop/**`, `auth/`, `landing/` — добавить `OnPush` (~15 шт.)
- [ ] `src/shared/ui/**` — добавить `OnPush` (~20 шт.)
- [ ] `src/app/app.ts` — добавить `OnPush`
- [ ] Запустить тесты после изменений — убедиться что всё зелёное

**Acceptance:** `Get-ChildItem -Path src -Recurse -Filter "*.ts" | Select-String "OnPush"` — 66+ результатов

---

## 🔴 P0-2 — `<img>` без `alt` (WCAG AA)

**Агент:** @design  
**Оценка:** 20 минут  
**Контекст:** 6 компонентов рендерят `<img>` без атрибута `alt` — нарушение WCAG 2.1 AA.

- [ ] `src/areas/admin/products/product-table/product-table.component.html` → добавить `[alt]="product.name"`
- [ ] `src/areas/orders/order-confirmation/order-confirmation.component.html` → добавить `[alt]="item.productName"`
- [ ] `src/areas/orders/ui/cart-items-table/cart-items-table.component.html` → добавить `[alt]="item.productName"`
- [ ] `src/areas/orders/ui/order-item-row/order-item-row.component.html` → добавить `[alt]="item.productName"`
- [ ] `src/shared/ui/image-zoom-dialog/image-zoom-dialog.component.html` → добавить описательный `alt`
- [ ] `src/shared/ui/product-card/product-card.component.html` → добавить `[alt]="product.name"`

**Acceptance:** `Get-ChildItem -Path src -Recurse -Filter "*.html" | Select-String "<img" | Where-Object { $_ -notmatch "alt=" }` — 0 результатов

---

## 🔴 P1 — Покрытие тестами (14% → 80%)

**Агент:** @tester  
**Оценка:** 10-15 часов  
**Контекст:** 10 spec-файлов из 71 компонента. BFF-репозитории не покрыты вообще.

- [ ] **Core** — добавить `api.interceptor.spec.ts`
- [ ] **BFF repositories** — `user.repository`, `product.repository`, `order.repository`, `cart.repository`, `category.repository` — unit-тесты с in-memory IndexedDB mock
- [ ] **areas/orders** — `cart/`, `checkout/`, `order-history/`, `payment/` компоненты
- [ ] **areas/account** — `profile-info`, `saved-addresses-manager`, `saved-payment-methods-manager`
- [ ] **areas/admin** — `dashboard`, `customers`, `products`, `categories`, `permissions`
- [ ] **shared/ui** — `filter-container`, `pagination`, `top-bar`, `product-card`
- [ ] Запустить `pnpm test:coverage` — убедиться что coverage ≥ 80%

**Acceptance:** `pnpm test:coverage` — строки ≥ 80%, ветки ≥ 75%

---

## 🟡 P2-1 — Доменные сервисы в `shared/` (нарушение слоёв)

**Агент:** @architect  
**Оценка:** 2-3 часа  
**Контекст:** `order.service.ts`, `payment.service.ts`, `payment-state.service.ts` в `src/shared/services/` — это доменная логика orders-области, не переиспользуемые утилиты.

- [ ] Создать `src/areas/orders/services/`
- [ ] Переместить `order.service.ts` → `src/areas/orders/services/`
- [ ] Переместить `payment.service.ts` + `payment-state.service.ts` → `src/areas/orders/services/`
- [ ] Обновить все импорты во всех затронутых компонентах
- [ ] Убедиться что `shared/services/` содержит только переиспользуемое: `cart`, `layout`, `notification`, `scroll`, `user-preferences`, `confirm-dialog`
- [ ] Запустить тесты

**Acceptance:** `src/shared/services/` не содержит order/payment логики

---

## 🟡 P2-2 — Убрать `console.log` из production кода

**Агент:** @developer  
**Оценка:** 1 час  
**Контекст:** Debug-logs в `app.config.ts`, `address.handler.ts`, `payment-method.handler.ts`, `account.component.ts` попадают в продакшн-бандл.

- [ ] Создать `src/core/services/logger.service.ts` (в production — no-op, в dev — прокидывает в console)
- [ ] Заменить/убрать `console.log` в `app.config.ts` (debug-сообщения об инициализации BFF и сессии)
- [ ] Заменить `console.log` в `src/areas/account/handlers/address.handler.ts`
- [ ] Заменить `console.log` в `src/areas/account/handlers/payment-method.handler.ts`
- [ ] `console.error` в handlers — обернуть в `LoggerService.error()`, не удалять
- [ ] `server.ts` — `console.log` для порта допустим, не трогать

**Acceptance:** `Get-ChildItem src -Recurse -Filter "*.ts" | Select-String "console\.(log|warn)" | Where-Object { $_ -notmatch "\.spec\." }` — 0 результатов в production-коде

---

## 🟢 P3 — `@media prefers-color-scheme` — архитектурное решение

**Агент:** @architect + @design  
**Оценка:** 30 минут  
**Контекст:** 3 файла используют `@media (prefers-color-scheme: dark)`. Формально нарушает правило «не использовать @media», но это системное условие, не брейкпоинт.

Затронутые файлы:
- `src/areas/landing/components/hero-section/hero-section.component.scss`
- `src/areas/landing/features/lead-capture/lead-capture-form.component.scss`
- `src/shared/ui/top-bar/top-bar.component.scss`

Выбрать один из вариантов:

- [ ] **Вариант A:** Добавить `.dark-mode` класс в `src/app/app.ts` (аналогично `.mobile/.tablet/.desktop`) и перейти на `:host-context(.dark-mode)` — единообразно с системой
- [ ] **Вариант B:** Задокументировать `@media (prefers-color-scheme: dark)` как разрешённое исключение в `copilot-instructions.md` (только для системных медиафич, не брейкпоинтов)

---

## 📊 Сводка

| # | Задача | Агент | Приоритет | Оценка | Статус |
|---|---|---|---|---|---|
| P0-1 | OnPush во все компоненты | @developer | 🔴 P0 | 2ч | Open |
| P0-2 | `<img>` без alt | @design | 🔴 P0 | 20м | Open |
| P1 | Покрытие тестами 14% → 80% | @tester | 🔴 P1 | 10-15ч | Open |
| P2-1 | Сервисы orders из shared/ в areas/ | @architect | 🟡 P2 | 2-3ч | Open |
| P2-2 | console.log → LoggerService | @developer | 🟡 P2 | 1ч | Open |
| P3 | Решение по dark-mode media | @architect | 🟢 P3 | 30м | Open |
