import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Container wrapper for landing sections
 */
@Component({
  selector: 'app-section-wrapper',
  standalone: true,
  template: `<div class="container"><ng-content /></div>`,
  styles: [
    `
      .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem;
      }

      :host-context(.mobile) .container {
        padding: 0 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionWrapperComponent {}
