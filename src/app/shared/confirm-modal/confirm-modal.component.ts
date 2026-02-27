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
        <div class="relative bg-gray-950/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 w-full max-w-md mx-4 p-10 animate-fade-up">
          <h3 class="text-xl font-bold text-gray-100 mb-3 tracking-tight">
            {{ modal.options().title }}
          </h3>
          <p class="text-sm text-gray-500 mb-10 leading-relaxed font-medium">
            {{ modal.options().message }}
          </p>
          <div class="flex flex-col sm:flex-row-reverse justify-end gap-3">
            <button
              (click)="modal.accept()"
              class="px-6 py-3 text-sm font-bold rounded-xl text-white transition-all hover:shadow-lg active:scale-[0.98]"
              [class]="modal.options().danger
                ? 'bg-red-500/80 hover:bg-red-500 shadow-red-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-violet-500 shadow-cyan-500/20'">
              {{ modal.options().confirmText || ('shared.confirm' | transloco) }}
            </button>
            <button
              (click)="modal.cancel()"
              class="px-6 py-3 text-sm font-bold rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
              {{ modal.options().cancelText || ('shared.cancel' | transloco) }}
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
