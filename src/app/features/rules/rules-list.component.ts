import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { RulesService, SheetColumnHeader, TrackerRule } from './rules.service';
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
  selector: 'app-rules-list',
  imports: [CommonModule, FormsModule, TranslocoModule, CronToHumanPipe, SkeletonComponent, SchedulePickerComponent],
  templateUrl: './rules-list.component.html',
})
export class RulesListComponent implements OnInit {
  rules = signal<TrackerRule[]>([]);
  sheets = signal<SheetIntegration[]>([]);
  sheetHeaders = signal<SheetColumnHeader[]>([]);
  isLoading = signal(false);
  showForm = signal(false);
  errorMessage = signal('');

  formName = signal('');
  formSheetId = signal('');
  formMetric = signal('');
  formPromptText = signal('');

  scheduleType = signal<ScheduleType>('daily');
  scheduleHour = signal(8);
  scheduleDay = signal(1);
  scheduleInterval = signal(3);

  cronExpression = computed(() =>
    buildCron(this.scheduleType(), this.scheduleHour(), this.scheduleDay(), this.scheduleInterval()),
  );

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

  isFormValid = computed(
    () =>
      this.formName().trim() !== '' &&
      this.formSheetId().trim() !== '' &&
      this.formMetric() !== '' &&
      this.formPromptText().trim() !== '',
  );

  private readonly rulesService = inject(RulesService);
  private readonly sheetsService = inject(SheetsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);
  private readonly toast = inject(ToastService);
  private readonly confirmModal = inject(ConfirmModalService);
  private deleteTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      if (this.deleteTimeout) clearTimeout(this.deleteTimeout);
    });
    this.loadRules();
    this.sheetsService.getSheets().then((data) => this.sheets.set(data));
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.errorMessage.set('');
  }

  onSheetChange(sheetId: string): void {
    this.formSheetId.set(sheetId);
    this.formMetric.set('');
    this.sheetHeaders.set([]);
    if (sheetId) {
      this.loadSheetHeaders(sheetId);
    }
  }

  async onCreateRule(): Promise<void> {
    if (!this.isFormValid() || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const selectedHeader = this.sheetHeaders().find((h) => h.name === this.formMetric());
      const targetColumn = selectedHeader?.column ?? 'B';
      const rule = await this.rulesService.createRule({
        sheet_integration_id: this.formSheetId(),
        name: this.formName(),
        rule_type: 'health_tracker',
        cron_schedule: this.cronExpression(),
        target_column: targetColumn,
        metric_name: this.formMetric(),
        prompt_text: this.formPromptText(),
        is_active: true,
      });
      this.rules.update((list) => [...list, rule]);
      this.showForm.set(false);
      this.formName.set('');
      this.formSheetId.set('');
      this.formMetric.set('');
      this.formPromptText.set('');
      this.sheetHeaders.set([]);
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
      const updated = await this.rulesService.updateRule(ruleId, {
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

  async onDeleteRule(ruleId: string): Promise<void> {
    const confirmed = await this.confirmModal.confirm({
      title: this.transloco.translate('rules.deleteTitle'),
      message: this.transloco.translate('rules.deleteConfirm'),
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
    await new Promise((r) => (this.deleteTimeout = setTimeout(r, 5000)));
    if (undone) return;
    try {
      await this.rulesService.deleteRule(ruleId);
    } catch {
      if (removed) this.rules.update((list) => [...list, removed]);
      this.toast.error(this.transloco.translate('toast.deleteFailed'));
    }
  }

  async onToggleActive(rule: TrackerRule): Promise<void> {
    try {
      const updated = await this.rulesService.updateRule(rule.id, { is_active: !rule.is_active });
      this.rules.update((list) => list.map((r) => (r.id === rule.id ? updated : r)));
      const state = updated.is_active
        ? this.transloco.translate('toast.ruleResumed')
        : this.transloco.translate('toast.rulePaused');
      this.toast.success(this.transloco.translate('toast.ruleToggled', { state }));
    } catch {
      this.toast.error(this.transloco.translate('toast.saveFailed'));
    }
  }

  private async loadRules(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.rulesService.getRules('health_tracker');
      this.rules.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadSheetHeaders(sheetId: string): Promise<void> {
    try {
      const headers = await this.rulesService.getSheetHeaders(sheetId);
      this.sheetHeaders.set(headers);
    } catch {
      this.sheetHeaders.set([]);
    }
  }
}
