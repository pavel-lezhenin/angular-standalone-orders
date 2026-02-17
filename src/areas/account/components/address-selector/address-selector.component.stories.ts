import type { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { AddressSelectorComponent } from './address-selector.component';
import type { AddressDTO } from '@core/models';

const meta: Meta<AddressSelectorComponent> = {
  title: 'Account/AddressSelector',
  component: AddressSelectorComponent,
  tags: ['autodocs'],
  argTypes: {
    selectionChange: { action: 'selectionChange' },
    setAsDefault: { action: 'setAsDefault' },
    deleteSelected: { action: 'deleteSelected' },
  },
};

export default meta;
type Story = StoryObj<AddressSelectorComponent>;

const mockAddresses: AddressDTO[] = [
  {
    id: 'addr-1',
    label: 'Home',
    recipientName: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    postalCode: '10001',
    phone: '+1 (555) 123-4567',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    recipientName: 'John Doe',
    addressLine1: '456 Business Ave',
    addressLine2: 'Suite 100',
    city: 'San Francisco',
    postalCode: '94105',
    phone: '+1 (555) 987-6543',
    isDefault: false,
  },
  {
    id: 'addr-3',
    label: 'Parents House',
    recipientName: 'Jane Doe',
    addressLine1: '789 Oak Lane',
    city: 'Boston',
    postalCode: '02108',
    phone: '+1 (555) 555-5555',
    isDefault: false,
  },
];

export const ViewMode: Story = {
  args: {
    savedAddresses: mockAddresses,
    selectedAddressId: 'addr-1',
    isEditMode: false,
  },
};

export const EditMode: Story = {
  args: {
    savedAddresses: mockAddresses,
    selectedAddressId: 'addr-1',
    isEditMode: true,
  },
};

export const NonDefaultSelected: Story = {
  args: {
    savedAddresses: mockAddresses,
    selectedAddressId: 'addr-2',
    isEditMode: true,
  },
};

export const SingleAddress: Story = {
  args: {
    savedAddresses: [mockAddresses[0]!],
    selectedAddressId: 'addr-1',
    isEditMode: true,
  },
};

export const Empty: Story = {
  args: {
    savedAddresses: [],
    selectedAddressId: '',
    isEditMode: false,
  },
};
