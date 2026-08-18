import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Metric } from '../../models/metric.model';

type SortColumn = 'name' | 'category' | 'value' | 'recordedAt';
type SortDirection = 'asc' | 'desc';
type Severity = 'success' | 'warning' | 'danger';

interface MetricRow {
  metric: Metric;
  severity: Severity;
  trend: 'up' | 'down' | 'flat';
}

const PAGE_SIZE = 10;

/**
 * Metrics table with search, category filter, sortable columns, pagination,
 * relative-time timestamps, and per-row severity/trend indicators.
 */
@Component({
  selector: 'app-metrics-table',
  templateUrl: './metrics-table.component.html',
})
export class MetricsTableComponent implements OnChanges {
  @Input() metrics: Metric[] = [];
  @Input() loading = false;

  @Output() rowClicked = new EventEmitter<Metric>();

  searchTerm = '';
  selectedCategory = 'all';
  sortColumn: SortColumn = 'recordedAt';
  sortDirection: SortDirection = 'desc';
  currentPage = 1;
  readonly pageSize = PAGE_SIZE;

  categories: string[] = [];
  rows: MetricRow[] = [];
  pagedRows: MetricRow[] = [];

  ngOnChanges(): void {
    this.categories = [...new Set(this.metrics.map((m) => m.category))].sort();
    this.rows = this.buildRows(this.metrics);
    this.currentPage = 1;
    this.applyFilterSortAndPage();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applyFilterSortAndPage();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilterSortAndPage();
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilterSortAndPage();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyFilterSortAndPage();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  trackByMetricId(_index: number, row: MetricRow): number {
    return row.metric.id;
  }

  private filteredRows: MetricRow[] = [];

  private applyFilterSortAndPage(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredRows = this.rows
      .filter((row) => this.selectedCategory === 'all' || row.metric.category === this.selectedCategory)
      .filter((row) => !term || row.metric.name.toLowerCase().includes(term))
      .sort((a, b) => this.compare(a, b));

    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRows = this.filteredRows.slice(start, start + this.pageSize);
  }

  private compare(a: MetricRow, b: MetricRow): number {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    switch (this.sortColumn) {
      case 'name':
        return a.metric.name.localeCompare(b.metric.name) * direction;
      case 'category':
        return a.metric.category.localeCompare(b.metric.category) * direction;
      case 'value':
        return (a.metric.value - b.metric.value) * direction;
      case 'recordedAt':
      default:
        return (new Date(a.metric.recordedAt).getTime() - new Date(b.metric.recordedAt).getTime()) * direction;
    }
  }

  /**
   * Severity/trend are computed relative to each metric name's own readings
   * (not a fixed absolute scale) since different metrics live on very
   * different ranges (a % vs. ms vs. Mbps) — the highest readings of a given
   * metric are colored red, the lowest green, regardless of unit.
   */
  private buildRows(metrics: Metric[]): MetricRow[] {
    const byName = new Map<string, Metric[]>();
    for (const metric of metrics) {
      const group = byName.get(metric.name) ?? [];
      group.push(metric);
      byName.set(metric.name, group);
    }

    const severityById = new Map<number, Severity>();
    const trendById = new Map<number, 'up' | 'down' | 'flat'>();

    for (const group of byName.values()) {
      const values = group.map((m) => m.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;

      const chronological = [...group].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );

      chronological.forEach((metric, index) => {
        const position = (metric.value - min) / range;
        severityById.set(metric.id, position >= 0.66 ? 'danger' : position >= 0.33 ? 'warning' : 'success');

        const previous = chronological[index - 1];
        if (!previous || Math.abs(metric.value - previous.value) < 0.01) {
          trendById.set(metric.id, 'flat');
        } else {
          trendById.set(metric.id, metric.value > previous.value ? 'up' : 'down');
        }
      });
    }

    return metrics.map((metric) => ({
      metric,
      severity: severityById.get(metric.id) ?? 'success',
      trend: trendById.get(metric.id) ?? 'flat',
    }));
  }
}
