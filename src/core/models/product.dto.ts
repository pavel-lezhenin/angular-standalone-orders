/**
 * Product Specification DTO
 */
export interface ProductSpecificationDTO {
  name: string;
  value: string;
}

/**
 * Product DTO for application layer
 * Clean data model without sensitive fields
 */
export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  
  // Image URLs (resolved from imageIds)
  imageUrls: string[];
  
  // Technical specifications
  specifications: ProductSpecificationDTO[];
  
  // Legacy support
  imageUrl?: string;
}

/**
 * Product with full category information
 * Used for product listings with enriched data
 */
export interface ProductWithCategoryDTO extends ProductDTO {
  categoryName?: string;
}
