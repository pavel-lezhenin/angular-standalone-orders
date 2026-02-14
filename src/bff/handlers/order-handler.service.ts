import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { OrderRepository } from '../repositories/order.repository';
import type { Order } from '../models';
import { OkResponse, CreatedResponse, NotFoundResponse, ServerErrorResponse } from './http-responses';

/**
 * Order Handler Service
 * Handles order-related API requests
 */
@Injectable({
  providedIn: 'root',
})
export class OrderHandlerService {
  constructor(private orderRepo: OrderRepository) {}

  /**
   * Handle get all orders request
   */
  async handleGetOrders(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const orders = await this.orderRepo.getAll();
      return new OkResponse({ orders });
    } catch (err) {
      return new ServerErrorResponse('Failed to fetch orders');
    }
  }

  /**
   * Handle create order request
   */
  async handleCreateOrder(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const order = req.body as Order;
      await this.orderRepo.create(order);
      return new CreatedResponse({ order });
    } catch (err) {
      return new ServerErrorResponse('Failed to create order');
    }
  }

  /**
   * Handle get order by ID request
   */
  async handleGetOrder(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').pop()!;
      const order = await this.orderRepo.getById(id);

      if (!order) {
        return new NotFoundResponse('Order not found');
      }

      return new OkResponse({ order });
    } catch (err) {
      return new ServerErrorResponse('Failed to fetch order');
    }
  }
}
