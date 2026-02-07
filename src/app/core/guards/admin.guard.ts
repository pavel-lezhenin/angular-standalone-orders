import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../bff';

export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (user.role !== 'admin' && user.role !== 'manager') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
