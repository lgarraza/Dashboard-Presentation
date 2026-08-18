import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Pill badge with a pulsing dot for live/connected state. Purely
 * presentational — wrap it in a button if you need it clickable.
 */
@Component({
  selector: 'app-live-badge',
  templateUrl: './live-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveBadgeComponent {
  @Input() active = false;
  @Input() activeLabel = 'Live';
  @Input() inactiveLabel = 'Offline';
}
