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
    const select = compiled.querySelector('.payment-select mat-select');
    expect(select).toBeTruthy();
  });

  it('should compute selectedPaymentMethod correctly', () => {
    const selected = component.selectedPaymentMethod();
    expect(selected).toBeTruthy();
    expect(selected?.id).toBe('1');
    expect(selected?.label).toBe('Personal Card');
  });

  it('should display selected card details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const display = compiled.querySelector('.selected-payment-display');
    expect(display).toBeTruthy();
    expect(display?.textContent).toContain('Personal Card');
    expect(display?.textContent).toContain('4242');
    expect(display?.textContent).toContain('12/2025');
  });

  it('should display selected PayPal details', () => {
    fixture.componentRef.setInput('selectedPaymentMethodId', '2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const display = compiled.querySelector('.selected-payment-display');
    expect(display).toBeTruthy();
    expect(display?.textContent).toContain('PayPal Account');
    expect(display?.textContent).toContain('user@example.com');
  });

  it('should show delete button when canDeleteSelected', () => {
    fixture.componentRef.setInput('selectedPaymentMethodId', '2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector('button[color="warn"]');
    expect(deleteButton).toBeTruthy();
    expect(component.canDeleteSelected()).toBe(true);
  });

  it('should show "Set as Default" button for non-default payment methods', () => {
    fixture.componentRef.setInput('selectedPaymentMethodId', '2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const defaultButton = Array.from(compiled.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Set as Default'));
    expect(defaultButton).toBeTruthy();
    expect(component.canSetAsDefault()).toBe(true);
  });

  it('should not show "Set as Default" button for default payment method', () => {
    fixture.componentRef.setInput('selectedPaymentMethodId', '1');
    fixture.detectChanges();

    expect(component.canSetAsDefault()).toBe(false);
  });

  it('should toggle to payment method form when showPaymentMethodForm is true', () => {
    fixture.componentRef.setInput('showPaymentMethodForm', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('.payment-method-form');
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
