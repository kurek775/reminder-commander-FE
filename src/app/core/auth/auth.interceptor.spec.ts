import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { TokenService } from './token.service';

describe('authInterceptor', () => {
  let tokenService: {
    getAccessToken: ReturnType<typeof vi.fn>;
    getRefreshToken: ReturnType<typeof vi.fn>;
    setTokens: ReturnType<typeof vi.fn>;
    clearTokens: ReturnType<typeof vi.fn>;
    isTokenExpired: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    tokenService = {
      getAccessToken: vi.fn(),
      getRefreshToken: vi.fn().mockReturnValue(null),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      isTokenExpired: vi.fn().mockReturnValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService },
      ],
    });
  });

  const runInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    return TestBed.runInInjectionContext(() => authInterceptor(req, next));
  };

  it('should add Authorization header when token exists', () => {
    tokenService.getAccessToken.mockReturnValue('my-jwt-token');
    const req = new HttpRequest('GET', '/api/test');
    let capturedReq: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = vi.fn().mockImplementation((r: HttpRequest<unknown>) => {
      capturedReq = r;
      return of(new HttpResponse({ status: 200 }));
    });

    runInterceptor(req, next);

    expect(next).toHaveBeenCalled();
    expect(capturedReq).toBeDefined();
    expect(capturedReq!.headers.get('Authorization')).toBe('Bearer my-jwt-token');
  });

  it('should pass request unchanged when no token exists', () => {
    tokenService.getAccessToken.mockReturnValue(null);
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = vi.fn().mockReturnValue(of(new HttpResponse({ status: 200 })));

    runInterceptor(req, next);

    expect(next).toHaveBeenCalledWith(req);
  });

  it('should call next handler and return its observable', async () => {
    tokenService.getAccessToken.mockReturnValue(null);
    const req = new HttpRequest('GET', '/api/test');
    const mockResponse = new HttpResponse({ status: 200 });
    const next: HttpHandlerFn = vi.fn().mockReturnValue(of(mockResponse));

    const result$ = runInterceptor(req, next);
    const result = await firstValueFrom(result$);

    expect(next).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it('should not modify original request when token exists', () => {
    tokenService.getAccessToken.mockReturnValue('abc123');
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = vi.fn().mockReturnValue(of(new HttpResponse({ status: 200 })));

    runInterceptor(req, next);

    // Original request should not have the header
    expect(req.headers.has('Authorization')).toBe(false);
  });
});
