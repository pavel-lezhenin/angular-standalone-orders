import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from '../repositories/order.repository';
import type { Order, OrderStatusChangeActor } from '../models';
import type { AddOrderCommentDTO, CreateOrderDTO, UpdateOrderStatusDTO } from '@core/models';
import type { OrderStatus, PaymentStatus } from '@core/types';
import { OkResponse, CreatedResponse, NotFoundResponse, ServerErrorResponse, BadRequestResponse } from './http-responses';

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
      const createOrderData = req.body as CreateOrderDTO;
      const initialStatus = createOrderData.status ?? ('paid' as OrderStatus);
      const initialPaymentStatus = createOrderData.paymentStatus
        ?? (initialStatus === 'pending_payment' ? ('pending' as PaymentStatus) : ('approved' as PaymentStatus));
      
      // Build complete Order entity with all required fields
      const order: Order = {
        id: uuidv4(),
        userId: createOrderData.userId,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
        items: createOrderData.items,
        total: createOrderData.total,
        deliveryAddress: createOrderData.deliveryAddress,
        paymentInfo: createOrderData.paymentInfo,
        statusHistory: [],
        comments: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await this.orderRepo.create(order);
      return new CreatedResponse({ order });
    } catch (err) {
      console.error('Failed to create order:', err);
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

  /**
   * Handle update order status request
   */
  async handleUpdateOrderStatus(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').at(-2);
      if (!id) {
        return new BadRequestResponse('Order ID is required');
      }

      const payload = req.body as UpdateOrderStatusDTO;
      if (!payload.status) {
        return new BadRequestResponse('Order status is required');
      }

      const existingOrder = await this.orderRepo.getById(id);
      if (!existingOrder) {
        return new NotFoundResponse('Order not found');
      }

      if (existingOrder.status === payload.status) {
        return new OkResponse({ order: existingOrder });
      }

      const actor: OrderStatusChangeActor = payload.actor
        ? {
            id: payload.actor.id,
            role: payload.actor.role,
            email: payload.actor.email,
          }
        : {
            id: 'system',
            role: 'admin',
            email: 'system@local',
          };

      const now = Date.now();
      const statusHistory = [...(existingOrder.statusHistory ?? [])];
      statusHistory.push({
        fromStatus: existingOrder.status,
        toStatus: payload.status,
        changedAt: now,
        actor,
      });

      const updatedOrder: Order = {
        ...existingOrder,
        status: payload.status,
        statusHistory,
        updatedAt: now,
      };

      await this.orderRepo.updateFull(updatedOrder);
      return new OkResponse({ order: updatedOrder });
    } catch (err) {
      console.error('Failed to update order status:', err);
      return new ServerErrorResponse('Failed to update order status');
    }
  }

  async handleAddOrderComment(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const id = req.url.split('/').at(-2);
      if (!id) {
        return new BadRequestResponse('Order ID is required');
      }

      const payload = req.body as AddOrderCommentDTO;
      const commentText = payload.text?.trim();
      if (!commentText) {
        return new BadRequestResponse('Comment text is required');
      }

      const existingOrder = await this.orderRepo.getById(id);
      if (!existingOrder) {
        return new NotFoundResponse('Order not found');
      }

      const actor: OrderStatusChangeActor = payload.actor
        ? {
            id: payload.actor.id,
            role: payload.actor.role,
            email: payload.actor.email,
          }
        : {
            id: 'system',
            role: 'admin',
            email: 'system@local',
          };

      const now = Date.now();
      const comments = [...(existingOrder.comments ?? [])];
      comments.push({
        id: uuidv4(),
        text: commentText,
        createdAt: now,
        actor,
        isSystem: payload.isSystem ?? false,
      });

      const updatedOrder: Order = {
        ...existingOrder,
        comments,
        updatedAt: now,
      };

      await this.orderRepo.updateFull(updatedOrder);
      return new OkResponse({ order: updatedOrder });
    } catch (err) {
      console.error('Failed to add order comment:', err);
      return new ServerErrorResponse('Failed to add order comment');
    }
  }
}
