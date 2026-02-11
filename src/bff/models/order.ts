import { OrderStatus } from '@core/types';

/**
 * Order item line
 */
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // Price at time of order
}

/**
 * Order entity
 * 
 * DESIGN NOTES:
 * - deliveryAddress is required and stores snapshot of address at order time
 * - This ensures order history remains accurate even if user changes their profile address
 * - By default, checkout should pre-fill with user's profile.address
 */
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
