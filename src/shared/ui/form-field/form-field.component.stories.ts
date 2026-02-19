import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, Validators } from '@angular/forms';
import type { SelectOption } from './form-field.component';
import { FormFieldComponent } from './form-field.component';

/**
 * Helper to create a render function that instantiates a FormControl with the given config.
 * Required because FormControl cannot be serialized as a Storybook arg.
 */
function renderFormField(
  controlValue: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlValidators: any[] = [],
  touched = false
) {
  return (args: Record<string, unknown>) => {
    const control = new FormControl(controlValue, controlValidators);
    if (touched) {
      control.markAsTouched();
    }
    return {
      props: {
        ...args,
        control,
      },
    };
  };
}

const countryOptions: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

const meta: Meta<FormFieldComponent> = {
  title: 'Shared/UI/FormField',
  component: FormFieldComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select'],
    },
  },
};

export default meta;
type Story = StoryObj<FormFieldComponent>;

/**
 * Default text input
 */
export const Default: Story = {
  args: {
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your name',
  },
  render: renderFormField(''),
};

/**
 * Email input with validation
 */
export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    prefixIcon: 'email',
    required: true,
  },
  render: renderFormField('', [Validators.required, Validators.email]),
};

/**
 * Password input
 */
export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    prefixIcon: 'lock',
    required: true,
    hint: 'Minimum 8 characters',
  },
  render: renderFormField('', [Validators.required, Validators.minLength(8)]),
};

/**
 * Number input with min/max
 */
export const NumberInput: Story = {
  args: {
    label: 'Quantity',
    type: 'number',
    placeholder: '0',
    min: 1,
    max: 100,
    step: 1,
  },
  render: renderFormField(1, [Validators.min(1), Validators.max(100)]),
};

/**
 * Textarea with character counter
 */
export const Textarea: Story = {
  args: {
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter a description...',
    rows: 4,
    maxLength: 500,
    showCharacterCount: true,
  },
  render: renderFormField(''),
};

/**
 * Select dropdown
 */
export const Select: Story = {
  args: {
    label: 'Country',
    type: 'select',
    placeholder: 'Select a country',
    selectOptions: countryOptions,
    required: true,
  },
  render: renderFormField(''),
};

/**
 * With prefix and suffix icons
 */
export const WithIcons: Story = {
  args: {
    label: 'Website',
    type: 'url',
    placeholder: 'https://example.com',
    prefixIcon: 'language',
    suffixIcon: 'open_in_new',
  },
  render: renderFormField(''),
};

/**
 * With hint text
 */
export const WithHint: Story = {
  args: {
    label: 'Phone',
    type: 'tel',
    placeholder: '+1 (555) 000-0000',
    prefixIcon: 'phone',
    hint: 'Include country code',
    hintAlign: 'start',
  },
  render: renderFormField(''),
};

/**
 * Required field with validation error shown (touched + empty)
 */
export const WithValidationError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    prefixIcon: 'email',
    required: true,
  },
  render: renderFormField('', [Validators.required, Validators.email], true),
};

/**
 * Invalid email format error
 */
export const InvalidEmailError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    prefixIcon: 'email',
    required: true,
  },
  render: renderFormField('not-an-email', [Validators.required, Validators.email], true),
};

/**
 * Custom error messages
 */
export const CustomErrorMessages: Story = {
  args: {
    label: 'Username',
    type: 'text',
    placeholder: 'Enter username',
    required: true,
    customErrorMessages: {
      required: 'Please provide a username to continue',
    },
  },
  render: renderFormField('', [Validators.required], true),
};

/**
 * Pre-filled value
 */
export const PreFilled: Story = {
  args: {
    label: 'City',
    type: 'text',
    placeholder: 'Enter city',
  },
  render: renderFormField('New York'),
};
