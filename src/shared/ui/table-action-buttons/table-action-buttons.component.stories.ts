import type { Meta, StoryObj } from '@storybook/angular';
import { TableActionButtonsComponent } from './table-action-buttons.component';

const meta: Meta<TableActionButtonsComponent> = {
  title: 'Shared/UI/TableActionButtons',
  component: TableActionButtonsComponent,
  tags: ['autodocs'],
  args: {
    canEdit: true,
    canDelete: true,
    canView: false,
  },
  argTypes: {
    edit: { action: 'edit' },
    delete: { action: 'delete' },
    view: { action: 'view' },
  },
};

export default meta;
type Story = StoryObj<TableActionButtonsComponent>;

/**
 * Default state — edit and delete buttons visible
 */
export const Default: Story = {
  args: {
    canEdit: true,
    canDelete: true,
    canView: false,
  },
};

/**
 * All action buttons visible
 */
export const AllActions: Story = {
  args: {
    canEdit: true,
    canDelete: true,
    canView: true,
  },
};

/**
 * View-only mode — only view button shown
 */
export const ViewOnly: Story = {
  args: {
    canEdit: false,
    canDelete: false,
    canView: true,
  },
};

/**
 * Edit-only mode — only edit button shown
 */
export const EditOnly: Story = {
  args: {
    canEdit: true,
    canDelete: false,
    canView: false,
  },
};

/**
 * Delete-only mode — only delete button shown
 */
export const DeleteOnly: Story = {
  args: {
    canEdit: false,
    canDelete: true,
    canView: false,
  },
};

/**
 * Custom icons and tooltips
 */
export const CustomIconsAndTooltips: Story = {
  args: {
    canEdit: true,
    canDelete: true,
    canView: true,
    editIcon: 'create',
    deleteIcon: 'remove_circle',
    viewIcon: 'preview',
    editTooltip: 'Modify item',
    deleteTooltip: 'Remove item',
    viewTooltip: 'Preview item',
  },
};

/**
 * With custom aria labels for accessibility
 */
export const WithAriaLabels: Story = {
  args: {
    canEdit: true,
    canDelete: true,
    canView: true,
    editAriaLabel: 'Edit order #1001',
    deleteAriaLabel: 'Delete order #1001',
    viewAriaLabel: 'View order #1001',
  },
};
