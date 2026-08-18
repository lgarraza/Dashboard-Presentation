import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MetricsPageActions } from '../../../store/metrics/metrics.actions';
import { FilterState } from '../../../store/metrics/metrics.state';
import {
  selectAverageForCategory,
  selectCurrentFilters,
  selectFilteredMetrics,
  selectLatestMetric,
  selectMetricHistory,
  selectMetricsError,
  selectMetricsLoading,
  selectSignalrConnected,
} from '../../../store/metrics/metrics.selectors';
import { Metric } from '../../../shared/models/metric.model';

/** Metric names the KPI strip always shows, regardless of the active category filter. */
const KPI_METRIC_NAMES = ['CPU Usage', 'Memory Usage', 'API Response Time', 'Network Latency'];

export interface DashboardViewModel {
  metrics: Metric[];
  kpiMetrics: Metric[];
  kpiHistory: Record<string, number[]>;
  filters: FilterState;
  loading: boolean;
  error: string | null;
  signalrConnected: boolean;
  averageValue: number;
}

/**
 * Smart/container component: connects to the store and delegates all
 * rendering to DashboardPresenterComponent.
 */
@Component({
  selector: 'app-dashboard-container',
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
})
export class DashboardContainerComponent implements OnInit, OnDestroy {
  private readonly filters$: Observable<FilterState> = this.store.select(selectCurrentFilters);

  vm$: Observable<DashboardViewModel> = combineLatest({
    metrics: this.store.select(selectFilteredMetrics),
    kpiMetrics: combineLatest(KPI_METRIC_NAMES.map((name) => this.store.select(selectLatestMetric(name)))).pipe(
      map((metrics) => metrics.filter((metric): metric is Metric => metric !== undefined))
    ),
    kpiHistory: combineLatest(
      KPI_METRIC_NAMES.map((name) => this.store.select(selectMetricHistory(name)).pipe(map((history) => [name, history] as const)))
    ).pipe(map((entries) => Object.fromEntries(entries))),
    filters: this.filters$,
    loading: this.store.select(selectMetricsLoading),
    error: this.store.select(selectMetricsError),
    signalrConnected: this.store.select(selectSignalrConnected),
    averageValue: this.filters$.pipe(
      switchMap((filters) => this.store.select(selectAverageForCategory(filters.category)))
    ),
  });

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(MetricsPageActions.loadMetrics());
    this.store.dispatch(MetricsPageActions.connectSignalr());
  }

  ngOnDestroy(): void {
    this.store.dispatch(MetricsPageActions.disconnectSignalr());
  }

  onFiltersChange(filters: Partial<FilterState>): void {
    this.store.dispatch(MetricsPageActions.updateFilters({ filters }));
  }

  onResetFilters(): void {
    this.store.dispatch(MetricsPageActions.resetFilters());
  }

  onConnectSignalr(): void {
    this.store.dispatch(MetricsPageActions.connectSignalr());
  }

  onDisconnectSignalr(): void {
    this.store.dispatch(MetricsPageActions.disconnectSignalr());
  }
}
