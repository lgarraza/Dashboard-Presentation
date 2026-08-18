import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ScriptableContext } from 'chart.js';
import { Metric } from '../../models/metric.model';

const LINE_COLOR = '#3B82F6';

function areaGradient(context: ScriptableContext<'line'>) {
  const { chart } = context;
  const { ctx, chartArea } = chart;
  if (!chartArea) {
    // Chart hasn't been laid out yet (first paint) — Chart.js will call
    // this again once it has, so a flat fallback here is fine.
    return 'rgba(59, 130, 246, 0.15)';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
  return gradient;
}

/**
 * Time-series area chart built on Chart.js (via ng2-charts). The prompt that
 * originated this component asked for Recharts, but Recharts is a React-only
 * library and can't run inside Angular — Chart.js covers the same requirements
 * (responsive, tooltips, smooth curves, gradient fill) natively in this stack.
 *
 * Animation fix: Chart.js/ng2-charts replay the full entrance animation on
 * every `data` update (each SignalR push reassigns the `data` object), which
 * reads as a jarring flicker rather than a smooth transition. `options` is
 * mutated in place after the first render to disable animation on
 * subsequent updates — ng2-charts hands the same options object reference
 * straight to the underlying Chart.js instance, so mutating it here reaches
 * the live chart without needing a new @Input reference.
 */
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnChanges {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() metrics: Metric[] = [];
  @Input() unit = '';
  @Input() loading = false;

  data: ChartData<'line'> = { labels: [], datasets: [] };
  private hasAnimated = false;

  options: NonNullable<ChartConfiguration<'line'>['options']> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: false,
        grid: { color: '#F3F4F6' },
        ticks: {
          callback: (value) => `${value}${this.unit ? ' ' + this.unit : ''}`,
        },
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue}${this.unit ? ' ' + this.unit : ''}`,
        },
      },
    },
  };

  ngOnChanges(): void {
    // Metrics arrive newest-first from the API; plot chronologically left to right.
    const series = [...this.metrics].reverse();

    this.data = {
      labels: series.map((metric) => new Date(metric.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      datasets: [
        {
          data: series.map((metric) => metric.value),
          label: this.title,
          borderColor: LINE_COLOR,
          backgroundColor: areaGradient,
          pointBackgroundColor: LINE_COLOR,
          tension: 0.4,
          fill: true,
          pointRadius: series.length > 30 ? 0 : 3,
        },
      ],
    };

    // Only the very first render should play the entrance animation;
    // every later update (SignalR pushes) is instant to avoid flicker.
    if (this.hasAnimated) {
      this.options.animation = false;
    } else if (series.length > 0) {
      this.hasAnimated = true;
    }
  }
}
