import { UserRole } from '@core/types';

/**
 * Customer permissions
 */
export interface CustomerPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * User profile DTO
 */
export interface UserProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

/**
 * Customer form data (UI layer)
 */
export interface CustomerFormData extends UserProfileDto {
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Base user DTO
 */
export interface BaseUserDto {
  email: string;
  role: UserRole;
  profile: UserProfileDto;
}

/**
 * Create user DTO
 */
export interface CreateUserDto extends BaseUserDto {
  password: string;
}

/**
 * Update user DTO
 */
export interface UpdateUserDto extends BaseUserDto {
  password?: string;
}
