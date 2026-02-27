import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { SheetsService } from '../sheets.service';

@Component({
  selector: 'app-connect-sheet',
  imports: [TranslocoModule],
  templateUrl: './connect-sheet.component.html',
})
export class ConnectSheetComponent {
  private readonly sheetsService = inject(SheetsService);

  mode = signal<'connect' | 'create'>('connect');
  sheetUrl = signal('');
  sheetTitle = signal('');
  isConnecting = signal(false);

  isValidUrl = computed(() =>
    /\/spreadsheets\/d\/[a-zA-Z0-9_-]+/.test(this.sheetUrl()),
  );

  isValidTitle = computed(() => this.sheetTitle().trim().length > 0);

  async onConnect(): Promise<void> {
    this.isConnecting.set(true);
    try {
      const response = await this.sheetsService.connectSheet(this.sheetUrl());
      window.location.href = response.auth_url;
    } finally {
      this.isConnecting.set(false);
    }
  }

  async onCreateSheet(): Promise<void> {
    this.isConnecting.set(true);
    try {
      const response = await this.sheetsService.createSheet(this.sheetTitle());
      window.location.href = response.auth_url;
    } finally {
      this.isConnecting.set(false);
    }
  }
}
