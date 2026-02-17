import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { CartButtonComponent } from './cart-button.component';
import { CartService } from '@shared/services/cart.service';
import { signal } from '@angular/core';

/**
 * Creates an isolated mock CartService with a given item count
 */
function createMockCartService(count: number) {
  return {
    itemCount: signal(count),
  };
}

const meta: Meta<CartButtonComponent> = {
  title: 'Shared/UI/CartButton',
  component: CartButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CartButtonComponent>;

/**
 * Empty cart — badge is hidden
 */
export const Empty: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: createMockCartService(0) },
      ],
    }),
  ],
};

/**
 * Cart with a few items — badge shows count
 */
export const WithItems: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: createMockCartService(3) },
      ],
    }),
  ],
};

/**
 * Cart with many items — badge shows large count
 */
export const WithManyItems: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: createMockCartService(99) },
      ],
    }),
  ],
};
