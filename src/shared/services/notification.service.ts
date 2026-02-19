import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Notification Service
 *
 * Provides application-wide success and error notifications using Material SnackBar
 * Automatically closes after 5 seconds for error messages
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Show success notification
   *
   * @param message - Success message
   * @param duration - Display duration in ms (default: 3000)
   */
  success(message: string, duration: number = 3000): void {
    // Dismiss any existing snackbars first
    this.snackBar.dismiss();

    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Show error notification
   *
   * @param message - Error message
   * @param duration - Display duration in ms (default: 3000)
   */
  error(message: string, duration: number = 3000): void {
    // Dismiss any existing snackbars first
    this.snackBar.dismiss();

    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
