import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../../environments/environment';
import { ConnectSheetComponent } from '../connect-sheet/connect-sheet.component';
import { SheetIntegration } from '../../../shared/models';

@Component({
  selector: 'app-sheets-list',
  imports: [CommonModule, ConnectSheetComponent, TranslocoModule],
  templateUrl: './sheets-list.component.html',
})
export class SheetsListComponent implements OnInit {
  sheets = signal<SheetIntegration[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/sheets`;

  ngOnInit(): void {
    this.loadSheets();
  }

  private async loadSheets(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const data = await firstValueFrom(this.http.get<SheetIntegration[]>(this.apiUrl));
      this.sheets.set(data);
    } catch {
      this.errorMessage.set('sheets.loadError');
    } finally {
      this.isLoading.set(false);
    }
  }
}
