/**
 * User role type
 * Used across BFF and Frontend
 */
export type UserRole = 'user' | 'manager' | 'admin';

/**
 * Order status type - Complete workflow
 * Used across BFF and Frontend
 */
export type OrderStatus =
  | 'pending_payment' // Awaiting payment from customer
  | 'paid' // Payment confirmed
  | 'warehouse' // Being prepared in warehouse
  | 'courier_pickup' // Courier picked up from warehouse
  | 'in_transit' // On the way to customer
  | 'delivered' // Successfully delivered
  | 'cancelled'; // Order cancelled

/**
 * Payment status type
 */
export type PaymentStatus =
  | 'pending' // Not yet submitted
  | 'processing' // Being processed by payment gateway
  | 'approved' // Payment approved by bank
  | 'declined'; // Payment declined by bank
