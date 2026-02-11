/**
 * Cart item in the shopping cart
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: number;
}
