/**
 * Product entity
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string; // Base64 encoded image
  createdAt: number;
}
