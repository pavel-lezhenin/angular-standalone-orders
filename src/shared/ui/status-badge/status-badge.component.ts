import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

/**
 * Status badge variant types
 */
export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Reusable status badge component
 *
 * Displays status indicators with consistent styling across the application.
 * Used for order statuses, stock levels, user roles, and other categorical states.
 *
 * @example
 * <app-status-badge
 *   [label]="'In Stock'"
 *   [variant]="'success'"
 *   [icon]="'check_circle'"
 * />
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  /**
   * Badge label text
   */
  readonly label = input.required<string>();

  /**
   * Visual variant for semantic styling
   * @default 'neutral'
   */
  readonly variant = input<StatusBadgeVariant>('neutral');

  /**
   * Optional icon name (Material Icons)
   */
  readonly icon = input<string>('');

  /**
   * Size variant
   * @default 'default'
   */
  readonly size = input<'small' | 'default' | 'large'>('default');
}
