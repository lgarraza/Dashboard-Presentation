import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Metric } from '../../models/metric.model';

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];

/**
 * Compares the latest reading of each distinct metric name in the given
 * array as separate colored bars (one dataset per metric so Chart.js's
 * legend shows one labeled swatch per bar). Built on Chart.js — see the
 * note in line-chart.component.ts about why not Recharts.
 *
 * Animation fix: see the note in line-chart.component.ts — `options` is
 * mutated in place to disable animation after the first render so SignalR
 * updates don't replay the bar entrance animation.
 */
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnChanges {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() metrics: Metric[] = [];
  @Input() loading = false;

  data: ChartData<'bar'> = { labels: [], datasets: [] };
  private unitsByName: Record<string, string> = {};
  private hasAnimated = false;

  options: NonNullable<ChartConfiguration<'bar'>['options']> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
    },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const unit = this.unitsByName[context.dataset.label ?? ''] ?? '';
            return `${context.dataset.label}: ${context.formattedValue}${unit ? ' ' + unit : ''}`;
          },
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#1F2937',
        font: { weight: 'bold', size: 11 },
        formatter: (value: number, context) => {
          const unit = this.unitsByName[context.dataset.label ?? ''] ?? '';
          return `${value.toFixed(1)}${unit}`;
        },
      },
    },
  };

  ngOnChanges(): void {
    const latestByName = new Map<string, Metric>();
    for (const metric of this.metrics) {
      const current = latestByName.get(metric.name);
      if (!current || new Date(metric.recordedAt) > new Date(current.recordedAt)) {
        latestByName.set(metric.name, metric);
      }
    }

    const entries = [...latestByName.values()];
    this.unitsByName = Object.fromEntries(entries.map((metric) => [metric.name, metric.unit]));

    this.data = {
      labels: ['Latest reading'],
      datasets: entries.map((metric, index) => ({
        label: metric.name,
        data: [metric.value],
        backgroundColor: PALETTE[index % PALETTE.length],
        borderRadius: 6,
        maxBarThickness: 56,
      })),
    };

    // Only the very first render should play the entrance animation;
    // every later update (SignalR pushes) is instant to avoid flicker.
    if (this.hasAnimated) {
      this.options.animation = false;
    } else if (entries.length > 0) {
      this.hasAnimated = true;
    }
  }
}
