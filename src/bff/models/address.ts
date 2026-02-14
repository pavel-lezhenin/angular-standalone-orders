export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}
