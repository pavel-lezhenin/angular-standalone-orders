import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

/**
 * Pagination Component
 * Reusable pagination control for lists
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  get pages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1); // Ellipsis marker
    }
    if (current + delta < total - 1) {
      range.push(-1); // Ellipsis marker
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  goToPrevious(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.pageChange.emit(current - 1);
    }
  }

  goToNext(): void {
    const current = this.currentPage();
    if (current < this.totalPages()) {
      this.pageChange.emit(current + 1);
    }
  }
}
