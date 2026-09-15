import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination-bar',
  imports: [],
  templateUrl: './pagination-bar.html',
  styleUrl: './pagination-bar.scss',
})
export class PaginationBar {
  readonly page = input.required<number>(); // 1-indexed
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();

  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  goToPrevious(): void {
    if (this.page() > 1) this.pageChange.emit(this.page() - 1);
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) this.pageChange.emit(this.page() + 1);
  }
}
