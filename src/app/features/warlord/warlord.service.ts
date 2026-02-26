import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TrackerRule } from '../rules/rules.service';

export interface InteractionLog {
  id: string;
  tracker_rule_id: string | null;
  direction: string;
  channel: string;
  message_content: string | null;
  status: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class WarlordService {
  private readonly http = inject(HttpClient);
  private readonly rulesUrl = `${environment.apiUrl}/api/v1/rules`;
  private readonly warlordUrl = `${environment.apiUrl}/api/v1/warlord`;
  private readonly interactionsUrl = `${environment.apiUrl}/api/v1/interactions`;

  async getWarlordRules(): Promise<TrackerRule[]> {
    return firstValueFrom(
      this.http.get<TrackerRule[]>(`${this.rulesUrl}/`, {
        params: { rule_type: 'warlord' },
      }),
    );
  }

  async createWarlordRule(payload: {
    name: string;
    sheet_integration_id: string;
    cron_schedule: string;
    prompt_text: string;
  }): Promise<TrackerRule> {
    return firstValueFrom(
      this.http.post<TrackerRule>(`${this.rulesUrl}/`, {
        ...payload,
        rule_type: 'warlord',
        target_column: 'A',
        metric_name: null,
        is_active: true,
      }),
    );
  }

  async deleteRule(ruleId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.rulesUrl}/${ruleId}`));
  }

  async debugRule(ruleId: string): Promise<{ today: string; raw_rows: string[][]; missed_tasks: { row: number; task: string; deadline: string }[] }> {
    return firstValueFrom(this.http.get<{ today: string; raw_rows: string[][]; missed_tasks: { row: number; task: string; deadline: string }[] }>(`${this.warlordUrl}/debug/${ruleId}`));
  }

  async updateRule(
    ruleId: string,
    data: Partial<Pick<TrackerRule, 'name' | 'cron_schedule' | 'prompt_text' | 'is_active'>>,
  ): Promise<TrackerRule> {
    return firstValueFrom(
      this.http.patch<TrackerRule>(`${this.rulesUrl}/${ruleId}`, data),
    );
  }

  async triggerScan(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.warlordUrl}/trigger`, {}));
  }

  async getVoiceLogs(): Promise<InteractionLog[]> {
    return firstValueFrom(
      this.http.get<InteractionLog[]>(`${this.interactionsUrl}/`, {
        params: { channel: 'voice' },
      }),
    );
  }
}
