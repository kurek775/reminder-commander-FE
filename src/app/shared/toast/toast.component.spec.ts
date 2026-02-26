import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('ToastComponent', () => {
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent, translocoTesting],
    }).compileComponents();
    toastService = TestBed.inject(ToastService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render toasts from service', () => {
    vi.useFakeTimers();
    toastService.success('Hello');
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello');
    vi.useRealTimers();
  });

  it('should return correct color class for success', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(fixture.componentInstance.colorClass('success')).toContain('green');
  });

  it('should return correct color class for error', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(fixture.componentInstance.colorClass('error')).toContain('red');
  });

  it('should return correct color class for info', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    expect(fixture.componentInstance.colorClass('info')).toContain('blue');
  });

  it('should show undo button for undoable toasts', () => {
    vi.useFakeTimers();
    toastService.undoable('Deleted', vi.fn(), 5000);
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    vi.useRealTimers();
  });

  it('should call undoFn and dismiss on undo click', () => {
    vi.useFakeTimers();
    const undoFn = vi.fn();
    toastService.undoable('Deleted', undoFn, 5000);
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();

    const toast = toastService.toasts()[0];
    fixture.componentInstance.onUndo(toast);
    expect(undoFn).toHaveBeenCalled();
    expect(toastService.toasts().length).toBe(0);
    vi.useRealTimers();
  });
});
