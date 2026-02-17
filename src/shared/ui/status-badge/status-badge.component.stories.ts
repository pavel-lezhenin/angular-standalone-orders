import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadgeComponent, StatusBadgeVariant } from './status-badge.component';

const meta: Meta<StatusBadgeComponent> = {
  title: 'Shared/UI/StatusBadge',
  component: StatusBadgeComponent,
  tags: ['autodocs'],
  args: {
    label: 'Active',
    variant: 'neutral',
    icon: '',
    size: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral'] satisfies StatusBadgeVariant[],
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<StatusBadgeComponent>;

/**
 * Default neutral badge
 */
export const Default: Story = {
  args: {
    label: 'Active',
    variant: 'neutral',
  },
};

/**
 * Success variant — for positive statuses like "In Stock", "Completed"
 */
export const Success: Story = {
  args: {
    label: 'In Stock',
    variant: 'success',
    icon: 'check_circle',
  },
};

/**
 * Warning variant — for cautionary statuses like "Low Stock", "Pending"
 */
export const Warning: Story = {
  args: {
    label: 'Low Stock',
    variant: 'warning',
    icon: 'warning',
  },
};

/**
 * Error variant — for negative statuses like "Out of Stock", "Failed"
 */
export const Error: Story = {
  args: {
    label: 'Out of Stock',
    variant: 'error',
    icon: 'error',
  },
};

/**
 * Info variant — for informational statuses like "Processing", "New"
 */
export const Info: Story = {
  args: {
    label: 'Processing',
    variant: 'info',
    icon: 'info',
  },
};

/**
 * Without icon — text-only badge
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Draft',
    variant: 'neutral',
    icon: '',
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    label: 'New',
    variant: 'info',
    icon: 'fiber_new',
    size: 'small',
  },
};

/**
 * Large size variant
 */
export const Large: Story = {
  args: {
    label: 'Completed',
    variant: 'success',
    icon: 'check_circle',
    size: 'large',
  },
};

/**
 * All variants side-by-side comparison
 */
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <app-status-badge label="Success" variant="success" icon="check_circle" />
        <app-status-badge label="Warning" variant="warning" icon="warning" />
        <app-status-badge label="Error" variant="error" icon="error" />
        <app-status-badge label="Info" variant="info" icon="info" />
        <app-status-badge label="Neutral" variant="neutral" />
      </div>
    `,
  }),
};
