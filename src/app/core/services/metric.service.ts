import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Metric, NewMetric } from '../../shared/models/metric.model';

@Injectable({ providedIn: 'root' })
export class MetricService {
  private readonly baseUrl = `${environment.apiUrl}/api/metrics`;

  constructor(private readonly http: HttpClient) {}

  getMetrics(category: string, from?: Date, to?: Date): Observable<Metric[]> {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from.toISOString());
    }
    if (to) {
      params = params.set('to', to.toISOString());
    }
    return this.http.get<Metric[]>(`${this.baseUrl}/category/${category}`, { params });
  }

  getLatestMetric(category: string): Observable<Metric> {
    return this.http.get<Metric>(`${this.baseUrl}/category/${category}/latest`);
  }

  getAverage(category: string, from: Date, to: Date): Observable<number> {
    const params = new HttpParams()
      .set('from', from.toISOString())
      .set('to', to.toISOString());
    return this.http.get<number>(`${this.baseUrl}/category/${category}/average`, { params });
  }

  createMetric(metric: NewMetric): Observable<Metric> {
    return this.http.post<Metric>(this.baseUrl, metric);
  }
}
