import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { TopBarComponent } from './top-bar.component';
import type { NavItem } from '@/shared/models';

const defaultNavItems: NavItem[] = [
  { label: 'Home', route: '/', icon: 'home' },
  { label: 'Shop', route: '/shop', icon: 'shopping_bag' },
  { label: 'Orders', route: '/orders', icon: 'receipt_long' },
  { label: 'About', route: '/about', icon: 'info' },
];

const meta: Meta<TopBarComponent> = {
  title: 'Shared/UI/TopBar',
  component: TopBarComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  args: {
    title: 'Orders Platform',
    navItems: defaultNavItems,
    showSidenavToggle: false,
    sidenavOpened: true,
  },
};

export default meta;
type Story = StoryObj<TopBarComponent>;

export const Default: Story = {
  args: {
    title: 'Orders Platform',
    navItems: defaultNavItems,
    showSidenavToggle: false,
  },
};

export const WithSidenavToggle: Story = {
  args: {
    title: 'Orders Platform',
    navItems: defaultNavItems,
    showSidenavToggle: true,
    sidenavOpened: true,
  },
};

export const SidenavClosed: Story = {
  args: {
    title: 'Orders Platform',
    navItems: defaultNavItems,
    showSidenavToggle: true,
    sidenavOpened: false,
  },
};

export const MinimalNavigation: Story = {
  args: {
    title: 'My App',
    navItems: [
      { label: 'Home', route: '/' },
      { label: 'About', route: '/about' },
    ],
    showSidenavToggle: false,
  },
};

export const ManyNavItems: Story = {
  args: {
    title: 'Enterprise Platform',
    navItems: [
      { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
      { label: 'Products', route: '/products', icon: 'inventory' },
      { label: 'Orders', route: '/orders', icon: 'receipt_long' },
      { label: 'Customers', route: '/customers', icon: 'people' },
      { label: 'Analytics', route: '/analytics', icon: 'analytics' },
      { label: 'Reports', route: '/reports', icon: 'description' },
      { label: 'Settings', route: '/settings', icon: 'settings' },
    ],
    showSidenavToggle: false,
  },
};

export const NoNavItems: Story = {
  args: {
    title: 'Simple App',
    navItems: [],
    showSidenavToggle: false,
  },
};
