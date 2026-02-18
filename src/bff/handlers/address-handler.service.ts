import { Injectable, inject } from '@angular/core';
import type { HttpRequest, HttpResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { AddressRepository } from '../repositories/address.repository';
import type { Address } from '../models/address';
import { BadRequestResponse, CreatedResponse, NoContentResponse, OkResponse, ServerErrorResponse } from './http-responses';

@Injectable({
  providedIn: 'root',
})
export class AddressHandlerService {
  private readonly addressRepo = inject(AddressRepository);

  async handleGetAddresses(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/api\/users\/([\w-]+)\/addresses/)?.[1];
      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      const addresses = await this.addressRepo.getByUserId(userId);
      return new OkResponse({ addresses });
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      return new ServerErrorResponse('Failed to fetch addresses');
    }
  }

  async handleCreateAddress(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const userId = req.url.match(/\/api\/users\/([\w-]+)\/addresses/)?.[1];
      if (!userId) {
        return new BadRequestResponse('Invalid user ID');
      }

      const body = req.body as Partial<Address>;
      const now = Date.now();
      const existing = await this.addressRepo.getByUserId(userId);
      const duplicate = this.findDuplicate(existing, body);

      if (duplicate) {
        const updatedDuplicate: Address = {
          ...duplicate,
          label: body.label ?? duplicate.label,
          isDefault: body.isDefault ?? duplicate.isDefault,
          updatedAt: now,
        };

        await this.addressRepo.updateFull(updatedDuplicate);
        await this.ensureSingleDefault(userId, updatedDuplicate.id, updatedDuplicate.isDefault);

        return new OkResponse({ address: updatedDuplicate });
      }

      const address: Address = {
        id: body.id || uuidv4(),
        userId,
        label: body.label || 'Home',
        recipientName: body.recipientName || '',
        addressLine1: body.addressLine1 || '',
        addressLine2: body.addressLine2,
        city: body.city || '',
        postalCode: body.postalCode || '',
        phone: body.phone || '',
        isDefault: body.isDefault ?? existing.length === 0,
        createdAt: now,
        updatedAt: now,
      };

      await this.addressRepo.create(address);
      await this.ensureSingleDefault(userId, address.id, address.isDefault);

      return new CreatedResponse({ address });
    } catch (error) {
      console.error('Failed to create address:', error);
      return new ServerErrorResponse('Failed to create address');
    }
  }

  async handleUpdateAddress(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const matches = req.url.match(/\/api\/users\/([\w-]+)\/addresses\/([\w-]+)$/);
      const userId = matches?.[1];
      const addressId = matches?.[2];
      if (!userId || !addressId) {
        return new BadRequestResponse('Invalid parameters');
      }

      const existingAddress = await this.addressRepo.getById(addressId);
      if (!existingAddress || existingAddress.userId !== userId) {
        return new BadRequestResponse('Address not found');
      }

      const updates = req.body as Partial<Address>;
      const updatedAddress: Address = {
        ...existingAddress,
        ...updates,
        id: existingAddress.id,
        userId: existingAddress.userId,
        createdAt: existingAddress.createdAt,
        updatedAt: Date.now(),
      };

      await this.addressRepo.updateFull(updatedAddress);
      await this.ensureSingleDefault(userId, updatedAddress.id, !!updatedAddress.isDefault);

      return new OkResponse({ address: updatedAddress });
    } catch (error) {
      console.error('Failed to update address:', error);
      return new ServerErrorResponse('Failed to update address');
    }
  }

  async handleDeleteAddress(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
    try {
      const matches = req.url.match(/\/api\/users\/([\w-]+)\/addresses\/([\w-]+)$/);
      const userId = matches?.[1];
      const addressId = matches?.[2];
      if (!userId || !addressId) {
        return new BadRequestResponse('Invalid parameters');
      }

      const existingAddress = await this.addressRepo.getById(addressId);
      if (!existingAddress || existingAddress.userId !== userId) {
        return new BadRequestResponse('Address not found');
      }

      await this.addressRepo.delete(addressId);

      if (existingAddress.isDefault) {
        const remaining = await this.addressRepo.getByUserId(userId);
        const first = remaining[0];
        if (first) {
          await this.addressRepo.updateFull({ ...first, isDefault: true, updatedAt: Date.now() });
        }
      }

      return new NoContentResponse();
    } catch (error) {
      console.error('Failed to delete address:', error);
      return new ServerErrorResponse('Failed to delete address');
    }
  }

  private findDuplicate(addresses: Address[], body: Partial<Address>): Address | undefined {
    const normalize = (value?: string): string => (value ?? '').trim().toLowerCase();
    return addresses.find(address =>
      normalize(address.recipientName) === normalize(body.recipientName) &&
      normalize(address.addressLine1) === normalize(body.addressLine1) &&
      normalize(address.addressLine2) === normalize(body.addressLine2) &&
      normalize(address.city) === normalize(body.city) &&
      normalize(address.postalCode) === normalize(body.postalCode) &&
      normalize(address.phone) === normalize(body.phone)
    );
  }

  private async ensureSingleDefault(userId: string, targetId: string, shouldBeDefault: boolean): Promise<void> {
    if (!shouldBeDefault) {
      return;
    }

    const addresses = await this.addressRepo.getByUserId(userId);
    const now = Date.now();

    await Promise.all(
      addresses
        .filter(address => address.id !== targetId && address.isDefault)
        .map(address => this.addressRepo.updateFull({ ...address, isDefault: false, updatedAt: now }))
    );
  }
}
