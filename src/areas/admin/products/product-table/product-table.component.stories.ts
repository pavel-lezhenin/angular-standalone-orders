import type { Meta, StoryObj } from '@storybook/angular';
import { ProductTableComponent } from './product-table.component';
import type { ProductWithCategoryDTO } from '@core';

const meta: Meta<ProductTableComponent> = {
  title: 'Admin/ProductTable',
  component: ProductTableComponent,
  tags: ['autodocs'],
  argTypes: {
    pageChange: { action: 'pageChange' },
    editClick: { action: 'editClick' },
    deleteClick: { action: 'deleteClick' },
  },
};

export default meta;
type Story = StoryObj<ProductTableComponent>;

const mockProducts: ProductWithCategoryDTO[] = [
  {
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones',
    price: 199.99,
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    stock: 45,
    imageUrls: ['https://via.placeholder.com/100x100?text=Headphones'],
    specifications: [],
  },
  {
    id: 'prod-2',
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand',
    price: 49.99,
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    stock: 8,
    imageUrls: ['https://via.placeholder.com/100x100?text=Stand'],
    specifications: [],
  },
  {
    id: 'prod-3',
    name: 'USB-C Cable',
    description: 'High-speed USB-C charging cable',
    price: 12.99,
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    stock: 0,
    imageUrls: ['https://via.placeholder.com/100x100?text=Cable'],
    specifications: [],
  },
  {
    id: 'prod-4',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 34.99,
    categoryId: 'cat-2',
    categoryName: 'Home & Office',
    stock: 120,
    imageUrls: ['https://via.placeholder.com/100x100?text=Lamp'],
    specifications: [],
  },
  {
    id: 'prod-5',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical gaming keyboard',
    price: 89.99,
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    stock: 25,
    imageUrls: ['https://via.placeholder.com/100x100?text=Keyboard'],
    specifications: [],
  },
];

export const Default: Story = {
  args: {
    products: mockProducts,
    totalProducts: mockProducts.length,
    currentPage: 1,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    canEdit: true,
    canDelete: true,
  },
};

export const ReadOnly: Story = {
  args: {
    products: mockProducts,
    totalProducts: mockProducts.length,
    currentPage: 1,
    pageSize: 20,
    canEdit: false,
    canDelete: false,
  },
};

export const Empty: Story = {
  args: {
    products: [],
    totalProducts: 0,
    currentPage: 1,
    pageSize: 20,
    canEdit: true,
    canDelete: true,
  },
};

export const LargeDataset: Story = {
  args: {
    products: mockProducts,
    totalProducts: 150,
    currentPage: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    canEdit: true,
    canDelete: true,
  },
};

export const OnlyEditPermission: Story = {
  args: {
    products: mockProducts,
    totalProducts: mockProducts.length,
    currentPage: 1,
    pageSize: 20,
    canEdit: true,
    canDelete: false,
  },
};

export const OnlyDeletePermission: Story = {
  args: {
    products: mockProducts,
    totalProducts: mockProducts.length,
    currentPage: 1,
    pageSize: 20,
    canEdit: false,
    canDelete: true,
  },
};
