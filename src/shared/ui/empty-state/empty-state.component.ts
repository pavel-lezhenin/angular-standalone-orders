import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable empty state component
 * 
 * Displays empty state with icon, title, message and optional action button.
 * Used throughout the app when there's no data to display.
 * 
 * @example
 * <app-empty-state
 *   [icon]="'shopping_cart'"
 *   [title]="'Your cart is empty'"
 *   [message]="'Add some products to get started!'"
 *   [actionLabel]="'Continue Shopping'"
 *   [actionIcon]="'store'"
 *   (action)="goToShop()"
 * />
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  /**
   * Icon name (Material icon)
   * @default 'inbox'
   */
  readonly icon = input<string>('inbox');

  /**
   * Main title text
   * @default 'No data'
   */
  readonly title = input<string>('No data');

  /**
   * Descriptive message (optional)
   */
  readonly message = input<string>('');

  /**
   * Action button label (optional)
   */
  readonly actionLabel = input<string>('');

  /**
   * Action button icon (optional)
   */
  readonly actionIcon = input<string>('');

  /**
   * Action button color
   * @default 'primary'
   */
  readonly actionColor = input<'primary' | 'accent' | 'warn'>('primary');

  /**
   * Custom CSS class for the container
   */
  readonly stateClass = input<string>('');

  /**
   * Size variant
   * @default 'default'
   */
  readonly size = input<'small' | 'default' | 'large'>('default');

  /**
   * Emitted when action button is clicked
   */
  readonly action = output<void>();
}
