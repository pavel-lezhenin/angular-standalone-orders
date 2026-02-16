import type { Meta, StoryObj } from '@storybook/angular';
import { PageLoaderComponent } from './page-loader.component';

const meta: Meta<PageLoaderComponent> = {
  title: 'Shared/UI/PageLoader',
  component: PageLoaderComponent,
  tags: ['autodocs'],
  args: {
    isLoading: true,
    diameter: 50,
  },
};

export default meta;
type Story = StoryObj<PageLoaderComponent>;

export const Loading: Story = {
  args: {
    isLoading: true,
    diameter: 50,
  },
};

export const Hidden: Story = {
  args: {
    isLoading: false,
    diameter: 50,
  },
};