import type { UserRole, UserProfileDTO, UserDTO } from '@core';

/**
 * Customer permissions
 */
export interface CustomerPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Customer form data (UI layer)
 */
export interface CustomerFormData extends UserProfileDTO {
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Create user DTO - UserDTO without id/createdAt but with password
 */
export type CreateUserDto = Omit<UserDTO, 'id' | 'createdAt'> & { password: string };

/**
 * Update user DTO - UserDTO without id/createdAt with optional password
 */
export type UpdateUserDto = Omit<UserDTO, 'id' | 'createdAt'> & { password?: string };
