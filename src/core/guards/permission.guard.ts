import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

/**
 * Permission-based guard.
 * Protects routes based on custom permission checks.
 *
 * Usage:
 * ```typescript
 * {
 *   path: 'products',
 *   canActivate: [permissionGuard],
 *   data: { section: 'products', action: 'view' }
 * }
 * ```
 */
export const permissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const section = route.data['section'] as string;
  const action = route.data['action'] as string;

  if (permissionService.hasAccess(section, action)) {
    return true;
  }

  // Redirect to access denied or login
  return router.createUrlTree(['/auth/login']);
};
