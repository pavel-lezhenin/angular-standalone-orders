import type { Meta, StoryObj } from '@storybook/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentMethodFormComponent } from './payment-method-form.component';

const meta: Meta<PaymentMethodFormComponent> = {
  title: 'Account/PaymentMethodForm',
  component: PaymentMethodFormComponent,
  tags: ['autodocs'],
  argTypes: {
    save: { action: 'save' },
    cancel: { action: 'cancel' },
    paymentTypeChange: { action: 'paymentTypeChange' },
  },
};

export default meta;
type Story = StoryObj<PaymentMethodFormComponent>;

function createCardForm(): FormGroup {
  const fb = new FormBuilder();
  return fb.group({
    type: ['card', Validators.required],
    label: ['My Visa', Validators.required],
    cardholderName: ['John Doe', Validators.required],
    cardNumber: ['4242424242424242', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiryMonth: [12, Validators.required],
    expiryYear: [2026, Validators.required],
  });
}

function createPayPalForm(): FormGroup {
  const fb = new FormBuilder();
  return fb.group({
    type: ['paypal', Validators.required],
    label: ['My PayPal', Validators.required],
    paypalEmail: ['john.doe@example.com', [Validators.required, Validators.email]],
  });
}

function createEmptyCardForm(): FormGroup {
  const fb = new FormBuilder();
  return fb.group({
    type: ['card', Validators.required],
    label: ['', Validators.required],
    cardholderName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiryMonth: ['', Validators.required],
    expiryYear: ['', Validators.required],
  });
}

export const CardForm: Story = {
  args: {
    paymentMethodForm: createCardForm(),
    selectedPaymentType: 'card',
  },
};

export const CardFormEmpty: Story = {
  args: {
    paymentMethodForm: createEmptyCardForm(),
    selectedPaymentType: 'card',
  },
};

export const CardFormWithErrors: Story = {
  args: {
    paymentMethodForm: (() => {
      const form = createEmptyCardForm();
      // Mark all controls as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.get(key)?.markAsTouched();
      });
      return form;
    })(),
    selectedPaymentType: 'card',
  },
};

export const PayPalForm: Story = {
  args: {
    paymentMethodForm: createPayPalForm(),
    selectedPaymentType: 'paypal',
  },
};

export const PayPalFormEmpty: Story = {
  args: {
    paymentMethodForm: (() => {
      const fb = new FormBuilder();
      return fb.group({
        type: ['paypal', Validators.required],
        label: ['', Validators.required],
        paypalEmail: ['', [Validators.required, Validators.email]],
      });
    })(),
    selectedPaymentType: 'paypal',
  },
};
