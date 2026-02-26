import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { WarlordService, InteractionLog } from './warlord.service';
import { TrackerRule } from '../rules/rules.service';

describe('WarlordService', () => {
  let service: WarlordService;
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
    name: 'Warlord Rule',
    rule_type: 'warlord',
    cron_schedule: '0 9 * * *',
    target_column: 'A',
    metric_name: null,
    prompt_text: 'Call about {task_name}',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockLog: InteractionLog = {
    id: 'log-1',
    tracker_rule_id: 'rule-1',
    direction: 'outbound',
    channel: 'voice',
    message_content: 'Called about task',
    status: 'completed',
    created_at: '2024-01-01T12:00:00Z',
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
        WarlordService,
      ],
    });

    service = TestBed.inject(WarlordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWarlordRules', () => {
    it('should call GET /api/v1/rules/ with rule_type=warlord', async () => {
      httpClient.get.mockReturnValue(of([mockRule]));

      const result = await service.getWarlordRules();

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/',
        { params: { rule_type: 'warlord' } },
      );
      expect(result).toEqual([mockRule]);
    });
  });

  describe('createWarlordRule', () => {
    it('should call POST /api/v1/rules/ with warlord defaults', async () => {
      const payload = {
        name: 'New Warlord',
        sheet_integration_id: 'sheet-1',
        cron_schedule: '0 9 * * *',
        prompt_text: 'Call about {task_name}',
      };
      httpClient.post.mockReturnValue(of(mockRule));

      const result = await service.createWarlordRule(payload);

      expect(httpClient.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/rules/',
        {
          ...payload,
          rule_type: 'warlord',
          target_column: 'A',
          metric_name: null,
          is_active: true,
        },
      );
      expect(result).toEqual(mockRule);
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

  describe('updateRule', () => {
    it('should call PATCH /api/v1/rules/:id with data', async () => {
      const updateData = { name: 'Updated', cron_schedule: '0 10 * * *' };
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

  describe('triggerScan', () => {
    it('should call POST /api/v1/warlord/trigger with empty body', async () => {
      httpClient.post.mockReturnValue(of(undefined));

      await service.triggerScan();

      expect(httpClient.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/warlord/trigger',
        {},
      );
    });
  });

  describe('getVoiceLogs', () => {
    it('should call GET /api/v1/interactions/ with channel=voice', async () => {
      httpClient.get.mockReturnValue(of([mockLog]));

      const result = await service.getVoiceLogs();

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/interactions/',
        { params: { channel: 'voice' } },
      );
      expect(result).toEqual([mockLog]);
    });
  });

  describe('debugRule', () => {
    it('should call GET /api/v1/warlord/debug/:id', async () => {
      const debugResult = {
        today: '2024-01-15',
        raw_rows: [['Task A', '2024-01-10', 'FALSE']],
        missed_tasks: [{ row: 2, task: 'Task A', deadline: '2024-01-10' }],
      };
      httpClient.get.mockReturnValue(of(debugResult));

      const result = await service.debugRule('rule-1');

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/warlord/debug/rule-1',
      );
      expect(result).toEqual(debugResult);
    });
  });
});
