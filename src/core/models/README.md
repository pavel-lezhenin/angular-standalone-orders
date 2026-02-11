# Core Models (DTOs)

## Purpose
**DTOs for application layer** — data contracts for frontend use.

## What goes here
- **DTOs** (`*.dto.ts`) — Data Transfer Objects for app layer
- Clean data models without sensitive fields (e.g., no `password`)

## Rules
- ✅ Used by `@core` services (AuthService, PermissionService)
- ✅ Used by app layer (`@shared`, `@areas`)
- ✅ Import BFF types ONLY for type reference (not for direct use)
- ❌ **NO BFF imports in app code** — use these DTOs instead

## Architecture
```
BFF models (raw API) → Core DTOs (clean) → App layer
```

## Example
```typescript
// user.dto.ts - Clean DTO for app (no password)
export interface UserDTO {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  profile: { firstName: string; ... };
}

// App layer usage
import { User } from '@core';  // Actually imports UserDTO
const user: User = authService.currentUser();
```

## Exported as
DTOs are exported with clean names for convenience:
- `UserDTO` → exported as `User`
- `PermissionDTO` → exported as `Permission`
- `CartItemDTO` → stays as `CartItemDTO`
