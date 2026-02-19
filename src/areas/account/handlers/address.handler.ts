import { Injectable, inject, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { UserPreferencesService } from '@shared/services/user-preferences.service';
import { NotificationService } from '@shared/services/notification.service';
import type { AddressDTO } from '@core/models';

/**
 * Handles address-related state and operations for the Account page.
 */
@Injectable()
export class AddressHandler {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(UserPreferencesService);
  private readonly notification = inject(NotificationService);

  readonly items = signal<AddressDTO[]>([]);
  readonly selectedId = signal<string>('');
  readonly isEditMode = signal(false);
  readonly showForm = signal(false);
  readonly form: FormGroup;

  constructor() {
    const user = this.authService.currentUser();
    const fullName = `${user?.profile.firstName ?? ''} ${user?.profile.lastName ?? ''}`.trim();

    this.form = this.fb.group({
      label: ['Home', Validators.required],
      recipientName: [fullName, Validators.required],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required]],
      phone: [user?.profile.phone ?? '', [Validators.required]],
    });
  }

  /** Loads addresses from API and selects the default. */
  async load(): Promise<void> {
    const addresses = await this.preferencesService.getSavedAddresses();
    this.items.set(addresses);

    const defaultItem = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
    this.selectedId.set(defaultItem?.id ?? '');
    this.showForm.set(false);
  }

  onSelectionChange(addressId: string): void {
    this.selectedId.set(addressId);
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);

    if (this.showForm()) {
      const user = this.authService.currentUser();
      this.form.reset({
        label: 'Home',
        recipientName: `${user?.profile.firstName ?? ''} ${user?.profile.lastName ?? ''}`.trim(),
        phone: user?.profile.phone ?? '',
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode.update((v) => !v);

    if (!this.isEditMode()) {
      this.showForm.set(false);
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    await this.preferencesService.addAddress({
      label: v.label,
      recipientName: v.recipientName,
      addressLine1: v.addressLine1,
      addressLine2: v.addressLine2 || '',
      city: v.city,
      postalCode: v.postalCode,
      phone: v.phone,
      setAsDefault: this.items().length === 0,
    });

    await this.load();
    this.showForm.set(false);
    this.notification.success('Address added');
  }

  async deleteSelected(): Promise<void> {
    const id = this.selectedId();
    if (!id) {
      this.notification.error('Please select an address to delete');
      return;
    }

    await this.withNotification(
      () => this.preferencesService.deleteAddress(id),
      'Address deleted',
      'Failed to delete address'
    );
  }

  async setAsDefault(): Promise<void> {
    const id = this.selectedId();
    if (!id) {
      return;
    }

    await this.withNotification(
      () => this.preferencesService.setDefaultAddress(id),
      'Default address updated',
      'Failed to set default address'
    );
  }

  // ── Private ─────────────────────────────────────────────────

  private async withNotification(
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await action();
      await this.load();
      this.notification.success(successMessage);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      this.notification.error(error instanceof Error ? error.message : errorMessage);
    }
  }
}
