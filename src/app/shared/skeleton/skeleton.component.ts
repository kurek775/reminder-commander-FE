import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    @for (i of items(); track i) {
      <div class="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm animate-pulse mb-4">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    }
  `,
})
export class SkeletonComponent {
  count = input(3);

  items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
