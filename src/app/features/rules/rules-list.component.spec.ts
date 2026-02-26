import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { RulesListComponent } from './rules-list.component';
import { RulesService, TrackerRule } from './rules.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmModalService } from '../../shared/confirm-modal/confirm-modal.service';
import { cronToHuman, parseCron } from '../../shared/cron-utils';
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
    updateRule: ReturnType<typeof vi.fn>;
    deleteRule: ReturnType<typeof vi.fn>;
    getSheetHeaders: ReturnType<typeof vi.fn>;
  };
  let httpClient: { get: ReturnType<typeof vi.fn> };
  let toastService: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; undoable: ReturnType<typeof vi.fn> };
  let confirmModal: { confirm: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    rulesService = {
      getRules: vi.fn().mockResolvedValue([]),
      createRule: vi.fn().mockResolvedValue(mockRule),
      updateRule: vi.fn().mockResolvedValue({ ...mockRule, name: 'Updated Name', cron_schedule: '0 20 * * *' }),
      deleteRule: vi.fn().mockResolvedValue(undefined),
      getSheetHeaders: vi.fn().mockResolvedValue([]),
    };
    httpClient = { get: vi.fn().mockReturnValue(of([])) };
    toastService = { success: vi.fn(), error: vi.fn(), undoable: vi.fn() };
    confirmModal = { confirm: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [RulesListComponent, translocoTesting],
      providers: [
        { provide: RulesService, useValue: rulesService },
        { provide: HttpClient, useValue: httpClient },
        { provide: ToastService, useValue: toastService },
        { provide: ConfirmModalService, useValue: confirmModal },
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

    expect(rulesService.getRules).toHaveBeenCalledWith('health_tracker');
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
    expect(toastService.success).toHaveBeenCalled();
  });

  it('should use confirm modal for delete', async () => {
    confirmModal.confirm.mockResolvedValue(false);
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    await comp.onDeleteRule('rule-1');

    expect(confirmModal.confirm).toHaveBeenCalledWith(expect.objectContaining({ danger: true }));
    // Rule should still be there since we cancelled
    expect(comp.rules().find((r) => r.id === 'rule-1')).toBeTruthy();
  });

  it('should optimistically remove rule on confirmed delete', async () => {
    vi.useFakeTimers();
    confirmModal.confirm.mockResolvedValue(true);
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    const deletePromise = comp.onDeleteRule('rule-1');

    // After confirm resolves, rule should be removed optimistically
    await Promise.resolve();
    await Promise.resolve();
    expect(comp.rules().find((r) => r.id === 'rule-1')).toBeUndefined();
    expect(toastService.undoable).toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    await deletePromise;
    expect(rulesService.deleteRule).toHaveBeenCalledWith('rule-1');
    vi.useRealTimers();
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
    expect(cronToHuman('0 8 * * *')).toBe('Daily at 08:00');
    expect(cronToHuman('0 8 * * 1')).toBe('Every Monday at 08:00');
    expect(cronToHuman('0 */3 * * *')).toBe('Every 3 hours');
    expect(cronToHuman('something custom')).toBe('something custom');
  });

  it('parseCron should parse daily cron correctly', () => {
    const result = parseCron('0 8 * * *');
    expect(result.type).toBe('daily');
    expect(result.hour).toBe(8);
  });

  it('parseCron should parse weekly cron correctly', () => {
    const result = parseCron('0 9 * * 3');
    expect(result.type).toBe('weekly');
    expect(result.hour).toBe(9);
    expect(result.day).toBe(3);
  });

  it('parseCron should parse hourly cron correctly', () => {
    const result = parseCron('0 */4 * * *');
    expect(result.type).toBe('hourly');
    expect(result.interval).toBe(4);
  });

  it('onEditRule should populate editing signals', async () => {
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    comp.onEditRule(mockRule);

    expect(comp.editingRuleId()).toBe('rule-1');
    expect(comp.editingName()).toBe('Morning Check-in');
    expect(comp.editingPromptText()).toBe('How are you feeling today?');
    expect(comp.editingScheduleType()).toBe('daily');
    expect(comp.editingScheduleHour()).toBe(8);
  });

  it('onCancelEdit should clear editing state', () => {
    const fixture = TestBed.createComponent(RulesListComponent);
    const comp = fixture.componentInstance;
    comp.editingRuleId.set('rule-1');
    comp.onCancelEdit();
    expect(comp.editingRuleId()).toBeNull();
  });

  it('onSaveEdit should call updateRule and update the list', async () => {
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    comp.onEditRule(mockRule);
    comp.editingName.set('Updated Name');
    comp.editingScheduleHour.set(20);

    await comp.onSaveEdit('rule-1');

    expect(rulesService.updateRule).toHaveBeenCalledWith('rule-1', {
      name: 'Updated Name',
      cron_schedule: '0 20 * * *',
      prompt_text: 'How are you feeling today?',
    });
    expect(comp.editingRuleId()).toBeNull();
    expect(comp.rules().find((r) => r.id === 'rule-1')?.name).toBe('Updated Name');
    expect(toastService.success).toHaveBeenCalled();
  });

  it('onToggleActive should toggle is_active and show toast', async () => {
    const pausedRule = { ...mockRule, is_active: false };
    rulesService.updateRule.mockResolvedValue(pausedRule);
    rulesService.getRules.mockResolvedValue([mockRule]);
    const fixture = TestBed.createComponent(RulesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    await fixture.componentInstance.onToggleActive(mockRule);
    expect(rulesService.updateRule).toHaveBeenCalledWith('rule-1', { is_active: false });
    expect(toastService.success).toHaveBeenCalled();
  });
});
