import type { UserRole } from '../types/shared-types';

/**
 * User profile DTO
 */
export interface UserProfileDTO {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

/**
 * User DTO for application layer
 * Contains user data without sensitive information (no password)
 */
export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfileDTO;
  createdAt: number;
}
