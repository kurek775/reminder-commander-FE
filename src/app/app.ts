import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { ThemeService } from './core/theme/theme.service';
import { LanguageService } from './core/i18n/language.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <header class="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          <a routerLink="/" class="flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900 dark:text-white shrink-0">
            <span class="text-indigo-600 dark:text-indigo-500 select-none">◆</span>
            {{ 'nav.appName' | transloco }}
          </a>

          <nav class="flex items-center gap-1">
            @if (authService.currentUser()) {
              <a routerLink="/profile" routerLinkActive="text-indigo-600 dark:text-indigo-400"
                 class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {{ 'nav.profile' | transloco }}
              </a>
              <a routerLink="/sheets" routerLinkActive="text-indigo-600 dark:text-indigo-400"
                 class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {{ 'nav.sheets' | transloco }}
              </a>
              <button (click)="authService.logout()"
                      class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {{ 'nav.logout' | transloco }}
              </button>
              <div class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            }

            <button (click)="themeService.toggle()"
                    [title]="'nav.toggleTheme' | transloco"
                    class="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base">
              {{ themeService.isDark() ? '☀️' : '🌙' }}
            </button>

            <button (click)="langService.toggle()"
                    class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
              {{ 'nav.toggleLang' | transloco }}
            </button>
          </nav>

        </div>
      </header>

      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [],
})
export class App {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);
  readonly authService = inject(AuthService);
}
