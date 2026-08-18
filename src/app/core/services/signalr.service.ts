import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Metric } from '../../shared/models/metric.model';

/**
 * Wraps the SignalR hub connection. Expects the API to expose a hub at
 * `/metricsHub` that broadcasts a `ReceiveMetric` message with a Metric payload.
 */
@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly metricsSubject = new Subject<Metric>();

  readonly metrics$: Observable<Metric> = this.metricsSubject.asObservable();

  connect(): Promise<void> {
    if (this.hubConnection) {
      return Promise.resolve();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/metricsHub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on('ReceiveMetric', (metric: Metric) => {
      this.metricsSubject.next(metric);
    });

    return this.hubConnection.start();
  }

  async disconnect(): Promise<void> {
    if (!this.hubConnection) {
      return;
    }
    await this.hubConnection.stop();
    this.hubConnection = null;
  }
}
