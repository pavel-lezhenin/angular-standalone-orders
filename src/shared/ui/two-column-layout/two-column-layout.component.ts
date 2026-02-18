import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Responsive two-column layout: main content + aside sidebar.
 *
 * Usage:
 * ```html
 * <app-two-column-layout sidebarWidth="var(--checkout-sidebar-width)">
 *   <ng-container main>…main content…</ng-container>
 *   <ng-container aside>…sidebar…</ng-container>
 * </app-two-column-layout>
 * ```
 *
 * Breakpoint behaviour (driven by `:host-context` classes on `<html>`):
 * - **desktop** — CSS grid: `1fr <sidebarWidth>`, columns rigid, no wrap
 * - **tablet**  — flexbox with `flex-wrap`, main has `flex: 999` so it takes
 *                 all available space first; sidebar wraps to a new row only
 *                 when there is not enough room
 * - **mobile**  — single column, both slots full-width
 */
@Component({
  selector: 'app-two-column-layout',
  standalone: true,
  templateUrl: './two-column-layout.component.html',
  styleUrl: './two-column-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoColumnLayoutComponent {
  /** CSS value for the sidebar preferred width, e.g. `var(--checkout-sidebar-width)` */
  readonly sidebarWidth = input<string>('var(--cart-sidebar-width)');
}
