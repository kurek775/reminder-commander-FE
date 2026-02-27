import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SheetIntegration, SheetPreview } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class SheetsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/sheets`;

  async getSheets(): Promise<SheetIntegration[]> {
    return firstValueFrom(this.http.get<SheetIntegration[]>(`${this.apiUrl}/`));
  }

  async connectSheet(sheetUrl: string): Promise<{ auth_url: string }> {
    const params = new HttpParams().set('sheet_url', sheetUrl);
    return firstValueFrom(
      this.http.get<{ auth_url: string }>(`${this.apiUrl}/connect`, { params }),
    );
  }

  async createSheet(title: string): Promise<{ auth_url: string }> {
    const params = new HttpParams().set('title', title);
    return firstValueFrom(
      this.http.get<{ auth_url: string }>(`${this.apiUrl}/create`, { params }),
    );
  }

  async deleteSheet(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }

  async getSheetRuleCount(id: string): Promise<number> {
    const result = await firstValueFrom(
      this.http.get<{ count: number }>(`${this.apiUrl}/${id}/rule-count`),
    );
    return result.count;
  }

  async getSheetPreview(id: string): Promise<SheetPreview> {
    return firstValueFrom(
      this.http.get<SheetPreview>(`${this.apiUrl}/${id}/preview`),
    );
  }

  async renameSheet(id: string, displayName: string | null): Promise<SheetIntegration> {
    return firstValueFrom(
      this.http.patch<SheetIntegration>(`${this.apiUrl}/${id}`, {
        display_name: displayName,
      }),
    );
  }
}
