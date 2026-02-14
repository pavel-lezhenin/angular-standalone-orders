import { OrderStatus, PaymentStatus } from '@core/types';

/**
 * Order item line
 */
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // Price at time of order
}

/**
 * Payment information
 */
export interface PaymentInfo {
  cardNumber: string;      // Last 4 digits only (e.g., "**** 4242")
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  paymentMethod: 'card' | 'paypal' | 'cash_on_delivery';
}

/**
 * Order entity
 * 
 * DESIGN NOTES:
 * - deliveryAddress is required and stores snapshot of address at order time
 * - This ensures order history remains accurate even if user changes their profile address
 * - By default, checkout should pre-fill with user's profile.address
 * - Payment info is sanitized (no CVV, only last 4 digits of card)
 * - supplierId links to supplier for delivery tracking
 */
export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;       // Required - snapshot of delivery address for this order
  paymentInfo?: PaymentInfo;     // Optional - payment details (sanitized)
  supplierId?: string;            // Optional - assigned supplier
  estimatedDeliveryDate?: number; // Optional - timestamp
  createdAt: number;
  updatedAt: number;
}
