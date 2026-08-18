import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { CategoryBadgeComponent } from './components/category-badge/category-badge.component';
import { FiltersPanelComponent } from './components/filters-panel/filters-panel.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { LiveBadgeComponent } from './components/live-badge/live-badge.component';
import { MetricsCardsGridComponent } from './components/metrics-cards-grid/metrics-cards-grid.component';
import { MetricsTableComponent } from './components/metrics-table/metrics-table.component';
import { SparklineComponent } from './components/sparkline/sparkline.component';
import { RelativeTimePipe } from './pipes/relative-time.pipe';

@NgModule({
  declarations: [
    KpiCardComponent,
    LineChartComponent,
    BarChartComponent,
    MetricsCardsGridComponent,
    MetricsTableComponent,
    FiltersPanelComponent,
    SparklineComponent,
    LiveBadgeComponent,
    CategoryBadgeComponent,
    RelativeTimePipe,
  ],
  imports: [CommonModule, FormsModule, BaseChartDirective],
  exports: [
    KpiCardComponent,
    LineChartComponent,
    BarChartComponent,
    MetricsCardsGridComponent,
    MetricsTableComponent,
    FiltersPanelComponent,
    SparklineComponent,
    LiveBadgeComponent,
    CategoryBadgeComponent,
    RelativeTimePipe,
  ],
})
export class SharedModule {}
