/**
 * Cart item in the shopping cart
 */
export interface CartItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

/**
 * Navigation item for configurable top bar menu
 */
export interface NavItem {
  label: string;
  route?: string;
  action?: () => void;
  icon?: string;
}

/**
 * Contact channel types for lead capture
 */
export type ContactChannel = 'email' | 'telegram' | 'whatsapp' | 'phone';

/**
 * Lead form submission data
 */
export interface LeadFormData {
  name: string;
  email: string;
  company?: string;
  channel: ContactChannel;
  channelValue?: string;
  message?: string;
  consent: boolean;
}
