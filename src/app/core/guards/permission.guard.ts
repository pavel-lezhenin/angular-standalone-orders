import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Get required permission from route data
  const requiredSection = route.data['section'] as string;
  const requiredAction = route.data['action'] as string;

  if (!requiredSection || !requiredAction) {
    console.warn('Permission guard requires section and action in route data');
    return false;
  }

  if (permissionService.hasAccess(requiredSection, requiredAction)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
