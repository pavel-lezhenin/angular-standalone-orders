/**
 * BFF data models for Orders Management Platform
 */

export type UserRole = 'user' | 'manager' | 'admin';
export type OrderStatus = 'queue' | 'processing' | 'completed';

export interface User {
  id: string;
  email: string;
  password: string; // For demo only - never use in production
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
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
