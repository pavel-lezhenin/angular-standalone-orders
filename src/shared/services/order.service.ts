import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AddOrderCommentDTO, OrderDTO, CreateOrderDTO, UpdateOrderStatusDTO } from '@core/models';

/**
 * Order Service
 *
 * Pure HTTP service for order operations
 * Uses HTTP requests that are intercepted by FakeBFFService
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/orders';

  /**
   * Creates a new order
   *
   * @param data - Order creation data
   * @returns Created order with generated ID
   */
  async createOrder(data: CreateOrderDTO): Promise<OrderDTO> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ order: OrderDTO }>(`${this.apiUrl}`, data)
      );
      return response.order;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  }

  /**
   * Gets all orders
   *
   * @returns Array of all orders
   */
  async getAllOrders(): Promise<OrderDTO[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ orders: OrderDTO[] }>(`${this.apiUrl}`)
      );
      return response.orders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw new Error('Failed to fetch orders. Please try again.');
    }
  }

  /**
   * Gets order by ID
   *
   * @param id - Order ID
   * @returns Order data
   */
  async getOrder(id: string): Promise<OrderDTO> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ order: OrderDTO }>(`${this.apiUrl}/${id}`)
      );
      return response.order;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw new Error('Failed to fetch order details. Please try again.');
    }
  }

  /**
   * Gets all orders for a user
   *
   * @param userId - User ID
   * @returns Array of user's orders
   */
  async getUserOrders(userId: string): Promise<OrderDTO[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ orders: OrderDTO[] }>(`${this.apiUrl}`)
      );
      
      // Filter orders for the specific user
      return response.orders.filter(order => order.userId === userId);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
      throw new Error('Failed to fetch orders. Please try again.');
    }
  }

  async updateOrderStatus(orderId: string, payload: UpdateOrderStatusDTO): Promise<OrderDTO> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ order: OrderDTO }>(`${this.apiUrl}/${orderId}/status`, payload)
      );
      return response.order;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw new Error('Failed to update order status. Please try again.');
    }
  }

  async addOrderComment(orderId: string, payload: AddOrderCommentDTO): Promise<OrderDTO> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ order: OrderDTO }>(`${this.apiUrl}/${orderId}/comments`, payload)
      );
      return response.order;
    } catch (error) {
      console.error('Failed to add order comment:', error);
      throw new Error('Failed to add order comment. Please try again.');
    }
  }
}
