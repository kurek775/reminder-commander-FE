import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { ConfirmModalComponent } from './confirm-modal.component';
import { ConfirmModalService } from './confirm-modal.service';
import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('ConfirmModalComponent', () => {
  let modalService: ConfirmModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent, translocoTesting],
    }).compileComponents();
    modalService = TestBed.inject(ConfirmModalService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ConfirmModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render when hidden', () => {
    const fixture = TestBed.createComponent(ConfirmModalComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should render when visible', () => {
    modalService.confirm({ title: 'Delete?', message: 'Sure?' });
    const fixture = TestBed.createComponent(ConfirmModalComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Delete?');
    expect(fixture.nativeElement.textContent).toContain('Sure?');
  });

  it('should call cancel on Escape key', () => {
    modalService.confirm({ title: 'T', message: 'M' });
    const fixture = TestBed.createComponent(ConfirmModalComponent);
    fixture.detectChanges();

    fixture.componentInstance.onEscape();
    expect(modalService.visible()).toBe(false);
  });

  it('should apply danger styling when danger is true', () => {
    modalService.confirm({ title: 'T', message: 'M', danger: true });
    const fixture = TestBed.createComponent(ConfirmModalComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const confirmBtn = buttons[buttons.length - 1];
    expect(confirmBtn.className).toContain('bg-red-600');
  });
});
