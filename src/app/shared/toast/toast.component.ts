import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [TranslocoModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto min-w-[260px] max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm flex items-center gap-3 animate-slide-in"
          [class]="colorClass(toast.type)"
          role="alert">
          <span class="flex-1">{{ toast.message }}</span>
          @if (toast.undoFn) {
            <button
              (click)="onUndo(toast)"
              class="shrink-0 text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">
              {{ 'shared.undo' | transloco }}
            </button>
          }
          <button
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            [attr.aria-label]="'shared.close' | transloco">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(1rem); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slide-in 0.2s ease-out;
    }
  `],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  colorClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  }

  onUndo(toast: { id: number; undoFn?: () => void }): void {
    toast.undoFn?.();
    this.toastService.dismiss(toast.id);
  }
}
