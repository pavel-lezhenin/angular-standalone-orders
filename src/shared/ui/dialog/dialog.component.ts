import { Component, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

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
   */
  type?: 'notification' | 'form' | 'confirm';

  /**
   * Submit button label (default: 'Submit')
   */
  submitLabel?: string;

  /**
   * Cancel button label (default: 'Cancel')
   */
  cancelLabel?: string;

  /**
   * Whether dialog can be closed via backdrop click (default: false)
   */
  disableBackdropClick?: boolean;

  /**
   * Width of the dialog
   */
  width?: string;

  /**
   * Max width of the dialog
   */
  maxWidth?: string;
}

/**
 * Shared dialog component for consistent dialog UX across the app.
 *
 * Features:
 * - Three dialog types: notification, form, confirm
 * - Loading state management
 * - Backdrop click prevention
 * - Keyboard shortcuts (Escape to close, Enter to submit)
 *
 * @example
 * ```typescript
 * const dialogRef = this.dialog.open(DialogComponent, {
 *   data: {
 *     title: 'Create User',
 *     type: 'form',
 *     submitLabel: 'Create',
 *   },
 *   disableClose: true,
 * });
 *
 * dialogRef.componentInstance.submit.subscribe(async () => {
 *   dialogRef.componentInstance.setLoading(true);
 *   try {
 *     await this.createUser();
 *     dialogRef.close({ success: true });
 *   } catch (error) {
 *     dialogRef.componentInstance.setLoading(false);
 *     // Handle error
 *   }
 * });
 * ```
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent implements OnInit {
  /**
   * Dialog configuration injected via MAT_DIALOG_DATA
   */
  protected readonly config = inject<DialogConfig>(MAT_DIALOG_DATA);

  /**
   * Dialog reference for programmatic control
   */
  protected readonly dialogRef = inject(MatDialogRef<DialogComponent>);

  /**
   * Loading state signal
   */
  protected readonly isLoading = signal(false);

  /**
   * Whether the dialog can be closed (disabled during loading)
   */
  protected readonly canClose = computed(() => !this.isLoading());

  /**
   * Dialog type
   */
  protected readonly type = computed(() => this.config?.type || 'form');

  /**
   * Submit button label
   */
  protected readonly submitLabel = computed(() => this.config?.submitLabel || 'Submit');

  /**
   * Cancel button label
   */
  protected readonly cancelLabel = computed(() => this.config?.cancelLabel || 'Cancel');

  /**
   * Whether this is a notification dialog
   */
  protected readonly isNotification = computed(() => this.type() === 'notification');

  /**
   * Whether this is a form dialog
   */
  protected readonly isForm = computed(() => this.type() === 'form' || this.type() === 'confirm');

  /**
   * Emitted when user clicks submit button
   */
  public readonly submit = output<void>();

  /**
   * Emitted when user clicks cancel button
   */
  public readonly cancel = output<void>();

  ngOnInit(): void {
    // Prevent closing on backdrop click if configured
    if (this.config?.disableBackdropClick !== false) {
      this.dialogRef.disableClose = true;
    }

    // Handle backdrop click attempts
    this.dialogRef.backdropClick().subscribe(() => {
      if (this.canClose()) {
        this.handleCancel();
      }
    });

    // Handle Escape key
    this.dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' && this.canClose()) {
        this.handleCancel();
      }
    });
  }

  /**
   * Set loading state
   * Call this from parent component to show loading spinner
   *
   * @param loading - Whether dialog is in loading state
   */
  public setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  /**
   * Handle submit button click
   */
  protected handleSubmit(): void {
    if (this.isLoading()) {
      return;
    }
    this.submit.emit();
  }

  /**
   * Handle cancel button click or backdrop/Escape
   */
  protected handleCancel(): void {
    if (this.isLoading()) {
      return;
    }
    this.cancel.emit();
    this.dialogRef.close({ cancelled: true });
  }

  /**
   * Handle close button click (notification type only)
   */
  protected handleClose(): void {
    if (this.isLoading()) {
      return;
    }
    this.dialogRef.close();
  }
}
