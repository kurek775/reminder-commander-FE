import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { RulesListComponent } from './rules-list.component';
import { RulesService, TrackerRule } from './rules.service';
import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

const mockRule: TrackerRule = {
  id: 'rule-1',
  user_id: 'user-1',
  sheet_integration_id: 'sheet-1',
  name: 'Morning Check-in',
  rule_type: 'health_tracker',
  cron_schedule: '0 8 * * *',
  target_column: 'B',
  metric_name: 'Weight (kg)',
  prompt_text: 'How are you feeling today?',
  is_active: true,
  created_at: '2024-01-01T08:00:00Z',
  updated_at: '2024-01-01T08:00:00Z',
};

describe('RulesListComponent', () => {
  let rulesService: {
    getRules: ReturnType<typeof vi.fn>;
    createRule: ReturnType<typeof vi.fn>;
    deleteRule: ReturnType<typeof vi.fn>;
    getSheetHeaders: ReturnType<typeof vi.fn>;
  };
  let httpClient: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    rulesService = {
      getRules: vi.fn().mockResolvedValue([]),
      createRule: vi.fn().mockResolvedValue(mockRule),
      deleteRule: vi.fn().mockResolvedValue(undefined),
      getSheetHeaders: vi.fn().mockResolvedValue([]),
    };
    httpClient = { get: vi.fn().mockReturnValue(of([])) };

    await TestBed.configureTestingModule({
      imports: [RulesListComponent, translocoTesting],
      providers: [
        { provide: RulesService, useValue: rulesService },
        { provide: HttpClient, useValue: httpClient },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load and display rules on init', async () => {
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.rules()).toEqual([mockRule]);
    expect(fixture.nativeElement.textContent).toContain('Morning Check-in');
  });

  it('should show form when addRule button clicked', async () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.showForm()).toBe(false);
    fixture.componentInstance.toggleForm();
    fixture.detectChanges();
    expect(fixture.componentInstance.showForm()).toBe(true);
  });

  it('isFormValid should be false with empty fields', async () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    comp.formName.set('');
    comp.formSheetId.set('');
    comp.formMetric.set('');
    comp.formPromptText.set('');
    expect(comp.isFormValid()).toBe(false);
  });

  it('isFormValid should be true when all fields filled', async () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    comp.formName.set('My Rule');
    comp.formSheetId.set('sheet-1');
    comp.sheetHeaders.set([{ column: 'B', name: 'Weight (kg)' }]);
    comp.formMetric.set('Weight (kg)');
    comp.formPromptText.set('How do you feel?');
    expect(comp.isFormValid()).toBe(true);
  });

  it('should call createRule and add to list', async () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    comp.formName.set('Morning Check-in');
    comp.formSheetId.set('sheet-1');
    comp.sheetHeaders.set([{ column: 'B', name: 'Weight (kg)' }]);
    comp.formMetric.set('Weight (kg)');
    comp.formPromptText.set('How are you feeling today?');

    await comp.onCreateRule();

    expect(rulesService.createRule).toHaveBeenCalledWith({
      sheet_integration_id: 'sheet-1',
      name: 'Morning Check-in',
      rule_type: 'health_tracker',
      cron_schedule: '0 8 * * *',
      target_column: 'B',
      metric_name: 'Weight (kg)',
      prompt_text: 'How are you feeling today?',
      is_active: true,
    });
    expect(comp.rules()).toContainEqual(mockRule);
  });

  it('should call deleteRule and remove from list', async () => {
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    await comp.onDeleteRule('rule-1');

    expect(rulesService.deleteRule).toHaveBeenCalledWith('rule-1');
    expect(comp.rules().find((r) => r.id === 'rule-1')).toBeUndefined();
  });

  it('scheduleType change updates cronExpression', () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    const comp = fixture.componentInstance;

    // Default: daily at hour 8
    expect(comp.cronExpression()).toBe('0 8 * * *');

    // Switch to weekly, day 1 (Monday)
    comp.scheduleType.set('weekly');
    comp.scheduleDay.set(1);
    expect(comp.cronExpression()).toBe('0 8 * * 1');

    // Switch to hourly, interval 3
    comp.scheduleType.set('hourly');
    comp.scheduleInterval.set(3);
    expect(comp.cronExpression()).toBe('0 */3 * * *');
  });

  it('cronToHuman converts cron to readable string', () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    const comp = fixture.componentInstance;

    expect(comp.cronToHuman('0 8 * * *')).toBe('Daily at 08:00');
    expect(comp.cronToHuman('0 8 * * 1')).toBe('Every Monday at 08:00');
    expect(comp.cronToHuman('0 */3 * * *')).toBe('Every 3 hours');
    expect(comp.cronToHuman('something custom')).toBe('something custom');
  });
});
