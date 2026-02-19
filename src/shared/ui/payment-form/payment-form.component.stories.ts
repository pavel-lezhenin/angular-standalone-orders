import type { Meta, StoryObj } from '@storybook/angular';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { applicationConfig } from '@storybook/angular';
import { PaymentFormComponent } from './payment-form.component';

/**
 * PaymentFormComponent Stories
 *
 * Demonstrates the Dumb UI component for card payment fields.
 * Parent components must create and provide the FormGroup.
 */

const meta: Meta<PaymentFormComponent> = {
  title: 'Shared/UI/PaymentForm',
  component: PaymentFormComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [],
    }),
  ],
};

export default meta;
type Story = StoryObj<PaymentFormComponent>;

/**
 * Helper to create a card FormGroup
 */
function createCardFormGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
    cardholderName: ['', [Validators.required, Validators.minLength(2)]],
    expiryMonth: ['', Validators.required],
    expiryYear: ['', Validators.required],
  });
}

/**
 * Default card fields (no CVV, no label)
 */
export const Default: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = createCardFormGroup(fb);

    return {
      props: { formGroup },
      template: '<app-payment-form [formGroup]="formGroup" />',
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};

/**
 * With CVV field (checkout context)
 */
export const WithCVV: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });

    return {
      props: { formGroup, showCvv: true },
      template: '<app-payment-form [formGroup]="formGroup" [showCvv]="showCvv" />',
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};

/**
 * With label field (account settings context)
 */
export const WithLabel: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      label: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
    });

    return {
      props: { formGroup, showLabel: true },
      template: '<app-payment-form [formGroup]="formGroup" [showLabel]="showLabel" />',
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};

/**
 * Pre-filled form (edit mode)
 */
export const PreFilled: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = fb.group({
      label: ['My Visa'],
      cardNumber: ['4242 4242 4242 4242'],
      cardholderName: ['John Doe'],
      expiryMonth: ['12'],
      expiryYear: ['2026'],
    });

    return {
      props: { formGroup, showLabel: true },
      template: '<app-payment-form [formGroup]="formGroup" [showLabel]="showLabel" />',
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};

/**
 * Without card number formatting
 */
export const NoFormatting: Story = {
  render: () => {
    const fb = new FormBuilder();
    const formGroup = createCardFormGroup(fb);

    return {
      props: { formGroup, enableFormatting: false },
      template:
        '<app-payment-form [formGroup]="formGroup" [enableFormatting]="enableFormatting" />',
      moduleMetadata: {
        imports: [ReactiveFormsModule],
      },
    };
  },
};
