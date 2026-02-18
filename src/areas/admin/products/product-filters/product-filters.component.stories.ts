import type { Meta, StoryObj } from '@storybook/angular';

import { ProductFiltersComponent } from './product-filters.component';
import type { CategoryDTO } from '@core';

const meta: Meta<ProductFiltersComponent> = {
  title: 'Admin/ProductFilters',
  component: ProductFiltersComponent,
  tags: ['autodocs'],
  argTypes: {
    filtersChange: { action: 'filtersChange' },
    filterActions: { action: 'filterActions' },
  },
};

export default meta;
type Story = StoryObj<ProductFiltersComponent>;

const mockCategories: CategoryDTO[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
  },
  {
    id: 'cat-2',
    name: 'Home & Office',
    description: 'Furniture and office supplies',
  },
  {
    id: 'cat-3',
    name: 'Sports & Outdoors',
    description: 'Sporting goods and outdoor equipment',
  },
  {
    id: 'cat-4',
    name: 'Books',
    description: 'Physical and digital books',
  },
  {
    id: 'cat-5',
    name: 'Clothing',
    description: 'Apparel and fashion accessories',
  },
];

export const Default: Story = {
  args: {
    categories: mockCategories,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    categories: mockCategories,
    isLoading: true,
  },
};

export const NoCategories: Story = {
  args: {
    categories: [],
    isLoading: false,
  },
};

export const FewCategories: Story = {
  args: {
    categories: [mockCategories[0]!, mockCategories[1]!],
    isLoading: false,
  },
};

export const ManyCategories: Story = {
  args: {
    categories: [
      ...mockCategories,
      { id: 'cat-6', name: 'Toys & Games', description: 'Toys and board games' },
      { id: 'cat-7', name: 'Beauty', description: 'Beauty and personal care' },
      { id: 'cat-8', name: 'Automotive', description: 'Car parts and accessories' },
      { id: 'cat-9', name: 'Pet Supplies', description: 'Pet food and accessories' },
      { id: 'cat-10', name: 'Garden', description: 'Gardening tools and plants' },
    ],
    isLoading: false,
  },
};
