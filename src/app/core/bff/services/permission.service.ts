import { Injectable } from '@angular/core';
import { Permission } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  // In-memory cache of permissions
  private permissionsCache: Map<string, Permission[]> = new Map();

  constructor(private authService: AuthService) {}

  /**
   * Check if current user has access to section:action
   */
  hasAccess(section: string, action: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Admin has full access
    if (user.role === 'admin') {
      return true;
    }

    // Get permissions for user's role
    const rolePermissions = this.getPermissions(user.role);

    // Check if permission exists and is granted
    return rolePermissions.some(
      (p) => p.section === section && p.action === action && p.granted,
    );
  }

  /**
   * Get all permissions for a role
   */
  getPermissions(role: string): Permission[] {
    // Cache permissions by role
    const cached = this.permissionsCache.get(role);
    if (cached) return cached;

    // Build permissions based on role
    const permissions = this.buildPermissions(role);
    this.permissionsCache.set(role, permissions);
    return permissions;
  }

  /**
   * Build permissions for a role
   */
  private buildPermissions(role: string): Permission[] {
    const permissions: Permission[] = [];

    switch (role) {
      case 'user':
        permissions.push(
          // User can manage own cart
          {
            id: 'user-cart-crud',
            role: 'user',
            section: 'cart',
            action: 'crud',
            granted: true,
          },
          // User can edit own profile
          {
            id: 'user-profile-edit',
            role: 'user',
            section: 'profile',
            action: 'edit',
            granted: true,
          },
          // User can view own orders
          {
            id: 'user-orders-own-view',
            role: 'user',
            section: 'orders_own',
            action: 'view',
            granted: true,
          },
          // User can cancel own orders
          {
            id: 'user-orders-own-cancel',
            role: 'user',
            section: 'orders_own',
            action: 'cancel',
            granted: true,
          },
        );
        break;

      case 'manager':
        permissions.push(
          // Manager can view all orders
          {
            id: 'manager-orders-view',
            role: 'manager',
            section: 'orders_all',
            action: 'view',
            granted: true,
          },
          // Manager can edit order status
          {
            id: 'manager-orders-edit',
            role: 'manager',
            section: 'orders_all',
            action: 'edit',
            granted: true,
          },
          // Manager can view cancelled orders
          {
            id: 'manager-cancelled-orders-view',
            role: 'manager',
            section: 'cancelled_orders',
            action: 'view',
            granted: true,
          },
          // Manager can manage products
          {
            id: 'manager-products-crud',
            role: 'manager',
            section: 'products',
            action: 'crud',
            granted: true,
          },
          // Manager can manage categories
          {
            id: 'manager-categories-crud',
            role: 'manager',
            section: 'categories',
            action: 'crud',
            granted: true,
          },
        );
        break;

      case 'admin':
        // Admin gets full access via hasAccess() check
        break;
    }

    return permissions;
  }

  /**
   * Clear permissions cache
   */
  clearCache(): void {
    this.permissionsCache.clear();
  }
}
