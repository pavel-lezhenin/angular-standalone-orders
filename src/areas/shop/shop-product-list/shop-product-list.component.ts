import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ProductWithCategoryDTO } from '@core';
import { ProductCardComponent } from '@shared/ui/product-card/product-card.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { EmptyStateComponent } from '@shared/ui';

/**
 * Shop product list component (presentational)
 *
 * Displays products grid with pagination
 * Emits events to parent for navigation and cart actions
 */
@Component({
  selector: 'app-shop-product-list',
  standalone: true,
  imports: [
    ProductCardComponent,
    PaginationComponent,
    EmptyStateComponent,
  ],
  templateUrl: './shop-product-list.component.html',
  styleUrl: './shop-product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopProductListComponent {
  readonly products = input.required<ProductWithCategoryDTO[]>();
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly productClick = output<string>();
  readonly addToCart = output<ProductWithCategoryDTO>();
  readonly pageChange = output<number>();
}
