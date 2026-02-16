import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserDTO } from '@core';
import { UserRole } from '@core/types';
import { formatDate } from '@shared/utils';
import { TableActionButtonsComponent } from '@shared/ui';

/**
 * Customer table component with pagination and loading state
 *
 * Combines table, paginator, and loading indicator
 * Pure presentational component - emits events to parent for CRUD
 */
@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatPaginatorModule,
    TableActionButtonsComponent,
  ],
  templateUrl: './customer-table.component.html',
  styleUrl: './customer-table.component.scss',
})
export class CustomerTableComponent {
  readonly users = input.required<UserDTO[]>();
  readonly totalUsers = input(0);
  readonly currentPage = input(1);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input([10, 20, 50, 100]);
  readonly canEdit = input(false);
  readonly canDelete = input(false);

  readonly pageChange = output<PageEvent>();
  readonly editClick = output<UserDTO>();
  readonly deleteClick = output<UserDTO>();

  protected readonly displayedColumns = ['email', 'role', 'profile', 'createdAt', 'actions'];

  protected formatDate(timestamp: Date | number): string {
    return formatDate(timestamp);
  }

  protected getRoleBadgeClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      admin: 'badge-admin',
      manager: 'badge-manager',
      user: 'badge-user',
    };
    return classes[role] || '';
  }
}
