import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../environments/environment';
import { RulesService, SheetColumnHeader, TrackerRule } from './rules.service';
import { SheetIntegration } from '../sheets/sheets-list/sheets-list.component';

@Component({
  selector: 'app-rules-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
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
    () =>
      this.formName().trim() !== '' &&
      this.formSheetId().trim() !== '' &&
      this.formMetric() !== '' &&
      this.formPromptText().trim() !== '',
  );

  readonly hourOptions = Array.from({ length: 24 }, (_, i) => i);
  readonly intervalOptions = [1, 2, 3, 4, 6, 8, 12];

  private readonly rulesService = inject(RulesService);
  private readonly http = inject(HttpClient);
  private readonly sheetsApiUrl = `${environment.apiUrl}/api/v1/sheets`;

  ngOnInit(): void {
    this.loadRules();
    firstValueFrom(this.http.get<SheetIntegration[]>(`${this.sheetsApiUrl}/`)).then(
      (data) => this.sheets.set(data),
    );
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
    } catch {
      this.errorMessage.set('Failed to create rule. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteRule(ruleId: string): Promise<void> {
    try {
      await this.rulesService.deleteRule(ruleId);
      this.rules.update((list) => list.filter((r) => r.id !== ruleId));
    } catch {
      this.errorMessage.set('Failed to delete rule. Please try again.');
    }
  }

  private async loadRules(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.rulesService.getRules();
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
