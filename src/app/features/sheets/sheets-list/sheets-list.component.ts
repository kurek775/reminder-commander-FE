import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

import { environment } from '../../../../environments/environment';
import { ConnectSheetComponent } from '../connect-sheet/connect-sheet.component';

export interface SheetIntegration {
  id: string;
  user_id: string;
  google_sheet_id: string;
  sheet_name: string;
  is_active: boolean;
  token_expires_at?: string;
}

@Component({
  selector: 'app-sheets-list',
  standalone: true,
  imports: [CommonModule, ConnectSheetComponent, TranslocoModule],
  templateUrl: './sheets-list.component.html',
})
export class SheetsListComponent implements OnInit {
  sheets = signal<SheetIntegration[]>([]);

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/sheets`;

  ngOnInit(): void {
    firstValueFrom(this.http.get<SheetIntegration[]>(this.apiUrl)).then(
      (data) => this.sheets.set(data),
    );
  }
}
