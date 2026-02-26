import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new ToastService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add a success toast', () => {
    service.success('Created!');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].message).toBe('Created!');
  });

  it('should add an error toast', () => {
    service.error('Failed!');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should add an info toast', () => {
    service.info('Heads up');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should auto-dismiss after 4 seconds', () => {
    service.success('Gone soon');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('should manually dismiss a toast', () => {
    service.success('Dismissable');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should add an undoable toast with undoFn', () => {
    const undoFn = vi.fn();
    service.undoable('Deleted', undoFn, 5000);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].undoFn).toBe(undoFn);
  });

  it('should auto-dismiss undoable toast after duration', () => {
    service.undoable('Deleted', vi.fn(), 5000);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(0);
  });

  it('should assign incrementing ids', () => {
    service.success('A');
    service.error('B');
    const ids = service.toasts().map((t) => t.id);
    expect(ids[1]).toBeGreaterThan(ids[0]);
  });
});
