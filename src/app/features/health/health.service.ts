import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HealthResponse {
  status: string;
  message: string;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  getHealth(): Promise<HealthResponse> {
    return firstValueFrom(this.http.get<HealthResponse>(`${environment.apiUrl}/api/v1/health`));
  }
}
