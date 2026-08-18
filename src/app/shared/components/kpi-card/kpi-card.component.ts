import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Metric } from '../../models/metric.model';

export type KpiIcon = 'cpu' | 'memory' | 'clock' | 'globe';
export type KpiColor = 'blue' | 'green' | 'purple' | 'orange';
export type KpiTrend = 'up' | 'down' | 'flat';

const TWEEN_DURATION_MS = 600;

/**
 * Class names are written out literally per color (not built via
 * `bg-${color}-50` string interpolation) so Tailwind's JIT content scanner
 * can find them — a dynamically-assembled class name produces no CSS.
 */
const ICON_COLOR_CLASSES: Record<KpiColor, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

/**
 * KPI summary card in the Vercel/Linear-style redesign: icon + label,
 * large animated value, a trend arrow colored by whether the change is an
 * improvement (not by absolute value thresholds — the previous design's
 * approach), and a sparkline of recent readings.
 */
@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent implements OnChanges, OnDestroy {
  @Input() label = '';
  @Input() metric: Metric | undefined;
  @Input() previousValue: number | undefined;
  @Input() loading = false;
  @Input() icon: KpiIcon = 'cpu';
  @Input() color: KpiColor = 'blue';
  @Input() sparklineData: number[] = [];
  /** Which direction counts as "improvement" for this metric — most resource/latency metrics are lower-is-better. */
  @Input() trendGoodDirection: 'up' | 'down' = 'down';

  displayValue = 0;

  private animationFrame: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metric']) {
      const next = this.metric?.value ?? 0;
      this.animateTo(next);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  get iconColorClasses(): string {
    return ICON_COLOR_CLASSES[this.color];
  }

  get sparklineColor(): string {
    switch (this.color) {
      case 'green':
        return '#10B981';
      case 'purple':
        return '#8B5CF6';
      case 'orange':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  }

  get trend(): KpiTrend {
    if (this.previousValue === undefined || !this.metric) {
      return 'flat';
    }
    const delta = this.metric.value - this.previousValue;
    if (Math.abs(delta) < 0.01) {
      return 'flat';
    }
    return delta > 0 ? 'up' : 'down';
  }

  get trendPercent(): number | null {
    if (this.previousValue === undefined || !this.metric || this.previousValue === 0) {
      return null;
    }
    return ((this.metric.value - this.previousValue) / this.previousValue) * 100;
  }

  get trendColorClass(): string {
    if (this.trend === 'flat') {
      return 'text-muted';
    }
    return this.trend === this.trendGoodDirection ? 'text-success' : 'text-danger';
  }

  private animateTo(target: number): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }

    const start = this.displayValue;
    const delta = target - start;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / TWEEN_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValue = start + delta * eased;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      } else {
        this.displayValue = target;
        this.animationFrame = null;
      }
    };

    this.animationFrame = requestAnimationFrame(step);
  }
}
