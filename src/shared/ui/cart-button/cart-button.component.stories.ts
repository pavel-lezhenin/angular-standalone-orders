import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { CartButtonComponent } from './cart-button.component';
import { CartService } from '@shared/services/cart.service';
import { signal } from '@angular/core';

const mockCartService = {
  itemCount: signal(0),
};

const meta: Meta<CartButtonComponent> = {
  title: 'Shared/UI/CartButton',
  component: CartButtonComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: mockCartService },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<CartButtonComponent>;

export const Empty: Story = {
  render: () => ({
    props: {},
  }),
};

export const WithItems: Story = {
  render: () => {
    mockCartService.itemCount.set(3);
    return {
      props: {},
    };
  },
};

export const WithManyItems: Story = {
  render: () => {
    mockCartService.itemCount.set(99);
    return {
      props: {},
    };
  },
};
