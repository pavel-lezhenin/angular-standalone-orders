import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin/Manager guard.
 * Protects routes that require admin or manager role.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  
  if (user && (user.role === 'admin' || user.role === 'manager')) {
    return true;
  }

  // Redirect to login or access denied
  return router.createUrlTree(['/auth/login']);
};
