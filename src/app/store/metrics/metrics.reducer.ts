import { createReducer, on } from '@ngrx/store';
import { Metric } from '../../shared/models/metric.model';
import {
  MetricsApiActions,
  MetricsPageActions,
  MetricsSignalrActions,
} from './metrics.actions';
import { initialFilterState, initialMetricsState, METRIC_HISTORY_LIMIT, MetricsState } from './metrics.state';

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * latestMetrics is keyed by metric NAME (e.g. "CPU Usage"), not category.
 * A category groups several differently-named metrics (System = CPU + Memory
 * + Disk...), so keying by category can't answer "what's the latest CPU
 * value" on its own. Keying by name lets the KPI grid track CPU/Memory/API/
 * Network simultaneously, kept fresh by SignalR pushes regardless of which
 * single category the table/chart filter currently has selected.
 */
function latestByName(metrics: Metric[]): Record<string, Metric> {
  const result: Record<string, Metric> = {};
  for (const metric of metrics) {
    const current = result[metric.name];
    if (!current || new Date(metric.recordedAt) > new Date(current.recordedAt)) {
      result[metric.name] = metric;
    }
  }
  return result;
}

/** Seeds each metric name's history from a chronologically-sorted batch, capped to the last N. */
function historyByName(metrics: Metric[]): Record<string, number[]> {
  const byName = new Map<string, Metric[]>();
  for (const metric of metrics) {
    const group = byName.get(metric.name) ?? [];
    group.push(metric);
    byName.set(metric.name, group);
  }

  const result: Record<string, number[]> = {};
  for (const [name, group] of byName) {
    result[name] = [...group]
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .slice(-METRIC_HISTORY_LIMIT)
      .map((metric) => metric.value);
  }
  return result;
}

function appendHistory(history: Record<string, number[]>, metric: Metric): Record<string, number[]> {
  const existing = history[metric.name] ?? [];
  return {
    ...history,
    [metric.name]: [...existing, metric.value].slice(-METRIC_HISTORY_LIMIT),
  };
}

export const metricsReducer = createReducer(
  initialMetricsState,

  on(MetricsPageActions.loadMetrics, (state): MetricsState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(MetricsApiActions.loadMetricsSuccess, (state, { metrics, category }): MetricsState => ({
    ...state,
    metrics,
    loading: false,
    error: null,
    latestMetrics: { ...state.latestMetrics, ...latestByName(metrics) },
    metricHistory: { ...state.metricHistory, ...historyByName(metrics) },
    average: {
      ...state.average,
      [category]: average(metrics.map((metric) => metric.value)),
    },
  })),

  on(MetricsApiActions.loadMetricsError, (state, { error }): MetricsState => ({
    ...state,
    loading: false,
    error,
  })),

  on(MetricsSignalrActions.receiveMetricFromSignalr, (state, { metric }): MetricsState => ({
    ...state,
    metrics:
      metric.category === state.filters.category
        ? [metric, ...state.metrics]
        : state.metrics,
    latestMetrics: { ...state.latestMetrics, [metric.name]: metric },
    metricHistory: appendHistory(state.metricHistory, metric),
  })),

  on(MetricsSignalrActions.signalrConnected, (state): MetricsState => ({
    ...state,
    signalrConnected: true,
  })),

  on(MetricsSignalrActions.signalrDisconnected, (state): MetricsState => ({
    ...state,
    signalrConnected: false,
  })),

  on(MetricsPageActions.updateFilters, (state, { filters }): MetricsState => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  on(MetricsPageActions.resetFilters, (state): MetricsState => ({
    ...state,
    filters: initialFilterState,
  }))
);
