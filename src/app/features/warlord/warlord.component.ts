import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { WarlordService, InteractionLog } from './warlord.service';
import { TrackerRule } from '../rules/rules.service';
import { SheetIntegration } from '../sheets/sheets-list/sheets-list.component';

@Component({
  selector: 'app-warlord',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
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
  editingPromptText = signal('');
  debugRuleId = signal<string | null>(null);
  debugResult = signal<{ today: string; raw_rows: string[][]; missed_tasks: { row: number; task: string; deadline: string }[] } | null>(null);
  scheduleType = signal<'daily' | 'weekly' | 'hourly'>('daily');
  scheduleHour = signal(8);
  scheduleDay = signal(1);
  scheduleInterval = signal(3);

  cronExpression = computed(() => {
    switch (this.scheduleType()) {
      case 'daily':
        return `0 ${this.scheduleHour()} * * *`;
      case 'weekly':
        return `0 ${this.scheduleHour()} * * ${this.scheduleDay()}`;
      case 'hourly':
        return `0 */${this.scheduleInterval()} * * *`;
    }
  });

  isFormValid = computed(
    () => this.formName().trim() !== '' && this.formSheetId().trim() !== '',
  );

  readonly hourOptions = Array.from({ length: 24 }, (_, i) => i);
  readonly intervalOptions = [1, 2, 3, 4, 6, 8, 12];

  private readonly warlordService = inject(WarlordService);
  private readonly http = inject(HttpClient);
  private readonly sheetsApiUrl = `${environment.apiUrl}/api/v1/sheets`;

  ngOnInit(): void {
    this.loadAll();
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.errorMessage.set('');
  }

  padHour(h: number): string {
    return String(h).padStart(2, '0') + ':00';
  }

  cronToHuman(cron: string): string {
    let m: RegExpMatchArray | null;
    if ((m = cron.match(/^0 (\d+) \* \* (\d)$/))) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Every ${days[Number(m[2])]} at ${String(m[1]).padStart(2, '0')}:00`;
    }
    if ((m = cron.match(/^0 (\d+) \* \* \*$/))) {
      return `Daily at ${String(m[1]).padStart(2, '0')}:00`;
    }
    if ((m = cron.match(/^0 \*\/(\d+) \* \* \*$/))) {
      return `Every ${m[1]} hours`;
    }
    return cron;
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
    } catch {
      this.errorMessage.set('Failed to create rule. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteRule(ruleId: string): Promise<void> {
    try {
      await this.warlordService.deleteRule(ruleId);
      this.rules.update((list) => list.filter((r) => r.id !== ruleId));
    } catch {
      this.errorMessage.set('Failed to delete rule.');
    }
  }

  async onTrigger(): Promise<void> {
    if (this.isTriggering()) return;
    this.isTriggering.set(true);
    this.triggerMessage.set('');
    try {
      await this.warlordService.triggerScan();
      this.triggerMessage.set('warlord.triggered');
      setTimeout(async () => {
        this.triggerMessage.set('');
        await this.loadLogs();
      }, 5000);
    } catch {
      this.triggerMessage.set('warlord.triggerFailed');
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
    this.editingPromptText.set(rule.prompt_text ?? '');
  }

  onCancelEdit(): void {
    this.editingRuleId.set(null);
    this.editingPromptText.set('');
  }

  async onSaveEdit(ruleId: string): Promise<void> {
    try {
      const updated = await this.warlordService.updatePrompt(ruleId, this.editingPromptText());
      this.rules.update((list) => list.map((r) => (r.id === ruleId ? updated : r)));
      this.editingRuleId.set(null);
      this.editingPromptText.set('');
    } catch {
      this.errorMessage.set('Failed to save. Please try again.');
    }
  }

  private async loadAll(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [rules, sheets, logs] = await Promise.all([
        this.warlordService.getWarlordRules(),
        firstValueFrom(this.http.get<SheetIntegration[]>(`${this.sheetsApiUrl}/`)),
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
