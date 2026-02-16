import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Reusable table action buttons component
 * 
 * Provides consistent action buttons for table rows with customizable permissions.
 * Common actions: edit, delete, view
 * 
 * @example
 * <app-table-action-buttons
 *   [canEdit]="true"
 *   [canDelete]="true"
 *   (edit)="onEdit(item)"
 *   (delete)="onDelete(item)"
 * />
 */
@Component({
  selector: 'app-table-action-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './table-action-buttons.component.html',
  styleUrl: './table-action-buttons.component.scss',
})
export class TableActionButtonsComponent {
  /**
   * Whether the edit button should be shown
   * @default true
   */
  readonly canEdit = input<boolean>(true);

  /**
   * Whether the delete button should be shown
   * @default true
   */
  readonly canDelete = input<boolean>(true);

  /**
   * Whether the view button should be shown
   * @default false
   */
  readonly canView = input<boolean>(false);

  /**
   * Edit button icon
   * @default 'edit'
   */
  readonly editIcon = input<string>('edit');

  /**
   * Delete button icon
   * @default 'delete'
   */
  readonly deleteIcon = input<string>('delete');

  /**
   * View button icon
   * @default 'visibility'
   */
  readonly viewIcon = input<string>('visibility');

  /**
   * Edit button tooltip
   * @default 'Edit'
   */
  readonly editTooltip = input<string>('Edit');

  /**
   * Delete button tooltip
   * @default 'Delete'
   */
  readonly deleteTooltip = input<string>('Delete');

  /**
   * View button tooltip
   * @default 'View'
   */
  readonly viewTooltip = input<string>('View');

  /**
   * Edit button aria-label
   */
  readonly editAriaLabel = input<string>('');

  /**
   * Delete button aria-label
   */
  readonly deleteAriaLabel = input<string>('');

  /**
   * View button aria-label
   */
  readonly viewAriaLabel = input<string>('');

  /**
   * Emitted when edit button is clicked
   */
  readonly edit = output<void>();

  /**
   * Emitted when delete button is clicked
   */
  readonly delete = output<void>();

  /**
   * Emitted when view button is clicked
   */
  readonly view = output<void>();
}
