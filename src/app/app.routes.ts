import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'health',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/health/health.component').then((m) => m.HealthComponent),
  },
  {
    path: 'login',
    redirectTo: '',
    pathMatch: 'full',
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
  {
    path: 'rules',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/rules/rules-list.component').then(
        (m) => m.RulesListComponent,
      ),
  },
  {
    path: 'warlord',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/warlord/warlord.component').then(
        (m) => m.WarlordComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
