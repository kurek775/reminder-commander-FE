import { Component, HostListener, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { ConfirmModalService } from './confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  imports: [TranslocoModule],
  template: `
    @if (modal.visible()) {
      <div
        class="fixed inset-0 z-[200] flex items-center justify-center"
        role="dialog"
        aria-modal="true">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          (click)="modal.cancel()"></div>

        <!-- Card -->
        <div class="relative bg-gray-900/60 rounded-2xl shadow-2xl border border-white/5 w-full max-w-md mx-4 p-6">
          <h3 class="text-base font-semibold text-gray-100 mb-2">
            {{ modal.options().title }}
          </h3>
          <p class="text-sm text-gray-400 mb-6">
            {{ modal.options().message }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              (click)="modal.cancel()"
              class="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-white/5 transition-colors">
              {{ modal.options().cancelText || ('shared.cancel' | transloco) }}
            </button>
            <button
              (click)="modal.accept()"
              class="px-4 py-2 text-sm font-medium rounded-md text-white transition-colors"
              [class]="modal.options().danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-cyan-500 to-violet-500'">
              {{ modal.options().confirmText || ('shared.confirm' | transloco) }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly modal = inject(ConfirmModalService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modal.visible()) {
      this.modal.cancel();
    }
  }
}
