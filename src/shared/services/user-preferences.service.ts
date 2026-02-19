import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@core/services/auth.service';
import type { AddressDTO, SavedPaymentMethodDTO } from '@core/models';

/**
 * Create Address Request
 */
export interface CreateAddressRequest {
  label: string;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phone: string;
  setAsDefault?: boolean;
}

/**
 * Create Payment Method Request
 * SECURITY: Never send full card number to server after validation
 */
export interface CreatePaymentMethodRequest {
  type: 'card' | 'paypal';
  // Card data (only last 4 digits stored)
  last4Digits?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  // PayPal data
  paypalEmail?: string;
  setAsDefault?: boolean;
}

/**
 * User Preferences Service
 *
 * Manages user's saved addresses and payment methods.
 * Provides CRUD operations for both authenticated users.
 */
@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // ============================================
  // Saved Addresses
  // ============================================

  /**
   * Get all saved addresses for current user
   */
  async getSavedAddresses(): Promise<AddressDTO[]> {
    const user = this.authService.currentUser();
    if (!user) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ addresses: AddressDTO[] }>(`/api/users/${user.id}/addresses`)
      );
      return response.addresses;
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
      return [];
    }
  }

  /**
   * Get default address for current user
   */
  async getDefaultAddress(): Promise<AddressDTO | null> {
    const addresses = await this.getSavedAddresses();
    return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  }

  /**
   * Add new address
   */
  async addAddress(request: CreateAddressRequest): Promise<AddressDTO> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const newAddress: AddressDTO = {
      id: uuidv4(),
      label: request.label,
      recipientName: request.recipientName,
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      city: request.city,
      postalCode: request.postalCode,
      phone: request.phone,
      isDefault: request.setAsDefault ?? false,
    };

    const response = await firstValueFrom(
      this.http.post<{ address: AddressDTO }>(`/api/users/${user.id}/addresses`, newAddress)
    );

    return response.address;
  }

  /**
   * Update existing address
   */
  async updateAddress(addressId: string, updates: Partial<AddressDTO>): Promise<AddressDTO> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const response = await firstValueFrom(
      this.http.patch<{ address: AddressDTO }>(
        `/api/users/${user.id}/addresses/${addressId}`,
        updates
      )
    );

    return response.address;
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(addressId: string): Promise<void> {
    await this.updateAddress(addressId, { isDefault: true });
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const addresses = await this.getSavedAddresses();
    const addressToDelete = addresses.find((address) => address.id === addressId);

    if (!addressToDelete) {
      throw new Error('Address not found');
    }

    const remainingAddresses = addresses.filter((address) => address.id !== addressId);
    const hasOtherAddresses = remainingAddresses.length > 0;

    if (addressToDelete.isDefault && !hasOtherAddresses) {
      throw new Error('Cannot delete the only default address');
    }

    if (addressToDelete.isDefault && hasOtherAddresses) {
      const fallbackAddress = remainingAddresses[0];
      if (fallbackAddress) {
        await this.setDefaultAddress(fallbackAddress.id);
      }
    }

    await firstValueFrom(this.http.delete(`/api/users/${user.id}/addresses/${addressId}`));
  }

  // ============================================
  // Saved Payment Methods
  // ============================================

  /**
   * Get all saved payment methods for current user
   */
  async getSavedPaymentMethods(): Promise<SavedPaymentMethodDTO[]> {
    const user = this.authService.currentUser();
    if (!user) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ paymentMethods: SavedPaymentMethodDTO[] }>(
          `/api/users/${user.id}/payment-methods`
        )
      );
      return response.paymentMethods;
    } catch (error) {
      console.error('Failed to load saved payment methods:', error);
      return [];
    }
  }

  /**
   * Get default payment method for current user
   */
  async getDefaultPaymentMethod(): Promise<SavedPaymentMethodDTO | null> {
    const methods = await this.getSavedPaymentMethods();
    return methods.find((m) => m.isDefault) ?? methods[0] ?? null;
  }

  /**
   * Add new payment method
   * SECURITY: Only last 4 digits are stored, never full card number
   */
  async addPaymentMethod(request: CreatePaymentMethodRequest): Promise<SavedPaymentMethodDTO> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const existingMethods = await this.getSavedPaymentMethods();
    const duplicateMethod = existingMethods.find((method) => {
      if (request.type !== method.type) {
        return false;
      }

      if (request.type === 'card') {
        return (
          method.last4Digits === request.last4Digits &&
          method.cardholderName === request.cardholderName &&
          method.expiryMonth === request.expiryMonth &&
          method.expiryYear === request.expiryYear
        );
      }

      if (request.type === 'paypal') {
        return (
          (method.paypalEmail ?? '').toLowerCase() === (request.paypalEmail ?? '').toLowerCase()
        );
      }

      return false;
    });

    if (duplicateMethod) {
      if (request.setAsDefault && !duplicateMethod.isDefault) {
        await this.setDefaultPaymentMethod(duplicateMethod.id);
        const refreshedMethods = await this.getSavedPaymentMethods();
        return (
          refreshedMethods.find((method) => method.id === duplicateMethod.id) ?? duplicateMethod
        );
      }

      return duplicateMethod;
    }

    const newMethod: SavedPaymentMethodDTO = {
      id: uuidv4(),
      type: request.type,
      last4Digits: request.last4Digits,
      cardholderName: request.cardholderName,
      expiryMonth: request.expiryMonth,
      expiryYear: request.expiryYear,
      paypalEmail: request.paypalEmail,
      isDefault: request.setAsDefault ?? false,
      createdAt: Date.now(),
    };

    const response = await firstValueFrom(
      this.http.post<{ paymentMethod: SavedPaymentMethodDTO }>(
        `/api/users/${user.id}/payment-methods`,
        newMethod
      )
    );

    return response.paymentMethod;
  }

  /**
   * Set payment method as default
   */
  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    await firstValueFrom(
      this.http.patch(`/api/users/${user.id}/payment-methods/${methodId}`, {
        isDefault: true,
      })
    );
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const paymentMethods = await this.getSavedPaymentMethods();
    const methodToDelete = paymentMethods.find((method) => method.id === methodId);

    if (!methodToDelete) {
      throw new Error('Payment method not found');
    }

    const remainingMethods = paymentMethods.filter((method) => method.id !== methodId);
    const hasOtherMethods = remainingMethods.length > 0;

    if (methodToDelete.isDefault && !hasOtherMethods) {
      throw new Error('Cannot delete the only default payment method');
    }

    if (methodToDelete.isDefault && hasOtherMethods) {
      const fallbackMethod = remainingMethods[0];
      if (fallbackMethod) {
        await this.setDefaultPaymentMethod(fallbackMethod.id);
      }
    }

    await firstValueFrom(this.http.delete(`/api/users/${user.id}/payment-methods/${methodId}`));
  }
}
