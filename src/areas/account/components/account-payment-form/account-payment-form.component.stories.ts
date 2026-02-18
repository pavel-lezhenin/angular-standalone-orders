import type { Meta, StoryObj } from '@storybook/angular';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { applicationConfig } from '@storybook/angular';
import { AccountPaymentFormComponent } from './account-payment-form.component';

/**
 * AccountPaymentFormComponent Stories
 * 
 * Demonstrates the account settings payment form wrapper.
 * Uses shared PaymentFormComponent internally.
 */

const meta: Meta<AccountPaymentFormComponent> = {
  title: 'Account/Components/AccountPaymentForm',
  component: AccountPaymentFormComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [],
    }),
  ],
};

export default meta;
type Story = StoryObj<AccountPaymentFormComponent>;

/**
 * Card payment method (default)
 */
export const CardPayment: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      type: ['card', Validators.required],
      label: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
    });

    return {
      props: {
        paymentMethodForm: formGroup,
        selectedPaymentType: 'card' as const,
      },
      template: `
        <app-account-payment-form
          [paymentMethodForm]="paymentMethodForm"
          [selectedPaymentType]="selectedPaymentType"
        />
      `,
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};

/**
 * PayPal payment method
 */
export const PayPalPayment: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      type: ['paypal', Validators.required],
      label: ['', Validators.required],
      paypalEmail: ['', [Validators.required, Validators.email]],
    });

    return {
      props: {
        paymentMethodForm: formGroup,
        selectedPaymentType: 'paypal' as const,
      },
      template: `
        <app-account-payment-form
          [paymentMethodForm]="paymentMethodForm"
          [selectedPaymentType]="selectedPaymentType"
        />
      `,
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};

/**
 * Pre-filled card (edit mode)
 */
export const EditCard: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      type: ['card'],
      label: ['My Visa Card'],
      cardNumber: ['4242424242424242'],
      cardholderName: ['John Doe'],
      expiryMonth: ['12'],
      expiryYear: ['2026'],
    });

    return {
      props: {
        paymentMethodForm: formGroup,
        selectedPaymentType: 'card' as const,
      },
      template: `
        <app-account-payment-form
          [paymentMethodForm]="paymentMethodForm"
          [selectedPaymentType]="selectedPaymentType"
        />
      `,
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};
