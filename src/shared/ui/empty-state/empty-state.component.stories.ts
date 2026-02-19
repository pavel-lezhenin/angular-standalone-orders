import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Shared/UI/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
  args: {
    icon: 'inbox',
    title: 'No data',
    message: '',
    actionLabel: '',
    actionIcon: '',
    actionColor: 'primary',
    size: 'default',
  },
  argTypes: {
    action: { action: 'action' },
    actionColor: {
      control: 'select',
      options: ['primary', 'accent', 'warn'],
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

/**
 * Default empty state — generic "No data" message
 */
export const Default: Story = {
  args: {
    icon: 'inbox',
    title: 'No data',
    message: 'There is nothing to display at the moment.',
  },
};

/**
 * Empty cart scenario
 */
export const EmptyCart: Story = {
  args: {
    icon: 'shopping_cart',
    title: 'Your cart is empty',
    message: 'Add some products to get started!',
    actionLabel: 'Continue Shopping',
    actionIcon: 'store',
  },
};

/**
 * No search results
 */
export const NoSearchResults: Story = {
  args: {
    icon: 'search_off',
    title: 'No results found',
    message: 'Try adjusting your search or filter criteria.',
    actionLabel: 'Clear Filters',
    actionIcon: 'filter_list_off',
  },
};

/**
 * No orders found
 */
export const NoOrders: Story = {
  args: {
    icon: 'receipt_long',
    title: 'No orders yet',
    message: 'Your order history will appear here once you make a purchase.',
    actionLabel: 'Browse Products',
    actionIcon: 'shopping_bag',
  },
};

/**
 * Error state
 */
export const ErrorState: Story = {
  args: {
    icon: 'error_outline',
    title: 'Something went wrong',
    message: 'We encountered an error loading your data. Please try again.',
    actionLabel: 'Retry',
    actionIcon: 'refresh',
    actionColor: 'warn',
  },
};

/**
 * Without action button — informational only
 */
export const NoAction: Story = {
  args: {
    icon: 'notifications_off',
    title: 'No notifications',
    message: 'You are all caught up!',
  },
};

/**
 * Without message — title and icon only
 */
export const TitleOnly: Story = {
  args: {
    icon: 'folder_open',
    title: 'This folder is empty',
  },
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    icon: 'inbox',
    title: 'No items',
    message: 'Nothing to show.',
    size: 'small',
  },
};

/**
 * Large size variant
 */
export const Large: Story = {
  args: {
    icon: 'cloud_off',
    title: 'No connection',
    message: 'Please check your internet connection and try again.',
    actionLabel: 'Retry',
    actionIcon: 'refresh',
    size: 'large',
  },
};

/**
 * Accent color action button
 */
export const AccentAction: Story = {
  args: {
    icon: 'favorite_border',
    title: 'No favorites yet',
    message: 'Start adding items to your favorites list.',
    actionLabel: 'Explore Products',
    actionIcon: 'explore',
    actionColor: 'accent',
  },
};
