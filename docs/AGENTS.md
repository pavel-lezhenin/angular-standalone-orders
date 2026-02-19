# AI Agent Rules (Project-Specific)

This file contains package-level AI guidance for `angular-standalone-orders`.
Global agent personas and cross-repo standards remain in parent docs.

## Source of Truth Levels

1. **Global (parent repo):**
   - `docs/agents/OVERVIEW.md`
   - `docs/agents/ARCHITECT.md`
   - `docs/agents/DEVELOPER.md`
   - `docs/agents/TESTER.md`
   - `docs/agents/DESIGN.md`
2. **Project (this package):** this file + project docs in `docs/`.

## Project Context

- **Framework:** Angular 21, standalone-first (no NgModules)
- **Architecture:** Layered — `UI/Areas → Shared → Core → BFF → IndexedDB`
- **Areas:** `auth` (public), `shop` (user), `orders` (user), `account` (user), `admin` (manager/admin), `landing` (public)
- **State:** Angular Signals + `computed()` — no RxJS BehaviorSubject for state
- **Styling:** SCSS with CSS variables from `src/styles/variables/`
- **SSR:** Angular SSR enabled (`main.server.ts`, `server.ts`)
- **Accessibility:** WCAG AA target, AXE-clean

---

## Architecture Map

```
src/
├── app/          Bootstrap only: routes, providers, config
├── areas/        Feature areas — lazy loaded, access-controlled
│   ├── auth/       Public: login, register
│   ├── shop/       User: product browsing, search
│   ├── orders/     User: cart, checkout, payment, history, confirmation
│   ├── account/    User: profile, settings
│   ├── admin/      Role: manager/admin panel
│   └── landing/    Public: home page
├── core/         Singleton layer — imported ONCE at root
│   ├── guards/     Route guards (auth, role, permissions)
│   ├── interceptors/
│   ├── services/   App-wide services (auth, session)
│   └── models/     Core DTOs / domain types
├── shared/       Reusable — NOT singleton, imported where needed
│   ├── ui/         Dumb components (buttons, cards, modals)
│   ├── pipes/
│   ├── directives/
│   ├── services/   Utility services (toast, loader)
│   ├── models/     Shared interfaces
│   ├── utils/      Pure functions
│   ├── constants/
│   └── validators/
├── bff/          FakeBFF — simulates backend via IndexedDB
│   └── (7 stores: users, products, orders, categories, cart, order_items, permissions)
├── mocks/        MSW handlers + test fixtures
└── styles/       Design system tokens
    └── variables/  _colors.scss, _spacing.scss, _typography.scss, _components.scss
```

### Dependency Flow (STRICT — never reverse)

```
areas/* → shared → core → bff → IndexedDB
areas/* → core (allowed)
```

---

## @architect Rules (Project-Specific)

### Layer Violations (Always Check)

- ❌ `shared/` importing from `areas/` or `core/`
- ❌ `core/` importing from `areas/` or `shared/`
- ❌ `bff/` importing from `core/` or `areas/`
- ❌ `areas/X/` importing from `areas/Y/` (cross-area imports)
- ❌ Business logic (HTTP calls, data transforms) inside components
- ❌ Route guards placed outside `core/guards/`

### Area Structure (Each area must follow)

```
areas/<name>/
├── <name>.routes.ts         Required: lazy route config
├── <page>/
│   ├── <page>.component.ts
│   ├── <page>.component.html
│   └── <page>.component.scss
└── services/                Area-scoped services only
```

### Serena Analysis Prompts (for @architect)

```
Find all imports in areas/ that reference bff/ directly
Find components in areas/ that inject BFF services
Show dependency graph for src/core/
Find circular dependencies across src/
List all files that exceed 300 lines in src/areas/
Find cross-area imports between areas/auth, areas/shop, areas/orders
```

---

## @developer Rules (Project-Specific)

### Angular 21 Modern API (MANDATORY)

- Use `inject()` — NOT constructor injection
- Use `input()` / `output()` signals — NOT `@Input()` / `@Output()` decorators
- Use `signal()` + `computed()` — NOT `BehaviorSubject`
- `ChangeDetectionStrategy.OnPush` on ALL components
- `trackBy` required for all `@for` loops

```typescript
// ✅ Correct
readonly userId = input<string>();
readonly #authService = inject(AuthService);
readonly isLoading = signal(false);
readonly displayName = computed(() => this.userId() ?? 'Guest');

// ❌ Wrong
@Input() userId: string;
constructor(private authService: AuthService) {}
isLoading = false;
```

### CSS Variables (Design System from src/styles/variables/)

| Category   | Variable Pattern                        | File                  |
|------------|------------------------------------------|-----------------------|
| Colors     | `--app-primary`, `--text-*`, `--surface-*` | `_colors.scss`      |
| Spacing    | `--spacing-xs` → `--spacing-7xl`         | `_spacing.scss`       |
| Typography | `--font-size-2xs` → `--font-size-6xl`    | `_typography.scss`    |
| Components | `--btn-*`, `--input-*`, `--icon-*`       | `_components.scss`    |

### Responsive (STRICT — no @media)

```scss
// ✅ Only this pattern
:host-context(.mobile) { }
:host-context(.tablet), :host-context(.desktop) { }
:host-context(.dark-mode) { }

// ❌ Never
@media (max-width: 600px) { }
```

Dark mode toggled by `initDarkMode()` in `src/app/app.ts`.
Breakpoints toggled by `initBreakpoints()` in `src/app/app.ts`.

---

## @tester Rules (Project-Specific)

### Runner Boundaries (NEVER mix)

| Runner     | Scope       | Config                  |
|------------|-------------|--------------------------|
| Vitest     | `src/**`    | `vitest.config.ts`       |
| Playwright | `e2e/**`    | `playwright.config.ts`   |

### Test Priority

- **P0 (must have):** guards, auth/session logic, validators, pure mappers, permissions
- **P1 (should have):** Playwright E2E for: login, checkout flow, order history
- **P2 (nice to have):** Storybook visual tests (not merge-gate)

### Coverage Targets

```
Minimum: 80%
Target:  90%
P0 paths: 100%
```

### Angular TestBed Rules

- Do NOT reconfigure `TestBed` after `createComponent()`
- Prefer behavior assertions via DOM / user interaction over implementation details
- Use `await fixture.whenStable()` for async rendering
- With Vitest: native `async/await` or Vitest fake timers — avoid `fakeAsync`
- HTTP tests: `provideHttpClient()` BEFORE `provideHttpClientTesting()`
- Use `HttpTestingController` with `expectOne`, `flush`, `verify()` in `afterEach`
- No `as never` in specs — keep mocks contract-accurate (signals as signals, DTOs as DTOs)

### Serena Analysis Prompts (for @tester)

```
Find untested services in src/core/services/
Find components without spec files in src/areas/
Find test files using fakeAsync (should migrate to async/await)
List all guards and check if each has a corresponding spec
Show test coverage gaps in src/shared/utils/
```

---

## @design Rules (Project-Specific)

### Design Token Source

`src/styles/variables/` — single source of truth:

```
_colors.scss      — theme, surfaces, text, borders, status colors
_typography.scss  — 16 font sizes (2xs–6xl), 6 font weights
_spacing.scss     — xs–7xl scale (base: --app-spacing = 1rem)
_components.scss  — form fields, buttons, icon sizes
```

- ❌ Never add a hardcoded value without first adding it to `_*.scss`
- ❌ No inline styles — component SCSS files only
- ✅ Dark mode: `:host-context(.dark-mode)` class on `<html>`

---

## MCP Tools Available

**Configured in `.vscode/mcp.json`:**
- `@angular/cli mcp` — Angular CLI: generate, analyze, schematics

**When Serena extension installed:**
- Semantic code analysis, dependency graphs, layer violation detection, circular deps

**When Context7 extension installed:**
- Angular 21 Signals API, SSR patterns, latest Angular docs inline

---

## Related Project Docs

- `docs/ARCHITECTURE.md` — full layered architecture with diagrams
- `docs/IMPLEMENTATION.md` — implementation details
- `docs/PROJECT_STATUS.md` — current status and roadmap
- `docs/TESTING_PRIORITIES.md` — detailed test scope and exit criteria
- `docs/STORYBOOK_SETUP.md` — Storybook configuration
- `docs/FAKEBFF_ARCHITECTURE.md` — BFF/IndexedDB design
