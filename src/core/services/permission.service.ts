import { Injectable, inject } from '@angular/core';
import type { PermissionDTO } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  // In-memory cache of permissions
  private permissionsCache: Map<string, PermissionDTO[]> = new Map();

  // Custom permissions storage (in-memory, would be IndexedDB in real app)
  private customPermissions: PermissionDTO[] = [];

  private readonly authService = inject(AuthService);

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

    // Check if PermissionDTO exists and is granted
    return rolePermissions.some((p) => p.section === section && p.action === action && p.granted);
  }

  /**
   * Get all permissions for a role
   */
  getPermissions(role: string): PermissionDTO[] {
    // Cache permissions by role
    const cached = this.permissionsCache.get(role);
    if (cached) return cached;

    // Build permissions based on role
    const builtInPermissions = this.buildPermissions(role);

    // Add custom permissions for this role
    const roleCustomPermissions = this.customPermissions.filter((p) => p.role === role);

    const permissions = [...builtInPermissions, ...roleCustomPermissions];
    this.permissionsCache.set(role, permissions);
    return permissions;
  }

  /**
   * Build permissions for a role
   */
  private buildPermissions(role: string): PermissionDTO[] {
    const permissions: PermissionDTO[] = [];

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
          }
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
          }
        );
        break;

      case 'admin':
        // Admin gets full access via hasAccess() check
        break;
    }

    return permissions;
  }

  /**

  /**
   * Add a custom permission
   */
  addPermission(permission: Omit<PermissionDTO, 'id'>): PermissionDTO {
    const newPermission: PermissionDTO = {
      ...permission,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.customPermissions.push(newPermission);
    this.clearCache(); // Clear cache to rebuild with new permission

    return newPermission;
  }

  /**
   * Delete a custom permission by ID
   */
  deletePermission(permissionId: string): boolean {
    const index = this.customPermissions.findIndex((p) => p.id === permissionId);

    if (index === -1) {
      return false;
    }

    this.customPermissions.splice(index, 1);
    this.clearCache(); // Clear cache to rebuild without deleted permission

    return true;
  }

  /**
   * Update a permission's granted status
   */
  updatePermissionStatus(permissionId: string, granted: boolean): boolean {
    const permission = this.customPermissions.find((p) => p.id === permissionId);

    if (!permission) {
      return false;
    }

    permission.granted = granted;
    this.clearCache(); // Clear cache to apply changes

    return true;
  }

  /**
   * Get all custom permissions
   */
  getCustomPermissions(): PermissionDTO[] {
    return [...this.customPermissions];
  }
  /**
   * Clear permissions cache
   */
  clearCache(): void {
    this.permissionsCache.clear();
  }
}
