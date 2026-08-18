import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeRange } from '../../models/filter.model';
import { FilterState } from '../../../store/metrics/metrics.state';

@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersPanelComponent {
  @Input() filters!: FilterState;
  @Input() categories: string[] = ['System', 'Application', 'Network', 'Database'];

  @Output() filtersChange = new EventEmitter<Partial<FilterState>>();
  @Output() reset = new EventEmitter<void>();

  readonly timeRanges: TimeRange[] = ['24h', '7d', '30d'];

  onCategoryChange(category: string): void {
    this.filtersChange.emit({ category });
  }

  onTimeRangeChange(timeRange: TimeRange): void {
    this.filtersChange.emit({ timeRange, dateRange: this.dateRangeFor(timeRange) });
  }

  onReset(): void {
    this.reset.emit();
  }

  private dateRangeFor(timeRange: TimeRange): { from: Date; to: Date } {
    const to = new Date();
    const hours = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30 }[timeRange];
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
    return { from, to };
  }
}
