import type { Meta, StoryObj } from '@storybook/angular';
import { OrdersPaymentFormComponent } from './orders-payment-form.component';

/**
 * OrdersPaymentFormComponent Stories
 * 
 * Demonstrates the smart checkout payment form.
 * Creates its own FormGroup and manages validation.
 */

const meta: Meta<OrdersPaymentFormComponent> = {
  title: 'Orders/UI/OrdersPaymentForm',
  component: OrdersPaymentFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrdersPaymentFormComponent>;

/**
 * Default card payment
 */
export const Default: Story = {
  render: () => ({
    template: '<app-orders-payment-form />',
  }),
};

/**
 * With pre-selection simulation (for demo purposes)
 */
export const CardSelected: Story = {
  render: () => ({
    template: '<app-orders-payment-form />',
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const cardRadio = canvasElement.querySelector('input[value="card"]') as HTMLInputElement;
    if (cardRadio && !cardRadio.checked) {
      cardRadio.click();
    }
  },
};

/**
 * PayPal selected
 */
export const PayPalSelected: Story = {
  render: () => ({
    template: '<app-orders-payment-form />',
  }),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const paypalRadio = canvasElement.querySelector('input[value="paypal"]') as HTMLInputElement;
    if (paypalRadio) {
      paypalRadio.click();
    }
  },
};

/**
 * Cash on Delivery selected
 */
export const CashOnDeliverySelected: Story = {
  render: () => ({
    template: '<app-orders-payment-form />',
  }),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const codRadio = canvasElement.querySelector('input[value="cash_on_delivery"]') as HTMLInputElement;
    if (codRadio) {
      codRadio.click();
    }
  },
};
