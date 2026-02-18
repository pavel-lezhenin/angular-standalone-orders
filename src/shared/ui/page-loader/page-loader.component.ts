import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Page Loader Component
 *
 * Displays a centered loading spinner with backdrop overlay.
 * Covers the content area (below navbar), not the entire viewport.
 *
 * @example
 * ```html
 * <app-page-loader [isLoading]="isLoading()" />
 * ```
 */
@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (isLoading()) {
      <div class="page-loader-overlay" aria-live="polite" aria-busy="true">
        <mat-spinner [diameter]="diameter()"></mat-spinner>
        <span class="visually-hidden">Loading, please wait...</span>
      </div>
    }
  `,
  styles: `
    .page-loader-overlay {
      position: fixed;
      top: var(--top-bar-height);
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-white-70);
      backdrop-filter: blur(2px);
      z-index: 100;
      pointer-events: all;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoaderComponent {
  /** Loading state */
  readonly isLoading = input<boolean>(false);

  /** Spinner diameter in pixels */
  readonly diameter = input<number>(50);
}
