/**
 * Product entity
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
  createdAt: number;
}

/**
 * Product with Category Response
 * BFF response type with enriched category information
 */
export interface ProductWithCategoryResponse {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
  categoryName?: string;
}
