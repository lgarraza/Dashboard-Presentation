import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Metric } from '../../shared/models/metric.model';
import { FilterState } from './metrics.state';

/**
 * Actions dispatched by dashboard components (the "page").
 */
export const MetricsPageActions = createActionGroup({
  source: 'Metrics Page',
  events: {
    'Load Metrics': emptyProps(),
    'Update Filters': props<{ filters: Partial<FilterState> }>(),
    'Reset Filters': emptyProps(),
    'Connect Signalr': emptyProps(),
    'Disconnect Signalr': emptyProps(),
  },
});

/**
 * Actions dispatched as a result of MetricService HTTP responses.
 */
export const MetricsApiActions = createActionGroup({
  source: 'Metrics API',
  events: {
    'Load Metrics Success': props<{ metrics: Metric[]; category: string }>(),
    'Load Metrics Error': props<{ error: string }>(),
  },
});

/**
 * Actions dispatched as a result of SignalrService real-time events.
 */
export const MetricsSignalrActions = createActionGroup({
  source: 'Metrics SignalR',
  events: {
    'Receive Metric From Signalr': props<{ metric: Metric }>(),
    'Signalr Connected': emptyProps(),
    'Signalr Disconnected': emptyProps(),
  },
});
