import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SavedPaymentMethodsManagerComponent } from './saved-payment-methods-manager.component';
import type { PaymentMethodDTO } from '@core/models';

describe('SavedPaymentMethodsManagerComponent', () => {
  let component: SavedPaymentMethodsManagerComponent;
  let fixture: ComponentFixture<SavedPaymentMethodsManagerComponent>;
  let fb: FormBuilder;
  let mockPaymentMethods: PaymentMethodDTO[];
  let paymentMethodForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedPaymentMethodsManagerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedPaymentMethodsManagerComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

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
      {
        id: '2',
        label: 'PayPal Account',
        type: 'paypal',
        isDefault: false,
        paypalEmail: 'user@example.com',
      },
    ];

    paymentMethodForm = fb.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiryMonth: [null, Validators.required],
      expiryYear: [null, Validators.required],
      paypalEmail: [''],
    });

    fixture.componentRef.setInput('savedPaymentMethods', mockPaymentMethods);
    fixture.componentRef.setInput('selectedPaymentMethodId', '1');
    fixture.componentRef.setInput('showPaymentMethodForm', false);
    fixture.componentRef.setInput('paymentMethodForm', paymentMethodForm);
    fixture.componentRef.setInput('selectedPaymentType', 'card');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display saved payment methods in selection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selector = compiled.querySelector('app-payment-method-selector');
    expect(selector).toBeTruthy();
  });

  it('should display selected payment method details via selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selector = compiled.querySelector('app-payment-method-selector');
    expect(selector).toBeTruthy();
  });

  it('should toggle to payment method form when showPaymentMethodForm is true', () => {
    fixture.componentRef.setInput('showPaymentMethodForm', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('.account-payment-form');
    const display = compiled.querySelector('.selected-payment-display');

    expect(form).toBeTruthy();
    expect(display).toBeFalsy();
  });

  it('should display card fields when payment type is card', () => {
    fixture.componentRef.setInput('showPaymentMethodForm', true);
    fixture.componentRef.setInput('selectedPaymentType', 'card');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cardFields = compiled.querySelector('.card-fields');
    const paypalFields = compiled.querySelector('.paypal-fields');

    expect(cardFields).toBeTruthy();
    expect(paypalFields).toBeFalsy();
  });

  it('should display PayPal fields when payment type is paypal', () => {
    fixture.componentRef.setInput('showPaymentMethodForm', true);
    fixture.componentRef.setInput('selectedPaymentType', 'paypal');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cardFields = compiled.querySelector('.card-fields');
    const paypalFields = compiled.querySelector('.paypal-fields');

    expect(cardFields).toBeFalsy();
    expect(paypalFields).toBeTruthy();
  });

  it('should disable save button when form is invalid', () => {
    fixture.componentRef.setInput('showPaymentMethodForm', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = Array.from(compiled.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Save Payment Method')) as HTMLButtonElement;

    expect(saveButton).toBeTruthy();
    expect(saveButton.disabled).toBe(true);
  });

  it('should emit toggleForm when Add/Cancel button clicked', () => {
    let emitted = false;
    component.toggleForm.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('.section-header button') as HTMLButtonElement;
    addButton.click();

    expect(emitted).toBe(true);
  });

  it('should emit savePaymentMethod when Save button clicked', () => {
    fixture.componentRef.setInput('showPaymentMethodForm', true);
    paymentMethodForm.patchValue({
      cardholderName: 'John Doe',
      cardNumber: '4242424242424242',
      expiryMonth: 12,
      expiryYear: 2025,
    });
    fixture.detectChanges();

    let emitted = false;
    component.savePaymentMethod.subscribe(() => {
      emitted = true;
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = Array.from(compiled.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Save Payment Method')) as HTMLButtonElement;
    saveButton.click();

    expect(emitted).toBe(true);
  });
});
