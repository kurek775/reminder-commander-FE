import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  async onConnect(): Promise<void> {
    const response = await firstValueFrom(
      this.http.get<{ auth_url: string }>(`${this.apiUrl}/connect`),
    );
    window.location.href = response.auth_url;
  }
}
