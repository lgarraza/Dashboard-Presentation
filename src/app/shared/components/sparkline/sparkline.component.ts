import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

/**
 * Tiny decorative trend line (~40px) for KPI cards. Deliberately plain
 * inline SVG rather than a Chart.js canvas — instantiating a full chart
 * engine per KPI card for a non-interactive 40px squiggle isn't worth the
 * overhead, and it sidesteps the chart re-animation issue entirely.
 */
@Component({
  selector: 'app-sparkline',
  templateUrl: './sparkline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparklineComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() color = '#3B82F6';
  @Input() height = 40;

  points = '';
  readonly width = 120;

  ngOnChanges(): void {
    if (this.data.length < 2) {
      this.points = '';
      return;
    }

    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    this.points = this.data
      .map((value, index) => {
        const x = (index / (this.data.length - 1)) * this.width;
        const y = this.height - ((value - min) / range) * this.height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
