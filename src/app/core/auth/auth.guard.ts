import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export const authGuard: CanActivateFn = async () => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!tokenService.isTokenExpired()) return true;

  const refreshed = await authService.refreshAccessToken();
  if (refreshed) return true;

  return router.createUrlTree(['/']);
};
