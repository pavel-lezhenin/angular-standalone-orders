import { Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core/services/auth.service';
import { LayoutService } from '@/shared/services/layout.service';
import { UserPreferencesService } from '@shared/services/user-preferences.service';
import { NotificationService } from '@shared/services/notification.service';
import type { AddressDTO, SavedPaymentMethodDTO } from '@core/models';

/**
 * Account/Profile page for managing user information
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly user = computed(() => this.authService.currentUser());
  readonly savedAddresses = signal<AddressDTO[]>([]);
  readonly selectedAddressId = signal<string>('');
  readonly selectedAddress = computed(() => {
    const addresses = this.savedAddresses();
    return addresses.find(address => address.id === this.selectedAddressId()) ?? null;
  });
  readonly savedPaymentMethods = signal<SavedPaymentMethodDTO[]>([]);
  readonly selectedPaymentMethodId = signal<string>('');
  readonly selectedPaymentMethod = computed(() => {
    const paymentMethods = this.savedPaymentMethods();
    return paymentMethods.find(method => method.id === this.selectedPaymentMethodId()) ?? null;
  });
  readonly canDeleteSelectedAddress = computed(() => {
    const address = this.selectedAddress();
    if (!address) {
      return false;
    }

    if (!address.isDefault) {
      return true;
    }

    return this.savedAddresses().length > 1;
  });
  readonly canDeleteSelectedPaymentMethod = computed(() => {
    const method = this.selectedPaymentMethod();
    if (!method) {
      return false;
    }

    if (!method.isDefault) {
      return true;
    }

    return this.savedPaymentMethods().length > 1;
  });
  readonly canSetSelectedAddressAsDefault = computed(() => {
    const address = this.selectedAddress();
    return !!address && !address.isDefault;
  });
  readonly canSetSelectedPaymentMethodAsDefault = computed(() => {
    const paymentMethod = this.selectedPaymentMethod();
    return !!paymentMethod && !paymentMethod.isDefault;
  });
  readonly isEditMode = signal(false);
  readonly showAddressForm = signal(false);
  readonly showPaymentMethodForm = signal(false);
  
  profileForm: FormGroup;
  addressForm: FormGroup;
  paymentMethodForm: FormGroup;
  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private layoutService: LayoutService,
    private userPreferencesService: UserPreferencesService,
    private notification: NotificationService,
  ) {
    this.layoutService.setTitle('My Account - Orders Platform');
    this.layoutService.setNavItems([]);

    const currentUser = this.user();
    this.profileForm = this.fb.group({
      firstName: [currentUser?.profile.firstName ?? '', [Validators.required]],
      lastName: [currentUser?.profile.lastName ?? '', [Validators.required]],
      email: [{ value: currentUser?.email ?? '', disabled: true }],
      phone: [currentUser?.profile.phone ?? ''],
    });

    this.addressForm = this.fb.group({
      label: ['Home', Validators.required],
      recipientName: [`${currentUser?.profile.firstName ?? ''} ${currentUser?.profile.lastName ?? ''}`.trim(), Validators.required],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required]],
      phone: [currentUser?.profile.phone ?? '', [Validators.required]],
    });

    this.paymentMethodForm = this.fb.group({
      type: ['card', Validators.required],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      paypalEmail: ['', [Validators.email]],
    });

    this.paymentMethodForm.get('type')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        if (type === 'paypal') {
          this.paymentMethodForm.get('paypalEmail')?.setValidators([Validators.required, Validators.email]);
          this.paymentMethodForm.get('cardholderName')?.clearValidators();
          this.paymentMethodForm.get('cardNumber')?.clearValidators();
          this.paymentMethodForm.get('expiryMonth')?.clearValidators();
          this.paymentMethodForm.get('expiryYear')?.clearValidators();
        } else {
          this.paymentMethodForm.get('paypalEmail')?.clearValidators();
          this.paymentMethodForm.get('cardholderName')?.setValidators([Validators.required, Validators.minLength(2)]);
          this.paymentMethodForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{13,19}$/)]);
          this.paymentMethodForm.get('expiryMonth')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]);
          this.paymentMethodForm.get('expiryYear')?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
        }

        this.paymentMethodForm.get('paypalEmail')?.updateValueAndValidity();
        this.paymentMethodForm.get('cardholderName')?.updateValueAndValidity();
        this.paymentMethodForm.get('cardNumber')?.updateValueAndValidity();
        this.paymentMethodForm.get('expiryMonth')?.updateValueAndValidity();
        this.paymentMethodForm.get('expiryYear')?.updateValueAndValidity();
      });
  }

  async ngOnInit(): Promise<void> {
    await this.loadPreferences();
  }

  private async loadPreferences(): Promise<void> {
    const [addresses, paymentMethods] = await Promise.all([
      this.userPreferencesService.getSavedAddresses(),
      this.userPreferencesService.getSavedPaymentMethods(),
    ]);

    this.savedAddresses.set(addresses);
    this.savedPaymentMethods.set(paymentMethods);

    const defaultAddress = addresses.find(address => address.isDefault) ?? addresses[0] ?? null;
    this.selectedAddressId.set(defaultAddress?.id ?? '');
    this.showAddressForm.set(addresses.length === 0);

    const defaultPaymentMethod = paymentMethods.find(method => method.isDefault) ?? paymentMethods[0] ?? null;
    this.selectedPaymentMethodId.set(defaultPaymentMethod?.id ?? '');
    this.showPaymentMethodForm.set(paymentMethods.length === 0);
  }

  onAddressSelectionChange(addressId: string): void {
    this.selectedAddressId.set(addressId);
  }

  onPaymentMethodSelectionChange(methodId: string): void {
    this.selectedPaymentMethodId.set(methodId);
  }

  toggleAddressForm(): void {
    this.showAddressForm.update(value => !value);
  }

  togglePaymentMethodForm(): void {
    this.showPaymentMethodForm.update(value => !value);
  }

  async saveAddress(): Promise<void> {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const formValue = this.addressForm.value;

    await this.userPreferencesService.addAddress({
      label: formValue.label,
      recipientName: formValue.recipientName,
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2 || '',
      city: formValue.city,
      postalCode: formValue.postalCode,
      phone: formValue.phone,
      setAsDefault: this.savedAddresses().length === 0,
    });

    await this.loadPreferences();
    this.showAddressForm.set(false);
    this.notification.success('Address added');
  }

  async deleteSelectedAddress(): Promise<void> {
    const selectedAddressId = this.selectedAddressId();
    if (!selectedAddressId) {
      this.notification.error('Please select an address to delete');
      return;
    }

    try {
      await this.userPreferencesService.deleteAddress(selectedAddressId);
      await this.loadPreferences();
      this.notification.success('Address deleted');
    } catch (error) {
      console.error('Failed to delete address:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete address';
      this.notification.error(errorMessage);
    }
  }

  async setSelectedAddressAsDefault(): Promise<void> {
    const selectedAddress = this.selectedAddress();
    if (!selectedAddress || selectedAddress.isDefault) {
      return;
    }

    try {
      await this.userPreferencesService.setDefaultAddress(selectedAddress.id);
      await this.loadPreferences();
      this.notification.success('Default address updated');
    } catch (error) {
      console.error('Failed to set default address:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to set default address';
      this.notification.error(errorMessage);
    }
  }

  async savePaymentMethod(): Promise<void> {
    if (this.paymentMethodForm.invalid) {
      this.paymentMethodForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentMethodForm.value;

    if (formValue.type === 'paypal') {
      await this.userPreferencesService.addPaymentMethod({
        type: 'paypal',
        paypalEmail: formValue.paypalEmail,
        setAsDefault: this.savedPaymentMethods().length === 0,
      });
    } else {
      const normalizedCardNumber = String(formValue.cardNumber ?? '').replace(/\s+/g, '');

      await this.userPreferencesService.addPaymentMethod({
        type: 'card',
        last4Digits: normalizedCardNumber.slice(-4),
        cardholderName: formValue.cardholderName,
        expiryMonth: formValue.expiryMonth,
        expiryYear: formValue.expiryYear,
        setAsDefault: this.savedPaymentMethods().length === 0,
      });
    }

    await this.loadPreferences();
    this.showPaymentMethodForm.set(false);
    this.notification.success('Payment method added');
  }

  async deleteSelectedPaymentMethod(): Promise<void> {
    const selectedMethodId = this.selectedPaymentMethodId();
    if (!selectedMethodId) {
      this.notification.error('Please select a payment method to delete');
      return;
    }

    try {
      await this.userPreferencesService.deletePaymentMethod(selectedMethodId);
      await this.loadPreferences();
      this.notification.success('Payment method deleted');
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete payment method';
      this.notification.error(errorMessage);
    }
  }

  async setSelectedPaymentMethodAsDefault(): Promise<void> {
    const selectedMethod = this.selectedPaymentMethod();
    if (!selectedMethod || selectedMethod.isDefault) {
      return;
    }

    try {
      await this.userPreferencesService.setDefaultPaymentMethod(selectedMethod.id);
      await this.loadPreferences();
      this.notification.success('Default payment method updated');
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to set default payment method';
      this.notification.error(errorMessage);
    }
  }

  toggleEditMode(): void {
    this.isEditMode.update(v => !v);
    
    if (!this.isEditMode()) {
      // Reset form if canceling edit
      const currentUser = this.user();
      this.profileForm.patchValue({
        firstName: currentUser?.profile.firstName ?? '',
        lastName: currentUser?.profile.lastName ?? '',
        phone: currentUser?.profile.phone ?? '',
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      // TODO: Implement save functionality
      console.log('Saving profile:', this.profileForm.value);
      this.isEditMode.set(false);
    }
  }

  getRoleBadgeColor(role?: string): string {
    switch (role) {
      case 'admin':
        return 'warn';
      case 'manager':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getRoleDisplayName(role?: string): string {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  }

  getPaymentMethodLabel(method: { type: 'card' | 'paypal'; last4Digits?: string; paypalEmail?: string }): string {
    if (method.type === 'card') {
      return method.last4Digits ? `Card •••• ${method.last4Digits}` : 'Card';
    }

    return method.paypalEmail ? `PayPal (${method.paypalEmail})` : 'PayPal';
  }
}
