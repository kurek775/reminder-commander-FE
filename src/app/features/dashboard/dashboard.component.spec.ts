import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { DashboardComponent } from './dashboard.component';
import { DashboardService, DashboardSummary } from './dashboard.service';
import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

const mockSummary: DashboardSummary = {
  health_rules_active: 2,
  warlord_rules_active: 1,
  sheets_connected: 3,
  has_whatsapp: true,
  recent_interactions: 10,
};

describe('DashboardComponent', () => {
  let dashboardService: { getSummary: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dashboardService = { getSummary: vi.fn().mockResolvedValue(mockSummary) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterModule.forRoot([]), translocoTesting],
      providers: [
        { provide: DashboardService, useValue: dashboardService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load and display summary', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dashboardService.getSummary).toHaveBeenCalled();
    expect(fixture.componentInstance.summary()).toEqual(mockSummary);
    expect(fixture.nativeElement.textContent).toContain('3');
    expect(fixture.nativeElement.textContent).toContain('2');
  });

  it('allSetup should return true when all steps complete', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.allSetup()).toBe(true);
  });

  it('allSetup should return false when no whatsapp', async () => {
    dashboardService.getSummary.mockResolvedValue({ ...mockSummary, has_whatsapp: false });
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.allSetup()).toBe(false);
  });

  it('should show setup checklist when not all setup', async () => {
    dashboardService.getSummary.mockResolvedValue({ ...mockSummary, has_whatsapp: false, sheets_connected: 0 });
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Get Started');
  });
});
