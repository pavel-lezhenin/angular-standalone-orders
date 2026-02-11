import { signal } from '@angular/core';

/**
 * Base component with common loading state management.
 *
 * Provides:
 * - `isLoading` signal for loading state
 * - `startLoading()` / `stopLoading()` methods
 *
 * @example
 * ```typescript
 * export class MyComponent extends BaseComponent {
 *   async loadData(): Promise<void> {
 *     this.startLoading();
 *     try {
 *       await this.service.getData();
 *     } finally {
 *       this.stopLoading();
 *     }
 *   }
 * }
 * ```
 */
export abstract class BaseComponent {
  /**
   * Loading state signal
   */
  protected readonly isLoading = signal(false);

  /**
   * Set loading state to true
   */
  protected startLoading(): void {
    this.isLoading.set(true);
  }

  /**
   * Set loading state to false
   */
  protected stopLoading(): void {
    this.isLoading.set(false);
  }
}
