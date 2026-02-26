import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';

import { WarlordComponent } from './warlord.component';
import { WarlordService } from './warlord.service';
import { TrackerRule } from '../rules/rules.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmModalService } from '../../shared/confirm-modal/confirm-modal.service';

import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

const mockRule: TrackerRule = {
  id: 'rule-1',
  user_id: 'user-1',
  sheet_integration_id: 'sheet-1',
  name: 'Warlord Rule',
  rule_type: 'warlord',
  cron_schedule: '0 9 * * *',
  target_column: 'A',
  metric_name: null,
  prompt_text: 'Call about {task_name}',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/** Allow microtasks (Promise callbacks) to settle */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

let toastService: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; undoable: ReturnType<typeof vi.fn> };
let confirmModal: { confirm: ReturnType<typeof vi.fn> };

function buildTestingModule() {
  toastService = { success: vi.fn(), error: vi.fn(), undoable: vi.fn() };
  confirmModal = { confirm: vi.fn().mockResolvedValue(true) };

  return TestBed.configureTestingModule({
    imports: [
      WarlordComponent,
      TranslocoTestingModule.forRoot({ langs: { en, cs }, preloadLangs: true }),
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      WarlordService,
      { provide: ToastService, useValue: toastService },
      { provide: ConfirmModalService, useValue: confirmModal },
    ],
  });
}

/** Flush the 3 initial HTTP requests from ngOnInit/loadAll and wait for promises to settle */
async function initComponent(
  fixture: ComponentFixture<WarlordComponent>,
  http: HttpTestingController,
  rules: TrackerRule[] = [],
) {
  fixture.detectChanges();
  http.expectOne((req) => req.url.includes('/rules/') && req.params.get('rule_type') === 'warlord').flush(rules);
  http.expectOne((req) => req.url.includes('/sheets/')).flush([]);
  http.expectOne((req) => req.url.includes('/interactions/')).flush([]);
  await tick();
}

describe('WarlordComponent', () => {
  let fixture: ComponentFixture<WarlordComponent>;
  let component: WarlordComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    buildTestingModule();
    fixture = TestBed.createComponent(WarlordComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', async () => {
    await initComponent(fixture, http);
    expect(component).toBeTruthy();
  });

  it('should initialise with empty rules and logs', async () => {
    await initComponent(fixture, http);
    expect(component.rules()).toEqual([]);
    expect(component.logs()).toEqual([]);
  });

  it('isFormValid should be false when fields are empty', () => {
    expect(component.isFormValid()).toBe(false);
  });

  it('isFormValid should be true when name and sheet are set', () => {
    component.formName.set('My Rule');
    component.formSheetId.set('sheet-uuid');
    expect(component.isFormValid()).toBe(true);
  });

  it('cronExpression should generate correct daily cron', () => {
    component.scheduleType.set('daily');
    component.scheduleHour.set(9);
    expect(component.cronExpression()).toBe('0 9 * * *');
  });

  it('showForm should toggle on toggleForm()', () => {
    expect(component.showForm()).toBe(false);
    component.toggleForm();
    expect(component.showForm()).toBe(true);
    component.toggleForm();
    expect(component.showForm()).toBe(false);
  });

  describe('onCreateRule', () => {
    it('should create a rule and add it to the list', async () => {
      await initComponent(fixture, http);
      expect(component.isLoading()).toBe(false);

      component.formName.set('New Rule');
      component.formSheetId.set('sheet-1');
      component.formPromptText.set('Call about {task_name}');
      component.showForm.set(true);

      const createPromise = component.onCreateRule();
      await tick();

      const req = http.expectOne((r) => r.method === 'POST' && r.url.includes('/rules/'));
      expect(req.request.body).toEqual(expect.objectContaining({
        name: 'New Rule',
        sheet_integration_id: 'sheet-1',
        rule_type: 'warlord',
      }));
      req.flush(mockRule);

      await createPromise;

      expect(component.rules()).toEqual([mockRule]);
      expect(component.showForm()).toBe(false);
      expect(component.formName()).toBe('');
      expect(component.formSheetId()).toBe('');
      expect(component.isLoading()).toBe(false);
      expect(toastService.success).toHaveBeenCalled();
    });

    it('should not create a rule when form is invalid', async () => {
      await initComponent(fixture, http);
      await component.onCreateRule();
      expect(component.rules()).toEqual([]);
    });

    it('should show toast error on failure', async () => {
      await initComponent(fixture, http);

      component.formName.set('New Rule');
      component.formSheetId.set('sheet-1');

      const createPromise = component.onCreateRule();
      await tick();

      const req = http.expectOne((r) => r.method === 'POST' && r.url.includes('/rules/'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      await createPromise;

      expect(toastService.error).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('onDeleteRule', () => {
    it('should use confirm modal for delete', async () => {
      await initComponent(fixture, http, [mockRule]);
      confirmModal.confirm.mockResolvedValue(false);

      await component.onDeleteRule('rule-1');

      expect(confirmModal.confirm).toHaveBeenCalledWith(expect.objectContaining({ danger: true }));
      expect(component.rules().length).toBe(1);
    });

    it('should optimistically remove rule and show undoable toast', async () => {
      await initComponent(fixture, http, [mockRule]);
      vi.useFakeTimers();

      const deletePromise = component.onDeleteRule('rule-1');
      // Let confirm promise resolve
      await vi.advanceTimersByTimeAsync(0);

      expect(component.rules().find((r) => r.id === 'rule-1')).toBeUndefined();
      expect(toastService.undoable).toHaveBeenCalled();

      // Advance past the 5s undo window
      await vi.advanceTimersByTimeAsync(5000);

      const req = http.expectOne((r) => r.method === 'DELETE' && r.url.includes('/rules/rule-1'));
      req.flush(null);

      await vi.advanceTimersByTimeAsync(0);
      await deletePromise;
      expect(component.rules()).toEqual([]);
      vi.useRealTimers();
    });

    it('should restore rule on delete failure', async () => {
      await initComponent(fixture, http, [mockRule]);
      vi.useFakeTimers();

      const deletePromise = component.onDeleteRule('rule-1');
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(5000);

      const req = http.expectOne((r) => r.method === 'DELETE' && r.url.includes('/rules/rule-1'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      await vi.advanceTimersByTimeAsync(0);
      await deletePromise;

      expect(toastService.error).toHaveBeenCalled();
      expect(component.rules().length).toBe(1);
      vi.useRealTimers();
    });
  });

  describe('onTrigger', () => {
    it('should trigger scan and show toast', async () => {
      await initComponent(fixture, http);
      vi.useFakeTimers();

      const triggerPromise = component.onTrigger();
      await vi.advanceTimersByTimeAsync(0);

      const req = http.expectOne((r) => r.method === 'POST' && r.url.includes('/warlord/trigger'));
      req.flush(null);

      await vi.advanceTimersByTimeAsync(0);
      await triggerPromise;

      expect(component.triggerMessage()).toBe('warlord.triggered');
      expect(component.isTriggering()).toBe(false);
      expect(toastService.success).toHaveBeenCalled();

      // Advance past the 5s loadLogs timeout and flush
      await vi.advanceTimersByTimeAsync(5000);
      const logsReq = http.expectOne((r) => r.url.includes('/interactions/'));
      logsReq.flush([]);
      await vi.advanceTimersByTimeAsync(0);

      vi.useRealTimers();
    });

    it('should show toast error on trigger failure', async () => {
      await initComponent(fixture, http);
      vi.useFakeTimers();

      const triggerPromise = component.onTrigger();
      await vi.advanceTimersByTimeAsync(0);

      const req = http.expectOne((r) => r.method === 'POST' && r.url.includes('/warlord/trigger'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      await vi.advanceTimersByTimeAsync(0);
      await triggerPromise;

      expect(component.triggerMessage()).toBe('warlord.triggerFailed');
      expect(component.isTriggering()).toBe(false);
      expect(toastService.error).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('onEditRule', () => {
    it('should populate editing signals from a rule', () => {
      component.onEditRule(mockRule);

      expect(component.editingRuleId()).toBe('rule-1');
      expect(component.editingName()).toBe('Warlord Rule');
      expect(component.editingPromptText()).toBe('Call about {task_name}');
      expect(component.editingScheduleType()).toBe('daily');
      expect(component.editingScheduleHour()).toBe(9);
    });

    it('should parse weekly cron schedule correctly', () => {
      const weeklyRule = { ...mockRule, cron_schedule: '0 10 * * 3' };
      component.onEditRule(weeklyRule);

      expect(component.editingScheduleType()).toBe('weekly');
      expect(component.editingScheduleHour()).toBe(10);
      expect(component.editingScheduleDay()).toBe(3);
    });

    it('should handle null prompt_text', () => {
      const ruleWithNullPrompt = { ...mockRule, prompt_text: null as unknown as string };
      component.onEditRule(ruleWithNullPrompt);
      expect(component.editingPromptText()).toBe('');
    });
  });

  describe('onSaveEdit', () => {
    it('should save edit and update the rule in the list', async () => {
      await initComponent(fixture, http, [mockRule]);
      vi.useFakeTimers();

      component.onEditRule(mockRule);
      component.editingName.set('Updated Name');

      const savePromise = component.onSaveEdit('rule-1');
      await vi.advanceTimersByTimeAsync(0);

      const req = http.expectOne((r) => r.method === 'PATCH' && r.url.includes('/rules/rule-1'));
      const updatedRule = { ...mockRule, name: 'Updated Name' };
      req.flush(updatedRule);

      await vi.advanceTimersByTimeAsync(0);
      await savePromise;

      expect(component.rules()[0].name).toBe('Updated Name');
      expect(component.editingRuleId()).toBeNull();
      expect(toastService.success).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should show toast error on save failure', async () => {
      await initComponent(fixture, http, [mockRule]);
      vi.useFakeTimers();

      component.onEditRule(mockRule);
      component.editingName.set('Updated Name');

      const savePromise = component.onSaveEdit('rule-1');
      await vi.advanceTimersByTimeAsync(0);

      const req = http.expectOne((r) => r.method === 'PATCH' && r.url.includes('/rules/rule-1'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      await vi.advanceTimersByTimeAsync(0);
      await savePromise;

      expect(toastService.error).toHaveBeenCalled();
      expect(component.editingRuleId()).toBe('rule-1');
      vi.useRealTimers();
    });
  });

  describe('onCancelEdit', () => {
    it('should clear editingRuleId', () => {
      component.onEditRule(mockRule);
      expect(component.editingRuleId()).toBe('rule-1');

      component.onCancelEdit();
      expect(component.editingRuleId()).toBeNull();
    });
  });

  describe('insertPlaceholder', () => {
    it('should append placeholder to formPromptText', () => {
      component.formPromptText.set('Hello ');
      component.insertPlaceholder('{task_name}');
      expect(component.formPromptText()).toBe('Hello {task_name}');
    });

    it('should append placeholder to editingPromptText', () => {
      component.editingPromptText.set('Remind about ');
      component.insertEditPlaceholder('{deadline}');
      expect(component.editingPromptText()).toBe('Remind about {deadline}');
    });
  });

  describe('onToggleActive', () => {
    it('should toggle is_active and show toast', async () => {
      await initComponent(fixture, http, [mockRule]);
      vi.useFakeTimers();

      const togglePromise = component.onToggleActive(mockRule);
      await vi.advanceTimersByTimeAsync(0);

      const req = http.expectOne((r) => r.method === 'PATCH' && r.url.includes('/rules/rule-1'));
      req.flush({ ...mockRule, is_active: false });

      await vi.advanceTimersByTimeAsync(0);
      await togglePromise;

      expect(component.rules()[0].is_active).toBe(false);
      expect(toastService.success).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
