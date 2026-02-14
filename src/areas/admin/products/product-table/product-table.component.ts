import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProductDTO, ProductWithCategoryDTO } from '@core';

/**
 * Product table component with pagination and loading state
 *
 * Combines table, paginator, and loading indicator
 * Pure presentational component - emits events to parent for CRUD
 */
@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatPaginatorModule,
  ],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss',
})
export class ProductTableComponent {
  readonly products = input.required<ProductWithCategoryDTO[]>();
  readonly totalProducts = input(0);
  readonly currentPage = input(1);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input([10, 20, 50, 100]);
  readonly canEdit = input(false);
  readonly canDelete = input(false);

  readonly pageChange = output<PageEvent>();
  readonly editClick = output<ProductDTO>();
  readonly deleteClick = output<ProductDTO>();

  protected readonly displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'actions'];

  protected getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'badge-danger';
    if (stock <= 10) return 'badge-warning';
    return 'badge-success';
  }

  protected getStockLabel(stock: number): string {
    if (stock === 0) return 'Out of stock';
    if (stock <= 10) return `Low: ${stock}`;
    return `In stock: ${stock}`;
  }
}
