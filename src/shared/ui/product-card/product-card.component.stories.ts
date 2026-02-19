import type { Meta, StoryObj } from '@storybook/angular';
import { ProductCardComponent } from './product-card.component';
import type { ProductWithCategoryDTO } from '@core';

const mockProduct: ProductWithCategoryDTO = {
  id: '1',
  name: 'Premium Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 299.99,
  stock: 50,
  categoryId: 'cat-1',
  categoryName: 'Electronics',
  imageUrl: '/products/headphones.svg',
  imageUrls: ['/products/headphones.svg'],
  specifications: [
    { name: 'Type', value: 'Over-ear' },
    { name: 'Connectivity', value: 'Bluetooth 5.0' },
    { name: 'Battery Life', value: '30 hours' },
  ],
};

const meta: Meta<ProductCardComponent> = {
  title: 'Shared/UI/ProductCard',
  component: ProductCardComponent,
  tags: ['autodocs'],
  args: {
    product: mockProduct,
    showAddToCart: false,
  },
  argTypes: {
    cardClick: {
      action: 'cardClick',
    },
    addToCart: {
      action: 'addToCart',
    },
  },
};

export default meta;
type Story = StoryObj<ProductCardComponent>;

export const Default: Story = {
  args: {
    product: mockProduct,
    showAddToCart: false,
  },
};

export const WithAddToCartButton: Story = {
  args: {
    product: mockProduct,
    showAddToCart: true,
  },
};

export const LowStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stock: 5,
    },
    showAddToCart: true,
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stock: 0,
    },
    showAddToCart: true,
  },
};

export const NoImage: Story = {
  args: {
    product: {
      ...mockProduct,
      imageUrl: '',
    },
    showAddToCart: true,
  },
};

export const LongProductName: Story = {
  args: {
    product: {
      ...mockProduct,
      name: 'Ultra Premium Professional Studio Grade Wireless Noise Cancelling Headphones with Advanced Features',
    },
    showAddToCart: true,
  },
};

export const ExpensiveProduct: Story = {
  args: {
    product: {
      ...mockProduct,
      price: 9999.99,
    },
    showAddToCart: true,
  },
};
