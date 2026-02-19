export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal';
  last4Digits?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  paypalEmail?: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}
