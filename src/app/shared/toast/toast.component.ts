import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [TranslocoModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto min-w-[320px] max-w-sm px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md text-sm flex items-center gap-4 animate-fade-up"
          [class]="colorClass(toast.type)"
          role="alert">
          <div class="w-2 h-2 rounded-full shrink-0" [class]="indicatorClass(toast.type)"></div>
          <span class="flex-1 font-medium tracking-tight">{{ toast.message }}</span>
          @if (toast.undoFn) {
            <button
              (click)="onUndo(toast)"
              class="shrink-0 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
              {{ 'shared.undo' | transloco }}
            </button>
          }
          <button
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
            [attr.aria-label]="'shared.close' | transloco">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: ``,
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
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    }
  }

  indicatorClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'error': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
      default: return 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]';
    }
  }

  onUndo(toast: { id: number; undoFn?: () => void }): void {
    toast.undoFn?.();
    this.toastService.dismiss(toast.id);
  }
}
