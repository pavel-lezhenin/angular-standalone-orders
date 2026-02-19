import type { Meta, StoryObj } from '@storybook/angular';
import type { SummaryLine } from './order-summary.component';
import { OrderSummaryComponent } from './order-summary.component';

const defaultLines: SummaryLine[] = [
  { label: 'Subtotal', value: 249.97 },
  { label: 'Shipping', value: 9.99 },
  { label: 'Tax (10%)', value: 25.0 },
];

const meta: Meta<OrderSummaryComponent> = {
  title: 'Shared/UI/OrderSummary',
  component: OrderSummaryComponent,
  tags: ['autodocs'],
  args: {
    title: 'Order Summary',
    summaryLines: defaultLines,
    total: 284.96,
    totalLabel: 'Total',
    showDivider: true,
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'card'],
    },
  },
};

export default meta;
type Story = StoryObj<OrderSummaryComponent>;

/**
 * Default order summary with subtotal, shipping, tax, and total
 */
export const Default: Story = {
  args: {
    summaryLines: defaultLines,
    total: 284.96,
  },
};

/**
 * Compact variant for sidebar or small areas
 */
export const Compact: Story = {
  args: {
    summaryLines: defaultLines,
    total: 284.96,
    variant: 'compact',
  },
};

/**
 * Card variant with elevated styling
 */
export const Card: Story = {
  args: {
    summaryLines: defaultLines,
    total: 284.96,
    variant: 'card',
  },
};

/**
 * Minimal summary — only total, no line items
 */
export const MinimalTotal: Story = {
  args: {
    summaryLines: [],
    total: 99.99,
    showDivider: false,
  },
};

/**
 * Free shipping scenario
 */
export const FreeShipping: Story = {
  args: {
    summaryLines: [
      { label: 'Subtotal', value: 249.97 },
      { label: 'Shipping', value: 0 },
      { label: 'Tax (10%)', value: 25.0 },
    ],
    total: 274.97,
  },
};

/**
 * With discount line
 */
export const WithDiscount: Story = {
  args: {
    summaryLines: [
      { label: 'Subtotal', value: 499.99 },
      { label: 'Discount (20%)', value: -100.0, class: 'discount' },
      { label: 'Shipping', value: 0 },
      { label: 'Tax (8%)', value: 32.0 },
    ],
    total: 431.99,
  },
};

/**
 * Custom title and total label
 */
export const CustomLabels: Story = {
  args: {
    title: 'Payment Summary',
    summaryLines: [
      { label: 'Items (3)', value: 149.97 },
      { label: 'Service Fee', value: 5.0 },
    ],
    total: 154.97,
    totalLabel: 'Amount Due',
  },
};

/**
 * Without divider line before total
 */
export const NoDivider: Story = {
  args: {
    summaryLines: defaultLines,
    total: 284.96,
    showDivider: false,
  },
};

/**
 * Large order with many line items
 */
export const LargeOrder: Story = {
  args: {
    summaryLines: [
      { label: 'Subtotal (12 items)', value: 1299.88 },
      { label: 'Shipping (Express)', value: 24.99 },
      { label: 'Insurance', value: 12.99 },
      { label: 'Coupon (SAVE20)', value: -260.0, class: 'discount' },
      { label: 'Tax (10%)', value: 107.79 },
    ],
    total: 1185.65,
  },
};
