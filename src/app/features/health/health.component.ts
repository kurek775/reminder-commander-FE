import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthService, HealthResponse } from './health.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss',
})
export class HealthComponent implements OnInit {
  isLoading = signal(true);
  health = signal<HealthResponse | null>(null);
  errorMessage = signal<string | null>(null);

  private readonly healthService = inject(HealthService);

  ngOnInit(): void {
    this.healthService.getHealth().subscribe({
      next: (data) => {
        this.health.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message ?? 'Failed to connect to backend.');
        this.isLoading.set(false);
      },
    });
  }
}
