import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  health_rules_active: number;
  warlord_rules_active: number;
  sheets_connected: number;
  has_whatsapp: boolean;
  recent_interactions: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/dashboard`;

  async getSummary(): Promise<DashboardSummary> {
    return firstValueFrom(this.http.get<DashboardSummary>(`${this.apiUrl}/summary`));
  }
}
