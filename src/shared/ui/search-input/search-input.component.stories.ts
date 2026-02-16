import { FormControl } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { SearchInputComponent } from './search-input.component';

interface SearchInputStoryArgs {
  placeholder: string;
  label: string;
  debounceMs: number;
  initialValue: string;
}

const meta: Meta<SearchInputStoryArgs> = {
  title: 'Shared/UI/SearchInput',
  component: SearchInputComponent,
  tags: ['autodocs'],
  argTypes: {
    initialValue: {
      control: 'text',
      description: 'Initial value for the internal FormControl',
    },
  },
  render: (args) => ({
    props: {
      placeholder: args.placeholder,
      label: args.label,
      debounceMs: args.debounceMs,
      searchControl: new FormControl<string | null>(args.initialValue),
      search: (value: string) => {
        console.log('Search:', value);
      },
      clear: () => {
        console.log('Clear');
      },
    },
  }),
};

export default meta;
type Story = StoryObj<SearchInputStoryArgs>;

export const Default: Story = {
  args: {
    placeholder: 'Search products...',
    label: 'Search',
    debounceMs: 600,
    initialValue: '',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search orders...',
    label: 'Order search',
    debounceMs: 600,
    initialValue: 'Order #1001',
  },
};