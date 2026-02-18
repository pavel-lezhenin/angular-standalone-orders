import { Injectable, inject } from '@angular/core';
import type { HttpRequest, HttpResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethodRepository } from '../repositories/payment-method.repository';
import type { PaymentMethod } from '../models/payment-method';
import { BadRequestResponse, CreatedResponse, NoContentResponse, OkResponse, ServerErrorResponse } from './http-responses';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodHandlerService {
  private readonly paymentMethodRepo = inject(PaymentMethodRepository);

  async handleGetPaymentMethods(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/api\/users\/([\w-]+)\/payment-methods/)?.[1];
      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      const paymentMethods = await this.paymentMethodRepo.getByUserId(userId);
      return new OkResponse({ paymentMethods });
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return new ServerErrorResponse('Failed to fetch payment methods');
    }
  }

  async handleCreatePaymentMethod(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/api\/users\/([\w-]+)\/payment-methods/)?.[1];
      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      const body = req.body as Partial<PaymentMethod>;
      const now = Date.now();
      const existing = await this.paymentMethodRepo.getByUserId(userId);
      const duplicate = this.findDuplicate(existing, body);

      if (duplicate) {
        const updatedDuplicate: PaymentMethod = {
          ...duplicate,
          isDefault: body.isDefault ?? duplicate.isDefault,
          updatedAt: now,
        };

        await this.paymentMethodRepo.updateFull(updatedDuplicate);
        await this.ensureSingleDefault(userId, updatedDuplicate.id, updatedDuplicate.isDefault);

        return new OkResponse({ paymentMethod: updatedDuplicate });
      }

      const paymentMethod: PaymentMethod = {
        id: body.id || uuidv4(),
        userId,
        type: body.type || 'card',
        last4Digits: body.last4Digits,
        cardholderName: body.cardholderName,
        expiryMonth: body.expiryMonth,
        expiryYear: body.expiryYear,
        paypalEmail: body.paypalEmail,
        isDefault: body.isDefault ?? existing.length === 0,
        createdAt: body.createdAt || now,
        updatedAt: now,
      };

      await this.paymentMethodRepo.create(paymentMethod);
      await this.ensureSingleDefault(userId, paymentMethod.id, paymentMethod.isDefault);

      return new CreatedResponse({ paymentMethod });
    } catch (error) {
      console.error('Failed to create payment method:', error);
      return new ServerErrorResponse('Failed to create payment method');
    }
  }

  async handleUpdatePaymentMethod(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const matches = req.url.match(/\/api\/users\/([\w-]+)\/payment-methods\/([\w-]+)$/);
      const userId = matches?.[1];
      const methodId = matches?.[2];
      if (!userId || !methodId) {
        return new BadRequestResponse('Invalid parameters');
      }

      const existingMethod = await this.paymentMethodRepo.getById(methodId);
      if (!existingMethod || existingMethod.userId !== userId) {
        return new BadRequestResponse('Payment method not found');
      }

      const updates = req.body as Partial<PaymentMethod>;
      const updatedMethod: PaymentMethod = {
        ...existingMethod,
        ...updates,
        id: existingMethod.id,
        userId: existingMethod.userId,
        createdAt: existingMethod.createdAt,
        updatedAt: Date.now(),
      };

      await this.paymentMethodRepo.updateFull(updatedMethod);
      await this.ensureSingleDefault(userId, updatedMethod.id, !!updatedMethod.isDefault);

      return new OkResponse({ paymentMethod: updatedMethod });
    } catch (error) {
      console.error('Failed to update payment method:', error);
      return new ServerErrorResponse('Failed to update payment method');
    }
  }

  async handleDeletePaymentMethod(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const matches = req.url.match(/\/api\/users\/([\w-]+)\/payment-methods\/([\w-]+)$/);
      const userId = matches?.[1];
      const methodId = matches?.[2];
      if (!userId || !methodId) {
        return new BadRequestResponse('Invalid parameters');
      }

      const existingMethod = await this.paymentMethodRepo.getById(methodId);
      if (!existingMethod || existingMethod.userId !== userId) {
        return new BadRequestResponse('Payment method not found');
      }

      await this.paymentMethodRepo.delete(methodId);

      if (existingMethod.isDefault) {
        const remaining = await this.paymentMethodRepo.getByUserId(userId);
        const first = remaining[0];
        if (first) {
          await this.paymentMethodRepo.updateFull({ ...first, isDefault: true, updatedAt: Date.now() });
        }
      }

      return new NoContentResponse();
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      return new ServerErrorResponse('Failed to delete payment method');
    }
  }

  private findDuplicate(methods: PaymentMethod[], body: Partial<PaymentMethod>): PaymentMethod | undefined {
    const normalize = (value?: string): string => (value ?? '').trim().toLowerCase();

    if (body.type === 'paypal') {
      return methods.find(method =>
        method.type === 'paypal' &&
        normalize(method.paypalEmail) === normalize(body.paypalEmail)
      );
    }

    return methods.find(method =>
      method.type === 'card' &&
      normalize(method.last4Digits) === normalize(body.last4Digits) &&
      normalize(method.cardholderName) === normalize(body.cardholderName) &&
      normalize(method.expiryMonth) === normalize(body.expiryMonth) &&
      normalize(method.expiryYear) === normalize(body.expiryYear)
    );
  }

  private async ensureSingleDefault(userId: string, targetId: string, shouldBeDefault: boolean): Promise<void> {
    if (!shouldBeDefault) {
      return;
    }

    const methods = await this.paymentMethodRepo.getByUserId(userId);
    const now = Date.now();

    await Promise.all(
      methods
        .filter(method => method.id !== targetId && method.isDefault)
        .map(method => this.paymentMethodRepo.updateFull({ ...method, isDefault: false, updatedAt: now }))
    );
  }
}
