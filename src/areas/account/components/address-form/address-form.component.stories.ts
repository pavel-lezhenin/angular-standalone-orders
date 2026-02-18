import type { Meta, StoryObj } from '@storybook/angular';
import type { FormGroup} from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { AddressFormComponent } from './address-form.component';

const meta: Meta<AddressFormComponent> = {
  title: 'Account/AddressForm',
  component: AddressFormComponent,
  tags: ['autodocs'],
  argTypes: {
    saveAddress: { action: 'saveAddress' },
    cancelAddress: { action: 'cancelAddress' },
  },
};

export default meta;
type Story = StoryObj<AddressFormComponent>;

function createAddressForm(values?: Partial<Record<string, string>>): FormGroup {
  const fb = new FormBuilder();
  const defaults = {
    label: 'Home',
    recipientName: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    postalCode: '10001',
    phone: '+1 (555) 123-4567',
  };
  const data = { ...defaults, ...values };

  return fb.group({
    label: [data.label, Validators.required],
    recipientName: [data.recipientName, Validators.required],
    addressLine1: [data.addressLine1, Validators.required],
    addressLine2: [data.addressLine2],
    city: [data.city, Validators.required],
    postalCode: [data.postalCode, Validators.required],
    phone: [data.phone, [Validators.required, Validators.pattern(/^\+?\d{10,}$/)]],
  });
}

export const FilledForm: Story = {
  args: {
    addressForm: createAddressForm(),
  },
};

export const EmptyForm: Story = {
  args: {
    addressForm: createAddressForm({
      label: '',
      recipientName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      phone: '',
    }),
  },
};

export const WithErrors: Story = {
  args: {
    addressForm: (() => {
      const form = createAddressForm({
        label: '',
        recipientName: '',
        addressLine1: '',
        city: '',
        postalCode: '',
        phone: 'invalid',
      });
      // Mark all controls as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.get(key)?.markAsTouched();
      });
      return form;
    })(),
  },
};

export const WorkAddress: Story = {
  args: {
    addressForm: createAddressForm({
      label: 'Work',
      recipientName: 'Jane Smith',
      addressLine1: '456 Business Ave',
      addressLine2: 'Suite 100',
      city: 'San Francisco',
      postalCode: '94105',
      phone: '+1 (555) 987-6543',
    }),
  },
};
