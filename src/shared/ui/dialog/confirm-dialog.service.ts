import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog.component';
import { deleteDialogConfigFor, confirmDialogConfigFor } from './dialog.config';

/**
 * Confirm Dialog Service
 * 
 * Wrapper around DialogComponent to provide a consistent interface
 * for confirmation dialogs with minimal boilerplate code
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Open a delete confirmation dialog
   * 
   * @param message - Confirmation message to display
   * @param onConfirm - Async callback executed when user confirms
   * @param onError - Optional callback executed on error (receives the error)
   */
  openDeleteConfirm(
    message: string,
    onConfirm: () => Promise<void>,
    onError?: (error: unknown) => void
  ): void {
    const dialogRef = this.dialog.open(DialogComponent, deleteDialogConfigFor(message));
    this.handleConfirmDialog(dialogRef, onConfirm, onError);
  }

  /**
   * Open a generic confirmation dialog
   * 
   * @param title - Dialog title
   * @param message - Confirmation message
   * @param submitLabel - Label for confirm button (default: 'Confirm')
   * @param onConfirm - Async callback executed when user confirms
   * @param onError - Optional callback executed on error
   */
  openConfirm(
    title: string,
    message: string,
    submitLabel: string = 'Confirm',
    onConfirm: () => Promise<void>,
    onError?: (error: unknown) => void
  ): void {
    const dialogRef = this.dialog.open(
      DialogComponent,
      confirmDialogConfigFor(title, message, submitLabel)
    );
    this.handleConfirmDialog(dialogRef, onConfirm, onError);
  }

  /**
   * Handle confirm dialog submit and error logic
   */
  private handleConfirmDialog(
    dialogRef: any,
    onConfirm: () => Promise<void>,
    onError?: (error: unknown) => void
  ): void {
    const dialogComponent = dialogRef.componentInstance;

    dialogComponent.submit.subscribe(async () => {
      dialogComponent.setLoading(true);
      try {
        await onConfirm();
      } catch (err: unknown) {
        console.error('Confirmation action failed:', err);
        dialogComponent.setLoading(false);
        onError?.(err);
      } finally {
        if (!dialogComponent.isLoading()) {
          dialogRef.close({ confirmed: true });
        }
      }
    });
  }
}
