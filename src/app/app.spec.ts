import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme/theme.service';
import { LanguageService } from './core/i18n/language.service';
import en from '../assets/i18n/en.json';
import cs from '../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('App', () => {
  beforeEach(async () => {
    const authService = {
      currentUser: signal(null),
      logout: vi.fn(),
      login: vi.fn(),
    };
    const themeService = {};
    const langService = {
      lang: signal('en'),
      toggle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App, RouterModule.forRoot([]), translocoTesting],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ThemeService, useValue: themeService },
        { provide: LanguageService, useValue: langService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
