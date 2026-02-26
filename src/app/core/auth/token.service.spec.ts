import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let store: Record<string, string>;
  let getItemSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.fn>;
  let removeItemSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = {};

    getItemSpy = vi.fn((key: string) => store[key] ?? null);
    setItemSpy = vi.fn((key: string, value: string) => { store[key] = value; });
    removeItemSpy = vi.fn((key: string) => { delete store[key]; });

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [TokenService],
    });

    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAccessToken', () => {
    it('should return null when no token is stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return the stored access token', () => {
      store['access_token'] = 'my-access-token';
      expect(service.getAccessToken()).toBe('my-access-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no refresh token is stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should return the stored refresh token', () => {
      store['refresh_token'] = 'my-refresh-token';
      expect(service.getRefreshToken()).toBe('my-refresh-token');
    });
  });

  describe('setTokens', () => {
    it('should store both access and refresh tokens', () => {
      service.setTokens('access-123', 'refresh-456');

      expect(setItemSpy).toHaveBeenCalledWith('access_token', 'access-123');
      expect(setItemSpy).toHaveBeenCalledWith('refresh_token', 'refresh-456');
    });

    it('should not store refresh token if it is empty', () => {
      service.setTokens('access-123', '');

      expect(setItemSpy).toHaveBeenCalledWith('access_token', 'access-123');
      expect(setItemSpy).not.toHaveBeenCalledWith('refresh_token', expect.anything());
    });
  });

  describe('clearTokens', () => {
    it('should remove both tokens from localStorage', () => {
      service.clearTokens();

      expect(removeItemSpy).toHaveBeenCalledWith('access_token');
      expect(removeItemSpy).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token exists', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true for a malformed token', () => {
      store['access_token'] = 'not-a-jwt';
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true for a token with invalid JSON payload', () => {
      store['access_token'] = 'aaa.!!!.ccc';
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true for an expired token', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
      const token = `${header}.${payload}.signature`;
      store['access_token'] = token;

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false for a valid non-expired token', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      const token = `${header}.${payload}.signature`;
      store['access_token'] = token;

      expect(service.isTokenExpired()).toBe(false);
    });

    it('should handle base64 payloads that need padding', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256' }));
      const payloadObj = { exp: Math.floor(Date.now() / 1000) + 3600, sub: 'a' };
      const payloadBase64 = btoa(JSON.stringify(payloadObj));
      const payloadNoPadding = payloadBase64.replace(/=+$/, '');
      const token = `${header}.${payloadNoPadding}.sig`;
      store['access_token'] = token;

      expect(service.isTokenExpired()).toBe(false);
    });
  });
});
