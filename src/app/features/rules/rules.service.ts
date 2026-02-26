import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface TrackerRule {
  id: string;
  user_id: string;
  sheet_integration_id: string;
  name: string;
  rule_type: string;
  cron_schedule: string;
  target_column: string;
  metric_name: string | null;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRulePayload {
  sheet_integration_id: string;
  name: string;
  rule_type: string;
  cron_schedule: string;
  target_column: string;
  metric_name: string | null;
  prompt_text: string;
  is_active: boolean;
}

export interface SheetColumnHeader {
  column: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RulesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/rules`;
  private readonly sheetsApiUrl = `${environment.apiUrl}/api/v1/sheets`;

  async getRules(ruleType?: string): Promise<TrackerRule[]> {
    const options = ruleType ? { params: { rule_type: ruleType } } : {};
    return firstValueFrom(this.http.get<TrackerRule[]>(`${this.apiUrl}/`, options));
  }

  async createRule(payload: CreateRulePayload): Promise<TrackerRule> {
    return firstValueFrom(this.http.post<TrackerRule>(`${this.apiUrl}/`, payload));
  }

  async updateRule(
    ruleId: string,
    data: Partial<Pick<TrackerRule, 'name' | 'cron_schedule' | 'prompt_text' | 'is_active'>>,
  ): Promise<TrackerRule> {
    return firstValueFrom(this.http.patch<TrackerRule>(`${this.apiUrl}/${ruleId}`, data));
  }

  async deleteRule(ruleId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${ruleId}`));
  }

  async getSheetHeaders(integrationId: string): Promise<SheetColumnHeader[]> {
    return firstValueFrom(
      this.http.get<SheetColumnHeader[]>(`${this.sheetsApiUrl}/${integrationId}/headers`),
    );
  }
}
