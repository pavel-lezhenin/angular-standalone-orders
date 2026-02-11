import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

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
   * @param duration - Display duration in ms (default: 5000)
   */
  success(message: string, duration: number = 5000): void {
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
   * @param duration - Display duration in ms (default: 5000)
   */
  error(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
