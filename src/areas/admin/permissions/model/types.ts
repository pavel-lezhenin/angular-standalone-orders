import type { PermissionDTO } from '@core';
import type { UserRole } from '@core/types';

/**
 * Permission management permissions
 */
export interface PermissionManagementPermissions {
  canView: boolean;
  canEdit: boolean;
}

/**
 * Permission matrix grouped by role
 */
export interface PermissionsByRole {
  role: UserRole;
  permissions: PermissionDTO[];
}

/**
 * All available sections in the system
 */
export const PERMISSION_SECTIONS = [
  'cart',
  'profile',
  'orders_own',
  'orders_all',
  'cancelled_orders',
  'products',
  'categories',
  'customers',
  'permissions',
  'dashboard',
] as const;

export type PermissionSection = typeof PERMISSION_SECTIONS[number];

/**
 * All available actions in the system
 */
export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'crud',
  'cancel',
] as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[number];

/**
 * Permission matrix cell for UI
 */
export interface PermissionMatrixCell {
  role: UserRole;
  section: PermissionSection | string;
  action: PermissionAction | string;
  granted: boolean;
  permissionId?: string;
}
