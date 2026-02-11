/**
 * BFF data models for Orders Management Platform
 *
 * DESIGN NOTES:
 *
 * User Profile:
 * - All profile fields (firstName, lastName, phone, address) are required
 * - Address stored in profile is user's default/primary address
 * - Future: Can extend to UserDetails with multiple addresses, payment methods, preferences
 *
 * Order:
 * - deliveryAddress is required and stores snapshot of address at order time
 * - This ensures order history remains accurate even if user changes their profile address
 * - By default, checkout should pre-fill with user's profile.address
 *
 * Future enhancement (if needed):
 * interface UserAddress {
 *   id: string;
 *   userId: string;
 *   type: 'home' | 'work' | 'other';
 *   street: string;
 *   city: string;
 *   country: string;
 *   postalCode: string;
 *   isDefault: boolean;
 * }
 */

import { OrderStatus, UserRole } from '@core/types';

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

export interface Category {
  id: string;
  name: string;
  description: string;
  settings?: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string; // Base64 encoded image
  createdAt: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // Price at time of order
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  deliveryAddress: string; // Required - snapshot of delivery address for this order
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: number;
}

export interface Permission {
  id: string;
  role: UserRole;
  section: string; // 'dashboard', 'customers', 'permissions', 'orders', 'products', 'categories'
  action: string; // 'view', 'edit', 'delete', 'create'
  granted: boolean;
}

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}
