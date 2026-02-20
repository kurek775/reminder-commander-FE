import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-connect-sheet',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './connect-sheet.component.html',
  styleUrl: './connect-sheet.component.scss',
})
export class ConnectSheetComponent {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/sheets`;

  sheetUrl = signal('');
  isConnecting = signal(false);

  isValidUrl = computed(() =>
    /\/spreadsheets\/d\/[a-zA-Z0-9_-]+/.test(this.sheetUrl()),
  );

  async onConnect(): Promise<void> {
    this.isConnecting.set(true);
    try {
      const params = new HttpParams().set('sheet_url', this.sheetUrl());
      const response = await firstValueFrom(
        this.http.get<{ auth_url: string }>(`${this.apiUrl}/connect`, { params }),
      );
      window.location.href = response.auth_url;
    } finally {
      this.isConnecting.set(false);
    }
  }
}
