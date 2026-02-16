import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CategoryDTO } from '@core';
import { TableActionButtonsComponent } from '@shared/ui';

/**
 * Category table component with pagination and loading state
 *
 * Combines table, paginator, and loading indicator
 * Pure presentational component - emits events to parent for CRUD
 */
@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    TableActionButtonsComponent,
  ],
  templateUrl: './category-table.component.html',
  styleUrl: './category-table.component.scss',
})
export class CategoryTableComponent {
  readonly categories = input.required<CategoryDTO[]>();
  readonly totalCategories = input(0);
  readonly currentPage = input(1);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input([10, 20, 50, 100]);
  readonly canEdit = input(false);
  readonly canDelete = input(false);

  readonly pageChange = output<PageEvent>();
  readonly editClick = output<CategoryDTO>();
  readonly deleteClick = output<CategoryDTO>();

  protected readonly displayedColumns = ['id', 'name', 'description', 'actions'];
}
