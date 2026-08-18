import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MetricsState } from './metrics.state';

export const selectMetricsState = createFeatureSelector<MetricsState>('metrics');

export const selectAllMetrics = createSelector(
  selectMetricsState,
  (state) => state.metrics
);

export const selectMetricsLoading = createSelector(
  selectMetricsState,
  (state) => state.loading
);

export const selectMetricsError = createSelector(
  selectMetricsState,
  (state) => state.error
);

export const selectCurrentFilters = createSelector(
  selectMetricsState,
  (state) => state.filters
);

export const selectSignalrConnected = createSelector(
  selectMetricsState,
  (state) => state.signalrConnected
);

/**
 * Metrics narrowed to the currently selected category and date range.
 */
export const selectFilteredMetrics = createSelector(
  selectAllMetrics,
  selectCurrentFilters,
  (metrics, filters) =>
    metrics.filter((metric) => {
      const recordedAt = new Date(metric.recordedAt);
      return (
        metric.category === filters.category &&
        recordedAt >= filters.dateRange.from &&
        recordedAt <= filters.dateRange.to
      );
    })
);

/**
 * Selector factory: average value for a given category, from the cached
 * averages computed on the last successful load for that category.
 */
export const selectAverageForCategory = (category: string) =>
  createSelector(selectMetricsState, (state) => state.average[category] ?? 0);

/**
 * Selector factory: most recently recorded metric for a given metric NAME
 * (e.g. "CPU Usage"), kept up to date by both HTTP loads and SignalR events
 * regardless of which category is currently selected in the filters.
 */
export const selectLatestMetric = (name: string) =>
  createSelector(selectMetricsState, (state) => state.latestMetrics[name]);

/**
 * Selector factory: recent value history for a given metric name, used to
 * draw KPI sparklines. Capped at METRIC_HISTORY_LIMIT entries (see metrics.state.ts).
 */
export const selectMetricHistory = (name: string) =>
  createSelector(selectMetricsState, (state) => state.metricHistory[name] ?? []);
