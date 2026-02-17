import type { Meta, StoryObj } from '@storybook/angular';
import { QuantityControlComponent } from './quantity-control.component';

const meta: Meta<QuantityControlComponent> = {
  title: 'Shared/UI/QuantityControl',
  component: QuantityControlComponent,
  tags: ['autodocs'],
  args: {
    quantity: 1,
    min: 1,
    max: null,
    disabled: false,
    size: 'default',
  },
  argTypes: {
    quantityChange: { action: 'quantityChange' },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<QuantityControlComponent>;

/**
 * Default state — quantity 1, min 1, no max
 */
export const Default: Story = {
  args: {
    quantity: 1,
    min: 1,
    max: null,
  },
};

/**
 * Mid-range value with both increment and decrement enabled
 */
export const MidRange: Story = {
  args: {
    quantity: 5,
    min: 1,
    max: 10,
  },
};

/**
 * At minimum — decrement button disabled
 */
export const AtMinimum: Story = {
  args: {
    quantity: 1,
    min: 1,
    max: 10,
  },
};

/**
 * At maximum — increment button disabled
 */
export const AtMaximum: Story = {
  args: {
    quantity: 10,
    min: 1,
    max: 10,
  },
};

/**
 * Disabled state — all controls disabled
 */
export const Disabled: Story = {
  args: {
    quantity: 3,
    min: 1,
    max: 10,
    disabled: true,
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    quantity: 2,
    min: 1,
    max: 99,
    size: 'small',
  },
};

/**
 * Large size variant
 */
export const Large: Story = {
  args: {
    quantity: 2,
    min: 1,
    max: 99,
    size: 'large',
  },
};

/**
 * No maximum limit
 */
export const NoMaxLimit: Story = {
  args: {
    quantity: 50,
    min: 0,
    max: null,
  },
};

/**
 * Zero-based minimum (e.g. for optional items)
 */
export const ZeroBased: Story = {
  args: {
    quantity: 0,
    min: 0,
    max: 5,
  },
};
