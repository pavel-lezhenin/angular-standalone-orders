import type { Meta, StoryObj } from '@storybook/angular';
import { CategoryTableComponent } from './category-table.component';
import type { CategoryDTO } from '@core';

const meta: Meta<CategoryTableComponent> = {
  title: 'Admin/CategoryTable',
  component: CategoryTableComponent,
  tags: ['autodocs'],
  argTypes: {
    pageChange: { action: 'pageChange' },
    editClick: { action: 'editClick' },
    deleteClick: { action: 'deleteClick' },
  },
};

export default meta;
type Story = StoryObj<CategoryTableComponent>;

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
    totalCategories: mockCategories.length,
    currentPage: 1,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    canEdit: true,
    canDelete: true,
  },
};

export const ReadOnly: Story = {
  args: {
    categories: mockCategories,
    totalCategories: mockCategories.length,
    currentPage: 1,
    pageSize: 20,
    canEdit: false,
    canDelete: false,
  },
};

export const Empty: Story = {
  args: {
    categories: [],
    totalCategories: 0,
    currentPage: 1,
    pageSize: 20,
    canEdit: true,
    canDelete: true,
  },
};

export const LargeDataset: Story = {
  args: {
    categories: mockCategories,
    totalCategories: 45,
    currentPage: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    canEdit: true,
    canDelete: true,
  },
};

export const OnlyEditPermission: Story = {
  args: {
    categories: mockCategories,
    totalCategories: mockCategories.length,
    currentPage: 1,
    pageSize: 20,
    canEdit: true,
    canDelete: false,
  },
};

export const SingleCategory: Story = {
  args: {
    categories: [mockCategories[0]!],
    totalCategories: 1,
    currentPage: 1,
    pageSize: 20,
    canEdit: true,
    canDelete: true,
  },
};
