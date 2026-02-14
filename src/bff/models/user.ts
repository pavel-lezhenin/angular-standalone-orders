import { UserRole } from '@core/types';

/**
 * User entity
 * 
 * DESIGN NOTES:
 * - Profile contains only identity/contact fields
 * - Addresses and payment methods are normalized into dedicated stores
 */
export interface User {
  id: string;
  email: string;
  password: string; // For demo only - never use in production
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: number;
  updatedAt: number;
}

