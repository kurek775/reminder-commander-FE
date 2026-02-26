import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { DashboardService, DashboardSummary } from './dashboard.service';

const mockSummary: DashboardSummary = {
  health_rules_active: 2,
  warlord_rules_active: 1,
  sheets_connected: 3,
  has_whatsapp: true,
  recent_interactions: 10,
};

describe('DashboardService', () => {
  let service: DashboardService;
  let httpClient: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpClient = { get: vi.fn().mockReturnValue(of(mockSummary)) };
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: HttpClient, useValue: httpClient },
      ],
    });
    service = TestBed.inject(DashboardService);
  });

  it('should fetch summary', async () => {
    const result = await service.getSummary();
    expect(result).toEqual(mockSummary);
    expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining('/dashboard/summary'));
  });
});
