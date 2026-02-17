import { Injectable, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserPreferencesService } from '@shared/services/user-preferences.service';
import { NotificationService } from '@shared/services/notification.service';
import type { PaymentMethodDTO } from '@core/models';

/**
 * Handles payment-method-related state and operations for the Account page.
 */
@Injectable()
export class PaymentMethodHandler {
  private readonly fb = inject(FormBuilder);
  private readonly preferencesService = inject(UserPreferencesService);
  private readonly notification = inject(NotificationService);

  readonly items = signal<PaymentMethodDTO[]>([]);
  readonly selectedId = signal<string>('');
  readonly selectedType = signal<'card' | 'paypal'>('card');
  readonly isEditMode = signal(false);
  readonly showForm = signal(false);
  readonly form: FormGroup;

  constructor() {
    const now = new Date();

    this.form = this.fb.group({
      type: ['card', [Validators.required]],
      label: ['', [Validators.required]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      expiryMonth: [now.getMonth() + 1, [Validators.required]],
      expiryYear: [now.getFullYear(), [Validators.required]],
      paypalEmail: [''],
    });

    this.registerTypeEffect();
  }

  /** Loads payment methods from API, maps to display format, selects the default. */
  async load(): Promise<void> {
    const methods = await this.preferencesService.getSavedPaymentMethods();
    console.log('🔍 PaymentMethodHandler.load() - Raw methods from API:', methods);

    const mapped: PaymentMethodDTO[] = methods.map(m => ({
      id: m.id,
      label: m.type === 'card'
        ? `Card •••• ${m.last4Digits}`
        : `PayPal (${m.paypalEmail})`,
      type: m.type,
      isDefault: m.isDefault,
      ...(m.type === 'card' && m.last4Digits && {
        cardDetails: {
          lastFourDigits: m.last4Digits,
          expiryMonth: Number(m.expiryMonth) || 1,
          expiryYear: Number(m.expiryYear) || 2024,
        },
      }),
      ...(m.type === 'paypal' && m.paypalEmail && {
        paypalEmail: m.paypalEmail,
      }),
    }));

    console.log('🔍 PaymentMethodHandler.load() - Mapped items:', mapped);
    this.items.set(mapped);

    const defaultItem = methods.find(m => m.isDefault) ?? methods[0] ?? null;
    this.selectedId.set(defaultItem?.id ?? '');
    this.showForm.set(false);
  }

  onSelectionChange(methodId: string): void {
    this.selectedId.set(methodId);
  }

  onTypeChange(type: 'card' | 'paypal'): void {
    this.selectedType.set(type);
  }

  toggleForm(): void {
    this.showForm.update(v => !v);

    if (this.showForm()) {
      this.selectedType.set('card');
      this.form.reset();
    }
  }

  toggleEditMode(): void {
    this.isEditMode.update(v => !v);

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
    const type = this.selectedType();

    if (type === 'paypal') {
      await this.preferencesService.addPaymentMethod({
        type: 'paypal',
        paypalEmail: v.paypalEmail,
        setAsDefault: this.items().length === 0,
      });
    } else {
      const normalizedCardNumber = String(v.cardNumber ?? '').replace(/\s+/g, '');

      await this.preferencesService.addPaymentMethod({
        type: 'card',
        last4Digits: normalizedCardNumber.slice(-4),
        cardholderName: v.cardholderName,
        expiryMonth: v.expiryMonth,
        expiryYear: v.expiryYear,
        setAsDefault: this.items().length === 0,
      });
    }

    await this.load();
    this.showForm.set(false);
    this.notification.success('Payment method added');
  }

  async deleteSelected(): Promise<void> {
    const id = this.selectedId();
    if (!id) {
      this.notification.error('Please select a payment method to delete');
      return;
    }

    await this.withNotification(
      () => this.preferencesService.deletePaymentMethod(id),
      'Payment method deleted',
      'Failed to delete payment method',
    );
  }

  async setAsDefault(): Promise<void> {
    const id = this.selectedId();
    if (!id) {
      return;
    }

    await this.withNotification(
      () => this.preferencesService.setDefaultPaymentMethod(id),
      'Default payment method updated',
      'Failed to set default payment method',
    );
  }

  // ── Private ─────────────────────────────────────────────────

  private async withNotification(
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      await action();
      await this.load();
      this.notification.success(successMessage);
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      this.notification.error(
        error instanceof Error ? error.message : errorMessage,
      );
    }
  }

  /** Syncs form validators when payment type changes (card ↔ paypal). */
  private registerTypeEffect(): void {
    effect(() => {
      const type = this.selectedType();
      this.form.get('type')?.setValue(type, { emitEvent: false });

      const cardFields = ['cardholderName', 'cardNumber', 'expiryMonth', 'expiryYear'];
      const cardValidators: Record<string, ReturnType<typeof Validators.compose>> = {
        cardholderName: Validators.compose([Validators.required, Validators.minLength(2)]),
        cardNumber: Validators.compose([Validators.required, Validators.pattern(/^\d{13,19}$/)]),
        expiryMonth: Validators.required,
        expiryYear: Validators.required,
      };

      if (type === 'paypal') {
        this.form.get('paypalEmail')?.setValidators([Validators.required, Validators.email]);
        cardFields.forEach(f => this.form.get(f)?.clearValidators());
      } else {
        this.form.get('paypalEmail')?.clearValidators();
        cardFields.forEach(f => {
          const v = cardValidators[f];
          if (v) {
            this.form.get(f)?.setValidators(v);
          }
        });
      }

      ['paypalEmail', ...cardFields].forEach(f =>
        this.form.get(f)?.updateValueAndValidity(),
      );
    });
  }
}
