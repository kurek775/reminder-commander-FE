import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { RulesService, TrackerRule, CreateRulePayload, SheetColumnHeader } from './rules.service';

describe('RulesService', () => {
  let service: RulesService;
  let httpClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockRule: TrackerRule = {
    id: 'rule-1',
    user_id: 'user-1',
    sheet_integration_id: 'sheet-1',
    name: 'Test Rule',
    rule_type: 'reminder',
    cron_schedule: '0 9 * * *',
    target_column: 'A',
    metric_name: null,
    prompt_text: 'Check column A',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClient },
        RulesService,
      ],
    });

    service = TestBed.inject(RulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRules', () => {
    it('should call GET /api/v1/rules/ without params when no ruleType given', async () => {
      httpClient.get.mockReturnValue(of([mockRule]));

      const result = await service.getRules();

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/',
        {},
      );
      expect(result).toEqual([mockRule]);
    });

    it('should call GET /api/v1/rules/ with rule_type param when ruleType given', async () => {
      httpClient.get.mockReturnValue(of([mockRule]));

      const result = await service.getRules('warlord');

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/',
        { params: { rule_type: 'warlord' } },
      );
      expect(result).toEqual([mockRule]);
    });

    it('should return empty array when no rules exist', async () => {
      httpClient.get.mockReturnValue(of([]));

      const result = await service.getRules();

      expect(result).toEqual([]);
    });
  });

  describe('createRule', () => {
    it('should call POST /api/v1/rules/ with payload', async () => {
      const payload: CreateRulePayload = {
        sheet_integration_id: 'sheet-1',
        name: 'New Rule',
        rule_type: 'reminder',
        cron_schedule: '0 9 * * *',
        target_column: 'B',
        metric_name: null,
        prompt_text: 'Check column B',
        is_active: true,
      };
      httpClient.post.mockReturnValue(of(mockRule));

      const result = await service.createRule(payload);

      expect(httpClient.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/',
        payload,
      );
      expect(result).toEqual(mockRule);
    });
  });

  describe('updateRule', () => {
    it('should call PATCH /api/v1/rules/:id with partial data', async () => {
      const updateData = { name: 'Updated Rule', is_active: false };
      const updatedRule = { ...mockRule, ...updateData };
      httpClient.patch.mockReturnValue(of(updatedRule));

      const result = await service.updateRule('rule-1', updateData);

      expect(httpClient.patch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/rule-1',
        updateData,
      );
      expect(result).toEqual(updatedRule);
    });
  });

  describe('deleteRule', () => {
    it('should call DELETE /api/v1/rules/:id', async () => {
      httpClient.delete.mockReturnValue(of(undefined));

      await service.deleteRule('rule-1');

      expect(httpClient.delete).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/rule-1',
      );
    });
  });

  describe('getSheetHeaders', () => {
    it('should call GET /api/v1/sheets/:id/headers', async () => {
      const headers: SheetColumnHeader[] = [
        { column: 'A', name: 'Task' },
        { column: 'B', name: 'Deadline' },
      ];
      httpClient.get.mockReturnValue(of(headers));

      const result = await service.getSheetHeaders('sheet-1');

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/sheets/sheet-1/headers',
      );
      expect(result).toEqual(headers);
    });
  });
});
