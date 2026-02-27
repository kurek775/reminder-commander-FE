import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { WarlordService, InteractionLog } from './warlord.service';
import { TrackerRule } from '../rules/rules.service';
import { SheetIntegration } from '../../shared/models';
import { SheetsService } from '../sheets/sheets.service';
import {
  buildCron,
  parseCron,
  ScheduleType,
} from '../../shared/cron-utils';
import { CronToHumanPipe } from '../../shared/cron-to-human.pipe';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmModalService } from '../../shared/confirm-modal/confirm-modal.service';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { SchedulePickerComponent } from '../../shared/schedule-picker/schedule-picker.component';

@Component({
  selector: 'app-warlord',
  imports: [CommonModule, FormsModule, TranslocoModule, CronToHumanPipe, SkeletonComponent, SchedulePickerComponent],
  templateUrl: './warlord.component.html',
})
export class WarlordComponent implements OnInit {
  rules = signal<TrackerRule[]>([]);
  sheets = signal<SheetIntegration[]>([]);
  logs = signal<InteractionLog[]>([]);
  isLoading = signal(false);
  isTriggering = signal(false);
  showForm = signal(false);
  errorMessage = signal('');
  triggerMessage = signal('');

  formName = signal('');
  formSheetId = signal('');
  formPromptText = signal('');
  editingRuleId = signal<string | null>(null);
  editingName = signal('');
  editingPromptText = signal('');
  editingScheduleType = signal<ScheduleType>('daily');
  editingScheduleHour = signal(8);
  editingScheduleDay = signal(1);
  editingScheduleInterval = signal(3);

  editingCron = computed(() =>
    buildCron(
      this.editingScheduleType(),
      this.editingScheduleHour(),
      this.editingScheduleDay(),
      this.editingScheduleInterval(),
    ),
  );
  debugRuleId = signal<string | null>(null);
  debugResult = signal<{ today: string; raw_rows: string[][]; missed_tasks: { row: number; task: string; deadline: string }[] } | null>(null);
  scheduleType = signal<ScheduleType>('daily');
  scheduleHour = signal(8);
  scheduleDay = signal(1);
  scheduleInterval = signal(3);

  cronExpression = computed(() =>
    buildCron(this.scheduleType(), this.scheduleHour(), this.scheduleDay(), this.scheduleInterval()),
  );

  isFormValid = computed(
    () => this.formName().trim() !== '' && this.formSheetId().trim() !== '',
  );

  private readonly warlordService = inject(WarlordService);
  private readonly sheetsService = inject(SheetsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);
  private readonly toast = inject(ToastService);
  private readonly confirmModal = inject(ConfirmModalService);
  private triggerTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadAll();
    this.destroyRef.onDestroy(() => {
      if (this.triggerTimeout) clearTimeout(this.triggerTimeout);
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.errorMessage.set('');
  }

  async onCreateRule(): Promise<void> {
    if (!this.isFormValid() || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const rule = await this.warlordService.createWarlordRule({
        name: this.formName(),
        sheet_integration_id: this.formSheetId(),
        cron_schedule: this.cronExpression(),
        prompt_text: this.formPromptText(),
      });
      this.rules.update((list) => [...list, rule]);
      this.showForm.set(false);
      this.formName.set('');
      this.formSheetId.set('');
      this.formPromptText.set('');
      this.scheduleType.set('daily');
      this.scheduleHour.set(8);
      this.scheduleDay.set(1);
      this.scheduleInterval.set(3);
      this.toast.success(this.transloco.translate('toast.ruleCreated'));
    } catch {
      this.toast.error(this.transloco.translate('toast.createFailed'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteRule(ruleId: string): Promise<void> {
    const confirmed = await this.confirmModal.confirm({
      title: this.transloco.translate('warlord.deleteTitle'),
      message: this.transloco.translate('warlord.deleteConfirm'),
      danger: true,
    });
    if (!confirmed) return;
    const removed = this.rules().find((r) => r.id === ruleId);
    this.rules.update((list) => list.filter((r) => r.id !== ruleId));
    let undone = false;
    this.toast.undoable(this.transloco.translate('toast.ruleDeleteUndo'), () => {
      undone = true;
      if (removed) this.rules.update((list) => [...list, removed]);
    });
    await new Promise((r) => setTimeout(r, 5000));
    if (undone) return;
    try {
      await this.warlordService.deleteRule(ruleId);
    } catch {
      if (removed) this.rules.update((list) => [...list, removed]);
      this.toast.error(this.transloco.translate('toast.deleteFailed'));
    }
  }

  async onTrigger(): Promise<void> {
    if (this.isTriggering()) return;
    this.isTriggering.set(true);
    this.triggerMessage.set('');
    try {
      await this.warlordService.triggerScan();
      this.triggerMessage.set('warlord.triggered');
      this.toast.success(this.transloco.translate('toast.triggerSuccess'));
      this.triggerTimeout = setTimeout(async () => {
        this.triggerMessage.set('');
        await this.loadLogs();
      }, 5000);
    } catch {
      this.triggerMessage.set('warlord.triggerFailed');
      this.toast.error(this.transloco.translate('toast.triggerFailed'));
    } finally {
      this.isTriggering.set(false);
    }
  }

  async onDebugRule(ruleId: string): Promise<void> {
    if (this.debugRuleId() === ruleId) {
      this.debugRuleId.set(null);
      this.debugResult.set(null);
      return;
    }
    this.debugRuleId.set(ruleId);
    this.debugResult.set(null);
    try {
      const result = await this.warlordService.debugRule(ruleId);
      this.debugResult.set(result);
    } catch {
      this.debugResult.set({ today: '', raw_rows: [], missed_tasks: [] });
    }
  }

  onEditRule(rule: TrackerRule): void {
    this.editingRuleId.set(rule.id);
    this.editingName.set(rule.name);
    this.editingPromptText.set(rule.prompt_text ?? '');
    const parsed = parseCron(rule.cron_schedule);
    this.editingScheduleType.set(parsed.type);
    this.editingScheduleHour.set(parsed.hour);
    this.editingScheduleDay.set(parsed.day);
    this.editingScheduleInterval.set(parsed.interval);
  }

  onCancelEdit(): void {
    this.editingRuleId.set(null);
  }

  async onSaveEdit(ruleId: string): Promise<void> {
    try {
      const updated = await this.warlordService.updateRule(ruleId, {
        name: this.editingName(),
        cron_schedule: this.editingCron(),
        prompt_text: this.editingPromptText(),
      });
      this.rules.update((list) => list.map((r) => (r.id === ruleId ? updated : r)));
      this.editingRuleId.set(null);
      this.toast.success(this.transloco.translate('toast.ruleSaved'));
    } catch {
      this.toast.error(this.transloco.translate('toast.saveFailed'));
    }
  }

  async onToggleActive(rule: TrackerRule): Promise<void> {
    try {
      const updated = await this.warlordService.updateRule(rule.id, { is_active: !rule.is_active });
      this.rules.update((list) => list.map((r) => (r.id === rule.id ? updated : r)));
      const state = updated.is_active
        ? this.transloco.translate('toast.ruleResumed')
        : this.transloco.translate('toast.rulePaused');
      this.toast.success(this.transloco.translate('toast.ruleToggled', { state }));
    } catch {
      this.toast.error(this.transloco.translate('toast.saveFailed'));
    }
  }

  insertPlaceholder(placeholder: string): void {
    this.formPromptText.update((text) => text + placeholder);
  }

  insertEditPlaceholder(placeholder: string): void {
    this.editingPromptText.update((text) => text + placeholder);
  }

  private async loadAll(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [rules, sheets, logs] = await Promise.all([
        this.warlordService.getWarlordRules(),
        this.sheetsService.getSheets(),
        this.warlordService.getVoiceLogs(),
      ]);
      this.rules.set(rules);
      this.sheets.set(sheets);
      this.logs.set(logs);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadLogs(): Promise<void> {
    try {
      const logs = await this.warlordService.getVoiceLogs();
      this.logs.set(logs);
    } catch {}
  }
}
