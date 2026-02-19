# Shared Models

## Purpose
UI-specific models for **shared components** across the application.

## What goes here
- **UI models** (e.g., `NavItem` for navigation menu)
- **Utility types** for shared components
- Simple interfaces for component props/events

## Rules
- ✅ Used by `@shared/ui` components
- ✅ Can be used in `@areas` components
- ❌ **NO business logic** (use `@core` models instead)
- ❌ **NO API/BFF types** (use `@core` DTOs instead)
- ❌ **NO domain models** (User, Product, etc. belong in `@core`)

## Architecture
```
@shared/models → @shared/ui → @areas/components
```

## Example
```typescript
// nav.ts - UI model
export interface NavItem {
  label: string;
  route?: string;
  action?: () => void;
  icon?: string;
}
```

## ❌ What NOT to put here
- ~~CartItem~~ → use `@core/models/cart.dto.ts` (CartItemDTO)
- ~~User~~ → use `@core/models/user.ts`
- ~~Product~~ → use `@core/models` or `@bff/models`
