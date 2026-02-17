import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import type { PaymentMethodDTO } from '@core/models';
import { SavedPaymentMethodsManagerComponent } from './saved-payment-methods-manager.component';

const setSignalInput = (component: SavedPaymentMethodsManagerComponent, inputName: string, value: unknown): void => {
  (component as unknown as Record<string, unknown>)[inputName] = signal(value);
};

describe('SavedPaymentMethodsManagerComponent', () => {
  let component: SavedPaymentMethodsManagerComponent;
  let paymentMethodForm: FormGroup;
  let mockPaymentMethods: PaymentMethodDTO[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new SavedPaymentMethodsManagerComponent());

    const fb = new FormBuilder();
    paymentMethodForm = fb.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiryMonth: [null, Validators.required],
      expiryYear: [null, Validators.required],
      paypalEmail: [''],
    });

    mockPaymentMethods = [
      {
        id: '1',
        label: 'Personal Card',
        type: 'card',
        isDefault: true,
        cardDetails: {
          lastFourDigits: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      },
    ];

    setSignalInput(component, 'savedPaymentMethods', mockPaymentMethods);
    setSignalInput(component, 'selectedPaymentMethodId', '1');
    setSignalInput(component, 'showPaymentMethodForm', false);
    setSignalInput(component, 'paymentMethodForm', paymentMethodForm);
    setSignalInput(component, 'selectedPaymentType', 'card');
    setSignalInput(component, 'isEditMode', true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should store required inputs', () => {
    expect(component.savedPaymentMethods()).toEqual(mockPaymentMethods);
    expect(component.selectedPaymentMethodId()).toBe('1');
    expect(component.paymentMethodForm()).toBe(paymentMethodForm);
    expect(component.selectedPaymentType()).toBe('card');
  });

  it('should emit toggleForm event', () => {
    let emitted = false;
    component.toggleForm.subscribe(() => (emitted = true));
    component.toggleForm.emit();
    expect(emitted).toBe(true);
  });

  it('should emit savePaymentMethod event', () => {
    let emitted = false;
    component.savePaymentMethod.subscribe(() => (emitted = true));
    component.savePaymentMethod.emit();
    expect(emitted).toBe(true);
  });

  it('should emit paymentMethodSelectionChange with selected id', () => {
    let emittedValue = '';
    component.paymentMethodSelectionChange.subscribe((value) => (emittedValue = value));
    component.paymentMethodSelectionChange.emit('1');
    expect(emittedValue).toBe('1');
  });

  it('should emit paymentTypeChange event', () => {
    let emittedValue: 'card' | 'paypal' = 'card';
    component.paymentTypeChange.subscribe((value) => (emittedValue = value));
    component.paymentTypeChange.emit('paypal');
    expect(emittedValue).toBe('paypal');
  });

  it('should emit deleteSelected event', () => {
    let emitted = false;
    component.deleteSelected.subscribe(() => (emitted = true));
    component.deleteSelected.emit();
    expect(emitted).toBe(true);
  });

  it('should emit setAsDefault event', () => {
    let emitted = false;
    component.setAsDefault.subscribe(() => (emitted = true));
    component.setAsDefault.emit();
    expect(emitted).toBe(true);
  });

  it('should emit toggleEditMode event', () => {
    let emitted = false;
    component.toggleEditMode.subscribe(() => (emitted = true));
    component.toggleEditMode.emit();
    expect(emitted).toBe(true);
  });
});
