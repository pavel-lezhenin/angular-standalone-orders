import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Cart } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CartRepository {
  private storeName = 'cart';

  constructor(private db: DatabaseService) {}

  async getByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.db.read<Cart>(this.storeName, userId);
    return cart ?? null;
  }

  async create(cart: Cart): Promise<void> {
    await this.db.write(this.storeName, cart, 'add');
  }

  async update(userId: string, cart: Cart): Promise<void> {
    await this.db.write(this.storeName, cart, 'put');
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const cart = await this.getByUserId(userId);

    if (!cart) {
      // Create new cart
      await this.create({
        userId,
        items: [{ productId, quantity }],
        updatedAt: Date.now(),
      });
      return;
    }

    // Update existing cart
    const existingItem = cart.items.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    cart.updatedAt = Date.now();

    await this.update(userId, cart);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const cart = await this.getByUserId(userId);
    if (!cart) return;

    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = Date.now();

    await this.update(userId, cart);
  }

  async clear(userId: string): Promise<void> {
    await this.db.delete(this.storeName, userId);
  }
}
