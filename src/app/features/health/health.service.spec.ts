import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { HealthService, HealthResponse } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let httpClient: { get: ReturnType<typeof vi.fn> };

  const mockHealth: HealthResponse = {
    status: 'ok',
    message: 'Hello from Reminder Commander!',
    version: '1.0.0',
  };

  beforeEach(() => {
    httpClient = { get: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClient },
        HealthService,
      ],
    });

    service = TestBed.inject(HealthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getHealth should call GET /api/v1/health', async () => {
    httpClient.get.mockReturnValue(of(mockHealth));

    const result = await firstValueFrom(service.getHealth());

    expect(httpClient.get).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/health',
    );
    expect(result).toEqual(mockHealth);
  });

  it('getHealth should return an Observable', () => {
    httpClient.get.mockReturnValue(of(mockHealth));

    const obs = service.getHealth();

    // Verify it is an Observable (has subscribe method)
    expect(typeof obs.subscribe).toBe('function');
  });

  it('getHealth should propagate errors', async () => {
    httpClient.get.mockReturnValue(throwError(() => new Error('Network error')));

    await expect(firstValueFrom(service.getHealth())).rejects.toThrow('Network error');
  });
});
