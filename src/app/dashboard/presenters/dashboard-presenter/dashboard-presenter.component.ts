import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Metric } from '../../../shared/models/metric.model';
import { FilterState } from '../../../store/metrics/metrics.state';

/**
 * Dumb/presentational component: renders whatever it's given and emits
 * user intents. Holds no store or service references.
 */
@Component({
  selector: 'app-dashboard-presenter',
  templateUrl: './dashboard-presenter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPresenterComponent {
  @Input() metrics: Metric[] = [];
  @Input() kpiMetrics: Metric[] = [];
  @Input() kpiHistory: Record<string, number[]> = {};
  @Input() filters!: FilterState;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() signalrConnected = false;
  @Input() averageValue = 0;

  @Output() filtersChange = new EventEmitter<Partial<FilterState>>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() connectSignalr = new EventEmitter<void>();
  @Output() disconnectSignalr = new EventEmitter<void>();

  onSignalrToggle(): void {
    if (this.signalrConnected) {
      this.disconnectSignalr.emit();
    } else {
      this.connectSignalr.emit();
    }
  }
}
