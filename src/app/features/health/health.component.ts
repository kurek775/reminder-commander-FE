import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { HealthService, HealthResponse } from './health.service';

@Component({
  selector: 'app-health',
  imports: [CommonModule, TranslocoModule],
  templateUrl: './health.component.html',
})
export class HealthComponent implements OnInit {
  isLoading = signal(true);
  health = signal<HealthResponse | null>(null);
  errorMessage = signal<string | null>(null);

  private readonly healthService = inject(HealthService);

  async ngOnInit(): Promise<void> {
    try {
      const data = await firstValueFrom(this.healthService.getHealth());
      this.health.set(data);
    } catch (err) {
      this.errorMessage.set((err as Error).message ?? 'Failed to connect to backend.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
