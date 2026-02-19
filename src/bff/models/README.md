# BFF Models

## Purpose
Domain models for **Backend-For-Frontend (BFF) layer** — data access and API contracts.

## What goes here
- **BFF domain models** (`user.ts`, `product.ts`, `cart.ts`, etc.)
- Models used by **repositories** and **FakeBFFService**
- Represent data structure from API/database (IndexedDB in our case)

## Rules
- ✅ Used ONLY by `@bff` layer (repositories, fake-bff.service, database.service)
- ❌ **NEVER import directly in `@core` services or `@shared` components**
- ❌ **NEVER import directly in `@areas`**
- ⚠️ May contain sensitive data (e.g., `password` field) — never expose directly to app layer

## Architecture
```
Database/API → BFF repositories → BFF models → Core DTOs → App layer
```

## Example
```typescript
// user.ts - BFF model (raw API structure)
export interface User {
  id: string;
  email: string;
  password: string;  // ⚠️ Sensitive! Never expose to app layer
  role: UserRole;
  profile: { ... };
  createdAt: number;
}
```

## Usage
```typescript
// ✅ CORRECT (in repository)
import { User } from '@bff/models/user';

// ❌ WRONG (in core service)
import { User } from '@bff';  // Use @core models instead!
```
