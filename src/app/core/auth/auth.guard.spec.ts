import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { authGuard } from './auth.guard';
import { TokenService } from './token.service';

describe('authGuard', () => {
  let tokenService: { isTokenExpired: ReturnType<typeof vi.fn> };
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
    router = {
      createUrlTree: vi.fn().mockReturnValue('/login'),
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should redirect to /login when token is expired', () => {
    tokenService.isTokenExpired.mockReturnValue(true);
    const result = runGuard();
    expect(result).toEqual('/login');
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should return true when token is valid', () => {
    tokenService.isTokenExpired.mockReturnValue(false);
    const result = runGuard();
    expect(result).toBe(true);
  });
});
