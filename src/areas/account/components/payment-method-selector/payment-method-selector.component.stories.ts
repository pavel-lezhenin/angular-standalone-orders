import type { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentMethodSelectorComponent } from './payment-method-selector.component';
import type { PaymentMethodDTO } from '@core/models';

const meta: Meta<PaymentMethodSelectorComponent> = {
  title: 'Account/PaymentMethodSelector',
  component: PaymentMethodSelectorComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionChange: { action: 'selectionChange' },
    setAsDefault: { action: 'setAsDefault' },
    deleteSelected: { action: 'deleteSelected' },
  },
};

export default meta;
type Story = StoryObj<PaymentMethodSelectorComponent>;

const mockPaymentMethods: PaymentMethodDTO[] = [
  {
    id: 'pm-1',
    label: 'Visa •••• 4242',
    type: 'card',
    isDefault: true,
    cardDetails: {
      lastFourDigits: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
    },
  },
  {
    id: 'pm-2',
    label: 'Mastercard •••• 5555',
    type: 'card',
    isDefault: false,
    cardDetails: {
      lastFourDigits: '5555',
      expiryMonth: 6,
      expiryYear: 2025,
    },
  },
  {
    id: 'pm-3',
    label: 'PayPal (john@example.com)',
    type: 'paypal',
    isDefault: false,
    paypalEmail: 'john@example.com',
  },
];

export const ViewMode: Story = {
  args: {
    savedPaymentMethods: mockPaymentMethods,
    selectedPaymentMethodId: 'pm-1',
    isEditMode: false,
  },
};

export const EditMode: Story = {
  args: {
    savedPaymentMethods: mockPaymentMethods,
    selectedPaymentMethodId: 'pm-1',
    isEditMode: true,
  },
};

export const NonDefaultSelected: Story = {
  args: {
    savedPaymentMethods: mockPaymentMethods,
    selectedPaymentMethodId: 'pm-2',
    isEditMode: true,
  },
};

export const SingleMethod: Story = {
  args: {
    savedPaymentMethods: [mockPaymentMethods[0]!],
    selectedPaymentMethodId: 'pm-1',
    isEditMode: true,
  },
};

export const PayPalSelected: Story = {
  args: {
    savedPaymentMethods: mockPaymentMethods,
    selectedPaymentMethodId: 'pm-3',
    isEditMode: true,
  },
};

export const Empty: Story = {
  args: {
    savedPaymentMethods: [],
    selectedPaymentMethodId: '',
    isEditMode: false,
  },
};
