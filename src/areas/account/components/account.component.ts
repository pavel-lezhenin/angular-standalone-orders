import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '@core/services/auth.service';
import { LayoutService } from '@/shared/services/layout.service';
import { UserPreferencesService } from '@shared/services/user-preferences.service';
import { NotificationService } from '@shared/services/notification.service';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { SavedAddressesManagerComponent } from './saved-addresses-manager/saved-addresses-manager.component';
import { SavedPaymentMethodsManagerComponent } from './saved-payment-methods-manager/saved-payment-methods-manager.component';
import { AccountStatsComponent } from './account-stats/account-stats.component';
import type { AddressDTO, PaymentMethodDTO } from '@core/models';

/**
 * Account/Profile page for managing user information
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    ProfileInfoComponent,
    SavedAddressesManagerComponent,
    SavedPaymentMethodsManagerComponent,
    AccountStatsComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {

  readonly user = computed(() => this.authService.currentUser());
  readonly savedAddresses = signal<AddressDTO[]>([]);
  readonly selectedAddressId = signal<string>('');
  readonly savedPaymentMethods = signal<PaymentMethodDTO[]>([]);
  readonly selectedPaymentMethodId = signal<string>('');
  readonly selectedPaymentType = signal<'card' | 'paypal'>('card');
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
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      expiryMonth: [null, [Validators.required]],
      expiryYear: [null, [Validators.required]],
      paypalEmail: [''],
    });

    // Watch for payment type changes using effect instead of pipe (signals don't have pipe)
    effect(() => {
      const type = this.selectedPaymentType();
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
        this.paymentMethodForm.get('expiryMonth')?.setValidators([Validators.required]);
        this.paymentMethodForm.get('expiryYear')?.setValidators([Validators.required]);
      }

      this.paymentMethodForm.get('paypalEmail')?.updateValueAndValidity();
      this.paymentMethodForm.get('cardholderName')?.updateValueAndValidity();
      this.paymentMethodForm.get('cardNumber')?.updateValueAndValidity();
      this.paymentMethodForm.get('expiryMonth')?.updateValueAndValidity();
      this.paymentMethodForm.get('expiryYear')?.updateValueAndValidity();
    }, { allowSignalWrites: true });
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
    // Map SavedPaymentMethodDTO to PaymentMethodDTO format expected by sub-component
    const mappedPaymentMethods: PaymentMethodDTO[] = paymentMethods.map(method => ({
      id: method.id,
      label: method.type === 'card' 
        ? `Card •••• ${method.last4Digits}` 
        : `PayPal (${method.paypalEmail})`,
      type: method.type,
      isDefault: method.isDefault,
      ...(method.type === 'card' && method.last4Digits && {
        cardDetails: {
          lastFourDigits: method.last4Digits,
          expiryMonth: Number(method.expiryMonth) || 1,
          expiryYear: Number(method.expiryYear) || 2024,
        }
      }),
      ...(method.type === 'paypal' && method.paypalEmail && {
        paypalEmail: method.paypalEmail,
      }),
    }));
    this.savedPaymentMethods.set(mappedPaymentMethods);

    const defaultAddress = addresses.find(address => address.isDefault) ?? addresses[0] ?? null;
    this.selectedAddressId.set(defaultAddress?.id ?? '');
    this.showAddressForm.set(addresses.length === 0);

    const defaultPaymentMethod = paymentMethods.find(method => method.isDefault) ?? paymentMethods[0] ?? null;
    this.selectedPaymentMethodId.set(defaultPaymentMethod?.id ?? '');
    this.showPaymentMethodForm.set(paymentMethods.length === 0);
  }

  // Address handlers
  onAddressSelectionChange(addressId: string): void {
    this.selectedAddressId.set(addressId);
  }

  toggleAddressForm(): void {
    this.showAddressForm.update(value => !value);
    if (this.showAddressForm()) {
      this.addressForm.reset({
        label: 'Home',
        recipientName: `${this.user()?.profile.firstName ?? ''} ${this.user()?.profile.lastName ?? ''}`.trim(),
        phone: this.user()?.profile.phone ?? '',
      });
    }
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
    const selectedAddressId = this.selectedAddressId();
    if (!selectedAddressId) {
      return;
    }

    try {
      await this.userPreferencesService.setDefaultAddress(selectedAddressId);
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

  // Payment method handlers
  onPaymentMethodSelectionChange(methodId: string): void {
    this.selectedPaymentMethodId.set(methodId);
  }

  onPaymentTypeChange(type: 'card' | 'paypal'): void {
    this.selectedPaymentType.set(type);
  }

  togglePaymentMethodForm(): void {
    this.showPaymentMethodForm.update(value => !value);
    if (this.showPaymentMethodForm()) {
      this.selectedPaymentType.set('card');
      this.paymentMethodForm.reset();
    }
  }

  async savePaymentMethod(): Promise<void> {
    if (this.paymentMethodForm.invalid) {
      this.paymentMethodForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentMethodForm.value;
    const type = this.selectedPaymentType();

    if (type === 'paypal') {
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
    const selectedMethodId = this.selectedPaymentMethodId();
    if (!selectedMethodId) {
      return;
    }

    try {
      await this.userPreferencesService.setDefaultPaymentMethod(selectedMethodId);
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

  // Profile handlers
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

  // View helpers
  getRoleBadgeColor(role?: string): 'warn' | 'accent' | 'primary' {
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

  // Account stats computed properties
  readonly totalOrders = computed(() => 0); // TODO: Implement from service
  readonly totalSpent = computed(() => 0); // TODO: Implement from service
  readonly loyaltyPoints = computed(() => 0); // TODO: Implement from service
}
