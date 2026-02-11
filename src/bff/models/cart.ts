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
 * Cart entity
 */
export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: number;
}
