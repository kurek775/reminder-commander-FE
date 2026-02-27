import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('authGuard', () => {
  let tokenService: { isTokenExpired: ReturnType<typeof vi.fn> };
  let authService: { refreshAccessToken: ReturnType<typeof vi.fn> };
  let router: { createUrlTree: ReturnType<typeof vi.fn>; navigate: ReturnType<typeof vi.fn> };

  const runGuard = () => {
    return TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
  };

  beforeEach(() => {
    tokenService = { isTokenExpired: vi.fn() };
    authService = { refreshAccessToken: vi.fn() };
    router = {
      createUrlTree: vi.fn().mockReturnValue('/'),
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should return true when token is valid', async () => {
    tokenService.isTokenExpired.mockReturnValue(false);
    const result = await runGuard();
    expect(result).toBe(true);
  });

  it('should return true when token is expired but refresh succeeds', async () => {
    tokenService.isTokenExpired.mockReturnValue(true);
    authService.refreshAccessToken.mockResolvedValue(true);
    const result = await runGuard();
    expect(result).toBe(true);
    expect(authService.refreshAccessToken).toHaveBeenCalled();
  });

  it('should redirect to / when token is expired and refresh fails', async () => {
    tokenService.isTokenExpired.mockReturnValue(true);
    authService.refreshAccessToken.mockResolvedValue(false);
    const result = await runGuard();
    expect(result).toEqual('/');
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
