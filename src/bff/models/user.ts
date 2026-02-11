import { UserRole } from '@core/types';

/**
 * User entity
 * 
 * DESIGN NOTES:
 * - All profile fields (firstName, lastName, phone, address) are required
 * - Address stored in profile is user's default/primary address
 * - Future: Can extend to UserDetails with multiple addresses, payment methods, preferences
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
    address: string;
  };
  createdAt: number;
}
