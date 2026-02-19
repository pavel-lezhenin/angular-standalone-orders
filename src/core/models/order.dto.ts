import type { OrderStatus, PaymentStatus, UserRole } from '@core/types';

/**
 * Order item in the order
 */
export interface OrderItemDTO {
  productId: string;
  quantity: number;
  price: number; // Price at time of order
}

/**
 * Payment information DTO (sanitized - no sensitive data)
 */
export interface PaymentInfoDTO {
  cardNumber: string; // Last 4 digits only (e.g., "**** 4242")
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  paymentMethod: 'card' | 'paypal' | 'cash_on_delivery';
}

export interface OrderStatusChangeActorDTO {
  id: string;
  role: UserRole;
  email?: string;
}

export interface OrderStatusChangeDTO {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedAt: number;
  actor: OrderStatusChangeActorDTO;
}

export interface OrderCommentDTO {
  id: string;
  text: string;
  createdAt: number;
  actor: OrderStatusChangeActorDTO;
  isSystem?: boolean;
}

/**
 * Order DTO for application layer
 */
export interface OrderDTO {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItemDTO[];
  total: number;
  deliveryAddress: string;
  paymentInfo?: PaymentInfoDTO;
  supplierId?: string;
  estimatedDeliveryDate?: number;
  statusHistory?: readonly OrderStatusChangeDTO[];
  comments?: readonly OrderCommentDTO[];
  createdAt: number;
  updatedAt: number;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  actor?: OrderStatusChangeActorDTO;
}

export interface AddOrderCommentDTO {
  text: string;
  actor?: OrderStatusChangeActorDTO;
  isSystem?: boolean;
}

/**
 * Create order request DTO
 */
export interface CreateOrderDTO {
  userId: string;
  items: OrderItemDTO[];
  total: number;
  deliveryAddress: string;
  paymentInfo?: PaymentInfoDTO;
  supplierId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

/**
 * Payment request DTO (includes sensitive data)
 * Used only during checkout, NOT stored
 */
export interface PaymentRequestDTO {
  cardNumber: string; // Full card number (for validation only)
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string; // CVV code (for validation only)
  paymentMethod: 'card' | 'paypal' | 'cash_on_delivery';
}
