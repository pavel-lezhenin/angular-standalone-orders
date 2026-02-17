import type { Meta, StoryObj } from '@storybook/angular';
import { PaymentFormComponent } from './payment-form.component';
import type { SavedPaymentMethodDTO } from '@core/models';

const mockSavedMethods: SavedPaymentMethodDTO[] = [
  {
    id: '1',
    type: 'card',
    last4Digits: '4242',
    cardholderName: 'John Doe',
    expiryMonth: '12',
    expiryYear: '2025',
    isDefault: true,
    createdAt: Date.parse('2024-01-01T00:00:00Z'),
  },
  {
    id: '2',
    type: 'card',
    last4Digits: '5555',
    cardholderName: 'Jane Smith',
    expiryMonth: '06',
    expiryYear: '2026',
    isDefault: false,
    createdAt: Date.parse('2024-02-01T00:00:00Z'),
  },
];

const meta: Meta<PaymentFormComponent> = {
  title: 'Shared/UI/PaymentForm',
  component: PaymentFormComponent,
  tags: ['autodocs'],
  args: {
    savedMethods: [],
  },
};

export default meta;
type Story = StoryObj<PaymentFormComponent>;

export const CardPayment: Story = {
  args: {
    savedMethods: [],
  },
};

export const WithSavedMethods: Story = {
  args: {
    savedMethods: mockSavedMethods,
  },
};

export const PayPal: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-payment-form [savedMethods]="savedMethods"></app-payment-form>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Auto-select PayPal method for demonstration
    const paypalRadio = canvasElement.querySelector('input[value="paypal"]') as HTMLInputElement;
    if (paypalRadio) {
      paypalRadio.click();
    }
  },
};

export const CashOnDelivery: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-payment-form [savedMethods]="savedMethods"></app-payment-form>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Auto-select COD method for demonstration
    const codRadio = canvasElement.querySelector('input[value="cash_on_delivery"]') as HTMLInputElement;
    if (codRadio) {
      codRadio.click();
    }
  },
};
