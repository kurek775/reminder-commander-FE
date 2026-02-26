import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  undoFn?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.add({ type: 'success', message });
  }

  error(message: string): void {
    this.add({ type: 'error', message });
  }

  info(message: string): void {
    this.add({ type: 'info', message });
  }

  undoable(message: string, undoFn: () => void, durationMs = 5000): void {
    const id = this.nextId++;
    const toast: Toast = { id, type: 'info', message, undoFn };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private add(partial: Omit<Toast, 'id'>): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { ...partial, id }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
