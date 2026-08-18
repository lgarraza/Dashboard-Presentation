export type TimeRange = '24h' | '7d' | '30d';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface MetricFilter {
  category: string;
  dateRange: DateRange;
  timeRange: TimeRange;
}
