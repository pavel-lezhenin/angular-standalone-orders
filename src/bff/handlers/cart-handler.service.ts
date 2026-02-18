import { Injectable, inject } from '@angular/core';
import type { HttpRequest, HttpResponse } from '@angular/common/http';
import { CartRepository } from '../repositories/cart.repository';
import type { Cart } from '../models';
import { OkResponse, BadRequestResponse, ServerErrorResponse } from './http-responses';

/**
 * Cart Handler Service
 * Handles cart-related API requests
 */
@Injectable({
  providedIn: 'root',
})
export class CartHandlerService {
  private readonly cartRepo = inject(CartRepository);

  /**
   * Handle get cart request
   */
  async handleGetCart(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      const cart = await this.cartRepo.getByUserId(userId);

      return new OkResponse(cart || { userId, items: [], updatedAt: Date.now() });
    } catch {
      return new ServerErrorResponse('Failed to fetch cart');
    }
  }

  /**
   * Handle update cart request
   */
  async handleUpdateCart(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      const { items, updatedAt } = req.body as { items: Cart['items']; updatedAt: number };
      const existingCart = await this.cartRepo.getByUserId(userId);

      if (existingCart) {
        await this.cartRepo.update(userId, {
          userId,
          items,
          updatedAt,
        });
      } else {
        await this.cartRepo.create({
          userId,
          items,
          updatedAt,
        });
      }

      const updatedCart = await this.cartRepo.getByUserId(userId);
      return new OkResponse(updatedCart);
    } catch {
      return new ServerErrorResponse('Failed to update cart');
    }
  }

  /**
   * Handle add cart item request
   */
  async handleAddCartItem(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      const { productId, quantity } = req.body as { productId: string; quantity: number };

      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      await this.cartRepo.addItem(userId, productId, quantity);
      const cart = await this.cartRepo.getByUserId(userId);

      return new OkResponse({ cart });
    } catch {
      return new ServerErrorResponse('Failed to add item to cart');
    }
  }

  /**
   * Handle remove cart item request
   */
  async handleRemoveCartItem(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/users\/([\w-]+)\/cart/)?.[1];
      const productId = req.url.split('/').pop();

      if (!userId || !productId) {
        return new BadRequestResponse('Invalid parameters');
      }

      await this.cartRepo.removeItem(userId, productId);
      const cart = await this.cartRepo.getByUserId(userId);

      return new OkResponse({ cart });
    } catch {
      return new ServerErrorResponse('Failed to remove item from cart');
    }
  }
}
