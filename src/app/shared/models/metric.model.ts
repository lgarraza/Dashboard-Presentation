export interface Metric {
  id: number;
  name: string;
  category: string;
  value: number;
  unit: string;
  recordedAt: string;
  description?: string | null;
}

export type NewMetric = Omit<Metric, 'id' | 'recordedAt'>;
