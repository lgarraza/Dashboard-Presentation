import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

interface CategoryColorClasses {
  pill: string;
  dot: string;
}

/**
 * Class names are written out literally (not built via string
 * interpolation like `bg-${color}-50`) because Tailwind's JIT compiler
 * only includes classes it can find as literal text during content
 * scanning — a dynamically-assembled class name would silently produce no
 * CSS.
 */
const CATEGORY_COLORS: Record<string, CategoryColorClasses> = {
  System: { pill: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  Application: { pill: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
  Network: { pill: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  Database: { pill: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  Storage: { pill: 'bg-cyan-50 text-cyan-700', dot: 'bg-cyan-500' },
};
const DEFAULT_COLORS: CategoryColorClasses = { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

/**
 * Small colored pill or dot for a metric category. Reused by the metrics
 * table both as a category pill and as a colored dot next to the metric name.
 */
@Component({
  selector: 'app-category-badge',
  templateUrl: './category-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryBadgeComponent implements OnChanges {
  @Input() category = '';
  @Input() variant: 'pill' | 'dot' = 'pill';

  classes: CategoryColorClasses = DEFAULT_COLORS;

  ngOnChanges(): void {
    this.classes = CATEGORY_COLORS[this.category] ?? DEFAULT_COLORS;
  }
}
