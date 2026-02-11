/**
 * CartItem DTO for application layer
 * Used by CartService for UI state management
 */
export interface CartItemDTO {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

/**
 * Cart DTO for application layer
 */
export interface CartDTO {
  userId: string;
  items: CartItemDTO[];
  updatedAt: number;
}
