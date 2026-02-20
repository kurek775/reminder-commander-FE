import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { ThemeService } from './core/theme/theme.service';
import { LanguageService } from './core/i18n/language.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslocoModule],
  template: `
    <header class="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <a routerLink="/" class="text-lg font-bold text-gray-900 dark:text-white">
        {{ 'nav.appName' | transloco }}
      </a>
      <nav class="flex items-center gap-4">
        @if (authService.currentUser()) {
          <a routerLink="/profile" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            {{ 'nav.profile' | transloco }}
          </a>
          <a routerLink="/sheets" class="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            {{ 'nav.sheets' | transloco }}
          </a>
          <button
            (click)="authService.logout()"
            class="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            {{ 'nav.logout' | transloco }}
          </button>
        }
        <button
          (click)="themeService.toggle()"
          aria-label="{{ 'nav.toggleTheme' | transloco }}"
          class="text-xl leading-none"
        >
          {{ themeService.isDark() ? '☀️' : '🌙' }}
        </button>
        <button
          (click)="langService.toggle()"
          class="text-sm font-medium px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
        >
          {{ 'nav.toggleLang' | transloco }}
        </button>
      </nav>
    </header>
    <main class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class App {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);
  readonly authService = inject(AuthService);
}
