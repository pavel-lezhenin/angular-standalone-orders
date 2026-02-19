import type { Meta, StoryObj } from '@storybook/angular';
import { AccountStatsComponent } from './account-stats.component';

const meta: Meta<AccountStatsComponent> = {
  title: 'Account/AccountStats',
  component: AccountStatsComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AccountStatsComponent>;

export const Default: Story = {
  args: {
    totalOrders: 42,
    totalSpent: 1234.56,
    loyaltyPoints: 850,
  },
};

export const NewUser: Story = {
  args: {
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  },
};

export const FrequentBuyer: Story = {
  args: {
    totalOrders: 156,
    totalSpent: 15890.75,
    loyaltyPoints: 3200,
  },
};

export const SingleOrder: Story = {
  args: {
    totalOrders: 1,
    totalSpent: 99.99,
    loyaltyPoints: 100,
  },
};

export const HighSpender: Story = {
  args: {
    totalOrders: 89,
    totalSpent: 45123.99,
    loyaltyPoints: 9999,
  },
};
