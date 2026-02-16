import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Shared/UI/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
  args: {
    currentPage: 1,
    totalPages: 10,
  },
  argTypes: {
    pageChange: {
      action: 'pageChange',
    },
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
  },
};