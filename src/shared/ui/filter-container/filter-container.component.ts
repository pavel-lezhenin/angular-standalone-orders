import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface FilterAction {
  id: string;
  icon: string;
  tooltip?: string;
  ariaLabel: string;
  disabled?: boolean;
}

/**
 * Reusable filter container component with responsive grid layout
 * 
 * Provides:
 * - 4 columns on desktop, 2 on tablet, 1 on mobile
 * - Action buttons with icons (reset, export, etc)
 * - Loading/disabled states
 * - Consistent styling across the application
 * 
 * @example
 * <app-filter-container
 *   [isLoading]="isLoading()"
 *   [actions]="[{ id: 'reset', icon: 'refresh', ariaLabel: 'Reset filters' }]"
 *   (action)="onAction($event)"
 * >
 *   <app-search-input [searchControl]="searchControl" />
 *   <mat-form-field>
 *     <mat-label>Category</mat-label>
 *     <mat-select [formControl]="categoryControl">
 *       <mat-option *ngFor="let cat of categories()" [value]="cat.id">
 *         {{ cat.name }}
 *       </mat-option>
 *     </mat-select>
 *   </mat-form-field>
 * </app-filter-container>
 */
@Component({
  selector: 'app-filter-container',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './filter-container.component.html',
  styleUrl: './filter-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterContainerComponent {
  /**
   * Loading state - disables all actions when true
   */
  readonly isLoading = input<boolean>(false);

  /**
   * Array of action buttons (reset, export, etc)
   */
  readonly actions = input<FilterAction[]>([]);

  /**
   * Emitted when an action button is clicked
   */
  readonly action = output<string>();

  /**
   * Handle action button click
   */
  onActionClick(actionId: string): void {
    this.action.emit(actionId);
  }

  /**
   * Check if action is disabled
   */
  isActionDisabled(filterAction: FilterAction): boolean {
    return this.isLoading() || filterAction.disabled === true;
  }
}
