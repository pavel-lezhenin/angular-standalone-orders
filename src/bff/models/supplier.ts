/**
 * Supplier/Vendor entity
 * Represents delivery companies or warehouse partners
 */
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  deliveryTimeHours: number; // Estimated delivery time in hours
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
