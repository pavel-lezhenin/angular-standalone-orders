import type { UserRole } from '@core/types';

/**
 * Session entity
 */
export interface Session {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}
