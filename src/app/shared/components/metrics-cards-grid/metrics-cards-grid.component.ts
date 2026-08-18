import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { KpiColor, KpiIcon } from '../kpi-card/kpi-card.component';
import { Metric } from '../../models/metric.model';

interface KpiCardDef {
  label: string;
  metricName: string;
  icon: KpiIcon;
  color: KpiColor;
  trendGoodDirection: 'up' | 'down';
}

interface KpiCardView extends KpiCardDef {
  metric: Metric | undefined;
  previousValue: number | undefined;
  sparklineData: number[];
}

const CARD_DEFS: KpiCardDef[] = [
  { label: 'CPU Usage', metricName: 'CPU Usage', icon: 'cpu', color: 'blue', trendGoodDirection: 'down' },
  { label: 'Memory Usage', metricName: 'Memory Usage', icon: 'memory', color: 'green', trendGoodDirection: 'down' },
  { label: 'API Response Time', metricName: 'API Response Time', icon: 'clock', color: 'blue', trendGoodDirection: 'down' },
  { label: 'Network Latency', metricName: 'Network Latency', icon: 'globe', color: 'green', trendGoodDirection: 'down' },
];

/**
 * Responsive 1/2/4-column grid of KPI cards for CPU, Memory, API response
 * time and network latency. Picks the latest reading of each by name out of
 * the flat `metrics` input — the metric names above match what
 * RandomMetricsGeneratorService and the sample data seed produce on the API.
 */
@Component({
  selector: 'app-metrics-cards-grid',
  templateUrl: './metrics-cards-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsCardsGridComponent implements OnChanges {
  @Input() metrics: Metric[] = [];
  @Input() history: Record<string, number[]> = {};
  @Input() loading = false;

  @Output() cardClicked = new EventEmitter<Metric>();

  cards: KpiCardView[] = [];

  private readonly lastValueByName = new Map<string, number>();

  ngOnChanges(): void {
    this.cards = CARD_DEFS.map((def) => {
      const metric = this.metrics.find((m) => m.name === def.metricName);
      const previousValue = this.lastValueByName.get(def.metricName);

      if (metric) {
        this.lastValueByName.set(def.metricName, metric.value);
      }

      return { ...def, metric, previousValue, sparklineData: this.history[def.metricName] ?? [] };
    });
  }

  trackByLabel(_index: number, card: KpiCardView): string {
    return card.label;
  }

  onCardClick(metric: Metric | undefined): void {
    if (metric) {
      this.cardClicked.emit(metric);
    }
  }
}
