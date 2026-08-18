import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { MetricService } from '../../core/services/metric.service';
import { SignalrService } from '../../core/services/signalr.service';
import { MetricsApiActions, MetricsPageActions, MetricsSignalrActions } from './metrics.actions';
import { selectCurrentFilters } from './metrics.selectors';

@Injectable()
export class MetricsEffects {
  /**
   * Loads metrics for the currently selected category/date range whenever
   * a LoadMetrics action is dispatched.
   */
  loadMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetricsPageActions.loadMetrics),
      withLatestFrom(this.store.select(selectCurrentFilters)),
      switchMap(([, filters]) =>
        this.metricService.getMetrics(filters.category, filters.dateRange.from, filters.dateRange.to).pipe(
          map((metrics) => MetricsApiActions.loadMetricsSuccess({ metrics, category: filters.category })),
          catchError((error: Error) =>
            of(MetricsApiActions.loadMetricsError({ error: error.message ?? 'Failed to load metrics' }))
          )
        )
      )
    )
  );

  /**
   * Re-triggers LoadMetrics whenever filters change, so the loaded data
   * always matches the active category/date range.
   */
  updateFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetricsPageActions.updateFilters, MetricsPageActions.resetFilters),
      map(() => MetricsPageActions.loadMetrics())
    )
  );

  /**
   * Bridges SignalrService's real-time metric stream into the store.
   */
  receiveSignalr$ = createEffect(() =>
    this.signalrService.metrics$.pipe(
      map((metric) => MetricsSignalrActions.receiveMetricFromSignalr({ metric }))
    )
  );

  connectSignalr$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetricsPageActions.connectSignalr),
      switchMap(() =>
        from(this.signalrService.connect()).pipe(
          map(() => MetricsSignalrActions.signalrConnected()),
          catchError((error: Error) =>
            of(MetricsApiActions.loadMetricsError({ error: error.message ?? 'SignalR connection failed' }))
          )
        )
      )
    )
  );

  disconnectSignalr$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetricsPageActions.disconnectSignalr),
      switchMap(() =>
        from(this.signalrService.disconnect()).pipe(
          map(() => MetricsSignalrActions.signalrDisconnected())
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly metricService: MetricService,
    private readonly signalrService: SignalrService
  ) {}
}
