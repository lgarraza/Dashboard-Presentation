import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { MetricsEffects } from '../store/metrics/metrics.effects';
import { metricsReducer } from '../store/metrics/metrics.reducer';
import { DashboardContainerComponent } from './containers/dashboard-container/dashboard-container.component';
import { DashboardPresenterComponent } from './presenters/dashboard-presenter/dashboard-presenter.component';

const routes: Routes = [{ path: '', component: DashboardContainerComponent }];

@NgModule({
  declarations: [DashboardContainerComponent, DashboardPresenterComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('metrics', metricsReducer),
    EffectsModule.forFeature([MetricsEffects]),
  ],
})
export class DashboardModule {}
