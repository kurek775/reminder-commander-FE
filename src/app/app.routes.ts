import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/health/health.component').then((m) => m.HealthComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/callback/callback.component').then(
        (m) => m.CallbackComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: 'sheets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sheets/sheets-list/sheets-list.component').then(
        (m) => m.SheetsListComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
