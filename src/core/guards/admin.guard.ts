import type { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin/Manager guard.
 * Protects routes that require admin or manager role.
 * 
 * During SSR: always passes (no localStorage on server).
 * Session is restored via APP_INITIALIZER before guards run in browser.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);

  // During SSR, skip auth check - session will be restored in browser
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  
  if (user && (user.role === 'admin' || user.role === 'manager')) {
    return true;
  }

  // Redirect to login or access denied
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
