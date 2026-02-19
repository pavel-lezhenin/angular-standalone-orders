import type { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication guard.
 * Protects routes that require user to be logged in.
 *
 * During SSR: always passes (no localStorage on server).
 * Session is restored via APP_INITIALIZER before guards run in browser.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);

  // During SSR, skip auth check - session will be restored in browser
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
