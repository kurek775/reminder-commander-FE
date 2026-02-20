import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpClient: { get: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };
  let tokenService: { setTokens: ReturnType<typeof vi.fn>; getAccessToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpClient = { get: vi.fn(), patch: vi.fn() };
    tokenService = { setTokens: vi.fn(), getAccessToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: HttpClient, useValue: httpClient },
        { provide: TokenService, useValue: tokenService },
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() should call GET /api/v1/auth/google', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    httpClient.get.mockReturnValue(of({ auth_url: 'https://accounts.google.com/o/oauth2/auth' }));

    await service.login();

    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/google'),
    );

    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });

  it('me() should set currentUser signal', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      display_name: 'Test User',
      whatsapp_verified: false,
      is_active: true,
    };
    httpClient.get.mockReturnValue(of(mockUser));

    await service.me();

    expect(service.currentUser()).toEqual(mockUser);
  });
});
