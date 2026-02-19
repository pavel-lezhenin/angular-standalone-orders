import { Injectable, inject } from '@angular/core';
import { PermissionService } from '@core/services/permission.service';
import type { PermissionDTO } from '@core';
import type { UserRole } from '@core/types';
import type {
  PermissionManagementPermissions,
  PermissionsByRole,
  PermissionMatrixCell,
} from '../model';

/**
 * Permission management service (admin area)
 *
 * Provides CRUD operations for permissions
 * Works with PermissionService as data source
 */
@Injectable()
export class PermissionManagementService {
  private readonly permissionService = inject(PermissionService);

  private readonly roles: UserRole[] = ['user', 'manager', 'admin'];

  /**
   * Get permissions for current user (synchronous)
   */
  getPermissions(): PermissionManagementPermissions {
    return {
      canView: this.permissionService.hasAccess('permissions', 'view'),
      canEdit: this.permissionService.hasAccess('permissions', 'edit'),
    };
  }

  /**
   * Load all permissions grouped by role
   */
  async loadPermissions(): Promise<PermissionsByRole[]> {
    // Simulate async operation
    return Promise.resolve(
      this.roles.map((role) => ({
        role,
        permissions: this.permissionService.getPermissions(role),
      }))
    );
  }

  /**
   * Build permission matrix for UI
   * Returns a flat array of all role × section × action combinations
   */
  async loadPermissionMatrix(): Promise<PermissionMatrixCell[]> {
    const permissionsByRole = await this.loadPermissions();
    const matrix: PermissionMatrixCell[] = [];

    permissionsByRole.forEach(({ role, permissions }) => {
      permissions.forEach((permission) => {
        matrix.push({
          role,
          section: permission.section,
          action: permission.action,
          granted: permission.granted,
          permissionId: permission.id,
        });
      });
    });

    return matrix;
  }

  /**
   * Toggle permission on/off
   * In real app, this would update IndexedDB via HTTP
   * For now, we just update the in-memory cache
   */
  async togglePermission(
    _role: UserRole,
    _section: string,
    _action: string,
    _granted: boolean
  ): Promise<void> {
    // TODO: Implement actual persistence via BFF/repository
    // For now, this is a placeholder
    // Simulate async operation
    return Promise.resolve();
  }

  /**
   * Get all available roles
   */
  getRoles(): UserRole[] {
    return [...this.roles];
  }

  /**
   * Get permissions summary for a specific role
   */
  async getPermissionsSummary(role: UserRole): Promise<{
    total: number;
    granted: number;
    denied: number;
  }> {
    const permissions = this.permissionService.getPermissions(role);
    const granted = permissions.filter((p) => p.granted).length;

    return {
      total: permissions.length,
      granted,
      denied: permissions.length - granted,
    };
  }

  /**
   * Create a new custom permission
   */
  async createPermission(permissionData: {
    role: UserRole;
    section: string;
    action: string;
    granted: boolean;
  }): Promise<PermissionDTO> {
    // Simulate async operation
    return Promise.resolve(this.permissionService.addPermission(permissionData));
  }

  /**
   * Delete a custom permission
   */
  async deletePermission(permissionId: string): Promise<boolean> {
    // Simulate async operation
    return Promise.resolve(this.permissionService.deletePermission(permissionId));
  }
}
