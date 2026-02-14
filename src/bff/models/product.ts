/**
 * Product Specifications (technical characteristics)
 */
export interface ProductSpecification {
  name: string;
  value: string;
}

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
  
  // Image gallery - array of file IDs referencing files store
  imageIds: string[];
  
  // Technical specifications
  specifications: ProductSpecification[];
  
  // Legacy field for backward compatibility
  imageUrl?: string;
  
  createdAt: number;
  updatedAt?: number;
}

/**
 * Product with Category Response
 * BFF response type with enriched category information and resolved image URLs
 */
export interface ProductWithCategoryResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  
  // Resolved image URLs (from imageIds)
  imageUrls: string[];
  
  // Technical specifications
  specifications: ProductSpecification[];
  
  categoryName?: string;
  
  // Legacy support
  imageUrl?: string;
}
