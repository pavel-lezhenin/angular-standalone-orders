import type { ProductDTO, ProductSpecificationDTO } from '@core';

/**
 * Product permissions
 */
export interface ProductPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Product form data (UI layer)
 */
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageIds: string[];
  specifications: ProductSpecificationDTO[];
}

/**
 * Create product DTO - ProductDTO without id
 */
export type CreateProductDTO = Omit<ProductDTO, 'id'>;

/**
 * Update product DTO - ProductDTO without id
 */
export type UpdateProductDTO = Omit<ProductDTO, 'id'>;
