
**Project:** Angular Orders Management Platform  
**Pattern:** Layered Architecture (Core/Areas/Shared)  
**Framework:** Angular 21 + Material Design  
**Status:** ~82% Complete

**Quick Links:**
- [Project Status & Remaining Tasks](./docs/PROJECT_STATUS.md) ⭐
- [Progress Summary](./docs/PROGRESS_SUMMARY.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Implementation Guide](./docs/IMPLEMENTATION.md)

---

## 🎯 Current State (2026-02-14)

### ✅ What's Working (82%)
- Complete BFF layer with IndexedDB
- Full authentication & RBAC
- Admin CRUD: Products, Categories, Customers (100%)
- Shop: Browse, search, product details  
- Permissions matrix UI
- 15+ shared components
- SSR/SEO optimization

### 🚧 What's Missing (18%)
1. **Cart & Checkout** — Critical user flow
2. **Orders Board** — Admin Kanban drag-drop
3. **Dashboard widgets** — Real stats from BFF
4. **User orders integration** — Connect to BFF
5. **Tests** — Need 80%+ coverage

**See [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) for full details.**

---

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project-Specific Structure

This project uses **Areas-based architecture** for RBAC:

- `areas/auth/` — Public area (login, register)
- `areas/shop/` — User area (products, cart, checkout)  
- `areas/admin/` — Manager/Admin area (dashboard, orders, customers)

Each area has:
- Own routing module (e.g., `auth.routes.ts`)
- Layout component (e.g., `shop-layout.component.ts`)
- Lazy-loaded modules with guards

**Core layers:**
- `bff/` — IndexedDB repositories, FakeBFF service, domain models
- `core/` — DTOs, services, guards, interceptors
- `shared/` — Reusable UI components, pipes, directives

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for areas routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
