import type { UserRole } from '../types/shared-types';

/**
 * Delivery address
 */
export interface AddressDTO {
  id: string;
  label: string; // e.g., "Home", "Office", "Mom's place"
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

/**
 * Saved payment method
 */
export interface SavedPaymentMethodDTO {
  id: string;
  type: 'card' | 'paypal';
  // For cards - store only non-sensitive data
  last4Digits?: string; // Last 4 digits of card (for display)
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  // For PayPal
  paypalEmail?: string;
  isDefault: boolean;
  createdAt: number;
}

/**
 * Payment method for UI components
 * Extended version with formatted display data
 */
export interface PaymentMethodDTO {
  id: string;
  label: string; // Display label (e.g., "Card •••• 4242" or "PayPal (user@example.com)")
  type: 'card' | 'paypal';
  isDefault: boolean;
  // For cards
  cardDetails?: {
    lastFourDigits: string;
    expiryMonth: number;
    expiryYear: number;
  };
  // For PayPal
  paypalEmail?: string;
}

/**
 * User profile DTO
 */
export interface UserProfileDTO {
  firstName: string;
  lastName: string;
  phone: string;
}

/**
 * User DTO for application layer
 * Contains user data without sensitive information (no password)
 */
export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfileDTO;
  createdAt: number;
}
