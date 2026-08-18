import { Metric } from '../../shared/models/metric.model';
import { TimeRange } from '../../shared/models/filter.model';

export interface FilterState {
  category: string;
  dateRange: { from: Date; to: Date };
  timeRange: TimeRange;
}

export interface MetricsState {
  metrics: Metric[];
  latestMetrics: { [key: string]: Metric };
  /** Rolling window of recent values per metric name, capped at METRIC_HISTORY_LIMIT, used for KPI sparklines. */
  metricHistory: { [key: string]: number[] };
  average: { [key: string]: number };
  loading: boolean;
  error: string | null;
  filters: FilterState;
  signalrConnected: boolean;
}

export const METRIC_HISTORY_LIMIT = 20;

export interface AppState {
  metrics: MetricsState;
}

function last24Hours(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return { from, to };
}

export const initialFilterState: FilterState = {
  category: 'System',
  dateRange: last24Hours(),
  timeRange: '24h',
};

export const initialMetricsState: MetricsState = {
  metrics: [],
  latestMetrics: {},
  metricHistory: {},
  average: {},
  loading: false,
  error: null,
  filters: initialFilterState,
  signalrConnected: false,
};
