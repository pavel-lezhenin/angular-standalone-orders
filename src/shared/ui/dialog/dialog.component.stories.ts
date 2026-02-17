import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { DialogComponent } from './dialog.component';
import type { DialogConfig } from './dialog.config';

const mockDialogRef = {
  close: () => {},
  disableClose: false,
  backdropClick: () => ({
    subscribe: () => ({
      unsubscribe: () => {},
    }),
  }),
  keydownEvents: () => ({
    subscribe: () => ({
      unsubscribe: () => {},
    }),
  }),
};

@Component({
  selector: 'app-mock-form-content',
  standalone: true,
  template: `
    <p>This is custom form content that would be projected into the dialog.</p>
    <p>You can add forms, lists, or any other content here.</p>
  `,
})
class MockFormContentComponent {}

const meta: Meta<DialogComponent> = {
  title: 'Shared/UI/Dialog',
  component: DialogComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DialogComponent>;

export const FormDialog: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Create User',
            type: 'form',
            submitLabel: 'Create',
            cancelLabel: 'Cancel',
          } as DialogConfig,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const ConfirmDialog: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Confirm Action',
            type: 'confirm',
            message: 'Are you sure you want to proceed with this action?',
            submitLabel: 'Confirm',
            cancelLabel: 'Cancel',
          } as DialogConfig,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const NotificationDialog: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Success',
            type: 'notification',
            message: 'Your changes have been saved successfully.',
          } as DialogConfig,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const DeleteConfirmation: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Delete Item',
            type: 'confirm',
            message: 'This action cannot be undone. Are you sure you want to delete this item?',
            submitLabel: 'Delete',
            cancelLabel: 'Cancel',
          } as DialogConfig,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const LongMessage: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Terms and Conditions',
            type: 'notification',
            message: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
          } as DialogConfig,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};

export const CustomLabels: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Save Changes',
            type: 'form',
            submitLabel: 'Save & Close',
            cancelLabel: 'Discard',
          } as DialogConfig,
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }),
  ],
};
