import { UserRole } from '@core/types';

/**
 * Permission entity
 */
export interface Permission {
  id: string;
  role: UserRole;
  section: string; // 'dashboard', 'customers', 'permissions', 'orders', 'products', 'categories'
  action: string; // 'view', 'edit', 'delete', 'create'
  granted: boolean;
}
