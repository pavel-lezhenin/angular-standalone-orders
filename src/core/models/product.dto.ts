/**
 * Product DTO for application layer
 * Clean data model without sensitive fields
 */
export interface ProductDTO {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
}

/**
 * Product with full category information
 * Used for product listings with enriched data
 */
export interface ProductWithCategoryDTO extends ProductDTO {
  categoryName?: string;
}
