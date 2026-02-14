import { OrderStatus, PaymentStatus, UserRole } from '@core/types';

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

export interface OrderStatusChangeActor {
  id: string;
  role: UserRole;
  email?: string;
}

export interface OrderStatusChange {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedAt: number;
  actor: OrderStatusChangeActor;
}

export interface OrderComment {
  id: string;
  text: string;
  createdAt: number;
  actor: OrderStatusChangeActor;
  isSystem?: boolean;
}

/**
 * Order entity
 * 
 * DESIGN NOTES:
 * - deliveryAddress is required and stores snapshot of address at order time
 * - This ensures order history remains accurate even if user changes saved addresses later
 * - Checkout should pre-fill from normalized addresses store
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
  statusHistory?: readonly OrderStatusChange[];
  comments?: readonly OrderComment[];
  createdAt: number;
  updatedAt: number;
}
