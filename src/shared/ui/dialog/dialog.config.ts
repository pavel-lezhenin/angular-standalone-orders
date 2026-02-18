import type { MatDialogConfig } from '@angular/material/dialog';
import type { Type } from '@angular/core';

/**
 * Dialog configuration interface
 */
export interface DialogConfig {
  /**
   * Dialog title
   */
  title: string;

  /**
   * Dialog type
   * - notification: Only close button in top-right
   * - form: Cancel + Submit buttons (default)
   * - confirm: Cancel + Confirm buttons
   * @default 'form'
   */
  type?: 'notification' | 'form' | 'confirm';

  /**
   * Dialog message (optional, for simple message dialogs)
   */
  message?: string;

  /**
   * Optional custom content component rendered inside dialog body.
   */
  contentComponent?: Type<unknown>;

  /**
   * Inputs passed to contentComponent when rendered.
   */
  contentInputs?: Record<string, unknown>;

  /**
   * Submit button label
   * @default 'Update'
   */
  submitLabel?: string;

  /**
   * Cancel button label
   * @default 'Cancel'
   */
  cancelLabel?: string;

  /**
   * Whether dialog can be closed via backdrop click
   * @default true (prevents backdrop close)
   */
  disableBackdropClick?: boolean;

  /**
   * Width of the dialog (not used in component, set via MatDialog config)
   * @deprecated Use MatDialog open config instead
   */
  width?: string;

  /**
   * Max width of the dialog (not used in component, set via MatDialog config)
   * @deprecated Use MatDialog open config instead
   */
  maxWidth?: string;
}

/**
 * Base dialog configuration with common settings
 */
export const baseDialogConfig: MatDialogConfig = {
  width: '400px',
  maxWidth: '90vw',
  disableClose: false,
};

/**
 * Form dialog configuration (create/edit)
 */
export const formDialogConfig: MatDialogConfig = {
  width: '500px',
  maxWidth: '90vw',
  disableClose: true,
};

/**
 * Confirm dialog configuration
 */
export const confirmDialogConfig: MatDialogConfig = {
  ...baseDialogConfig,
  data: {
    type: 'confirm',
    cancelLabel: 'Cancel',
  },
};

/**
 * Delete confirmation dialog configuration
 */
export const deleteDialogConfig: MatDialogConfig = {
  ...confirmDialogConfig,
  data: {
    ...confirmDialogConfig.data,
    title: 'Delete',
    submitLabel: 'Delete',
  },
};

/**
 * Factory function to create a form dialog config for create mode
 */
export function createFormDialogConfig(title: string, submitLabel: string): MatDialogConfig {
  return {
    ...formDialogConfig,
    data: {
      mode: 'create',
      title,
      submitLabel,
    },
  };
}

/**
 * Factory function to create a form dialog config for edit mode
 */
export function editFormDialogConfig<T extends object>(
  entity: T,
  title: string,
  entityKey: string = 'user'
): MatDialogConfig {
  return {
    ...formDialogConfig,
    data: {
      mode: 'edit',
      [entityKey]: entity,
      title,
    },
  };
}

/**
 * Factory function to create a generic confirm dialog config
 */
export function confirmDialogConfigFor(
  title: string,
  message: string,
  submitLabel: string
): MatDialogConfig {
  return {
    ...confirmDialogConfig,
    data: {
      ...confirmDialogConfig.data,
      title,
      message,
      submitLabel,
    },
  };
}

/**
 * Factory function to create a delete dialog config
 */
export function deleteDialogConfigFor(message: string): MatDialogConfig {
  return {
    ...deleteDialogConfig,
    data: {
      ...deleteDialogConfig.data,
      message,
    },
  };
}
