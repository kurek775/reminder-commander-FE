import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { ThemeService } from './core/theme/theme.service';
import { LanguageService } from './core/i18n/language.service';
import { AuthService } from './core/auth/auth.service';
import { ToastComponent } from './shared/toast/toast.component';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule, ToastComponent, ConfirmModalComponent],
  template: `
    <div class="min-h-screen bg-gray-950 text-gray-100">
      <header class="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

          <!-- Logo -->
          <a [routerLink]="authService.currentUser() ? '/dashboard' : '/'" class="flex items-center gap-2.5 text-base font-bold tracking-widest select-none shrink-0">
            <svg class="w-7 h-7 shrink-0" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="nb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>
                <linearGradient id="ng" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
              </defs>
              <polygon points="32,8 52,18 52,38 32,48 12,38 12,18" fill="none" stroke="url(#nb)" stroke-width="2" opacity="0.3"/>
              <line x1="32" y1="10" x2="32" y2="56" stroke="url(#nb)" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
              <line x1="26" y1="16" x2="26" y2="50" stroke="url(#nb)" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
              <line x1="38" y1="16" x2="38" y2="50" stroke="url(#nb)" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
              <polygon points="32,6 27,18 32,15 37,18" fill="url(#ng)"/>
              <path d="M10,36 Q32,20 54,36" fill="none" stroke="url(#nb)" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="32" cy="6" r="2" fill="#fbbf24" opacity="0.8"/>
            </svg>
            <span class="gradient-text">BIFROST</span>
          </a>

          <!-- Desktop nav -->
          <nav class="hidden md:flex items-center gap-1.5">
            @if (isLandingPage()) {
              <!-- Landing links -->
              <a href="#features" class="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">{{ 'landing.nav.features' | transloco }}</a>
              <a href="#how-it-works" class="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">{{ 'landing.nav.howItWorks' | transloco }}</a>
              <a href="#bridge" class="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">{{ 'landing.nav.bridge' | transloco }}</a>
              <div class="w-px h-4 bg-gray-700 mx-1"></div>
              <button (click)="langService.toggle()"
                      class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700">
                {{ 'nav.toggleLang' | transloco }}
              </button>
              <button (click)="onGetStarted()"
                      class="ml-2 px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                {{ 'landing.nav.getStarted' | transloco }}
              </button>
            } @else if (authService.currentUser()) {
              <!-- App links -->
              <a routerLink="/dashboard" routerLinkActive="text-cyan-400" [routerLinkActiveOptions]="{exact: true}"
                 class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.dashboard' | transloco }}
              </a>
              <a routerLink="/profile" routerLinkActive="text-cyan-400"
                 class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.profile' | transloco }}
              </a>
              <a routerLink="/sheets" routerLinkActive="text-cyan-400"
                 class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.sheets' | transloco }}
              </a>
              <a routerLink="/rules" routerLinkActive="text-cyan-400"
                 class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.rules' | transloco }}
              </a>
              <a routerLink="/warlord" routerLinkActive="text-cyan-400"
                 class="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.warlord' | transloco }}
              </a>
              <button (click)="authService.logout()"
                      class="px-4 py-2 text-sm text-gray-400 hover:text-red-400 rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.logout' | transloco }}
              </button>
              <div class="w-px h-4 bg-gray-700 mx-1"></div>
              <button (click)="langService.toggle()"
                      class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700">
                {{ 'nav.toggleLang' | transloco }}
              </button>
            } @else {
              <!-- Not logged in, not landing (login/callback/health) -->
              <button (click)="langService.toggle()"
                      class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700">
                {{ 'nav.toggleLang' | transloco }}
              </button>
            }
          </nav>

          <!-- Mobile hamburger -->
          <button
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            [attr.aria-label]="'nav.toggleMenu' | transloco"
            [attr.aria-expanded]="mobileMenuOpen()">
            @if (mobileMenuOpen()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>

        <!-- Mobile drawer -->
        @if (mobileMenuOpen()) {
          <nav class="md:hidden border-t border-white/5 bg-gray-950/95 backdrop-blur-xl px-6 py-4 space-y-1">
            @if (isLandingPage()) {
              <a href="#features" (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'landing.nav.features' | transloco }}
              </a>
              <a href="#how-it-works" (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'landing.nav.howItWorks' | transloco }}
              </a>
              <a href="#bridge" (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'landing.nav.bridge' | transloco }}
              </a>
              <div class="h-px bg-gray-700 my-2"></div>
              <button (click)="langService.toggle()"
                      class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700">
                {{ 'nav.toggleLang' | transloco }}
              </button>
              <button (click)="onGetStarted(); mobileMenuOpen.set(false)"
                      class="block w-full mt-2 px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-center transition-all">
                {{ 'landing.nav.getStarted' | transloco }}
              </button>
            } @else if (authService.currentUser()) {
              <a routerLink="/dashboard" routerLinkActive="text-cyan-400" [routerLinkActiveOptions]="{exact: true}"
                 (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.dashboard' | transloco }}
              </a>
              <a routerLink="/profile" routerLinkActive="text-cyan-400"
                 (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.profile' | transloco }}
              </a>
              <a routerLink="/sheets" routerLinkActive="text-cyan-400"
                 (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.sheets' | transloco }}
              </a>
              <a routerLink="/rules" routerLinkActive="text-cyan-400"
                 (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.rules' | transloco }}
              </a>
              <a routerLink="/warlord" routerLinkActive="text-cyan-400"
                 (click)="mobileMenuOpen.set(false)"
                 class="block px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.warlord' | transloco }}
              </a>
              <button (click)="authService.logout(); mobileMenuOpen.set(false)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-red-400 rounded-md hover:bg-white/5 transition-colors">
                {{ 'nav.logout' | transloco }}
              </button>
              <div class="h-px bg-gray-700 my-2"></div>
              <button (click)="langService.toggle()"
                      class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700">
                {{ 'nav.toggleLang' | transloco }}
              </button>
            } @else {
              <button (click)="langService.toggle()"
                      class="px-2.5 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-gray-700">
                {{ 'nav.toggleLang' | transloco }}
              </button>
            }
          </nav>
        }
      </header>

      <main>
        <router-outlet />
      </main>
    </div>
    <app-toast />
    <app-confirm-modal />
  `,
  styles: [],
})
export class App {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);
  readonly authService = inject(AuthService);
  readonly isLandingPage = signal(
    typeof window !== 'undefined' && window.location.pathname === '/'
  );
  readonly mobileMenuOpen = signal(false);

  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isLandingPage.set(e.urlAfterRedirects === '/');
        this.mobileMenuOpen.set(false);
      });
  }

  onGetStarted(): void {
    this.authService.login();
  }
}
