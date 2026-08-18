import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats an ISO date string as "just now" / "2 minutes ago" / "3 hours ago" etc.
 * Pure pipe: re-evaluated whenever Angular re-renders the row (e.g. on new data),
 * not on a timer, which is an acceptable trade-off for a metrics table.
 */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 5) {
      return 'just now';
    }

    const units: [number, string][] = [
      [60, 'second'],
      [60, 'minute'],
      [24, 'hour'],
      [30, 'day'],
      [12, 'month'],
      [Number.MAX_SAFE_INTEGER, 'year'],
    ];

    let value_ = seconds;
    for (const [size, unit] of units) {
      if (value_ < size) {
        const rounded = Math.floor(value_);
        return `${rounded} ${unit}${rounded === 1 ? '' : 's'} ago`;
      }
      value_ /= size;
    }
    return date.toLocaleDateString();
  }
}
