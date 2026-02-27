import { Injectable, effect, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

function readLang(): 'en' | 'cs' {
  try {
    const stored = localStorage.getItem('lang');
    return stored === 'cs' ? 'cs' : 'en';
  } catch {
    return 'en';
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  lang = signal<'en' | 'cs'>(readLang());

  constructor(private readonly transloco: TranslocoService) {
    effect(() => {
      this.transloco.setActiveLang(this.lang());
      try {
        localStorage.setItem('lang', this.lang());
      } catch {
        // localStorage unavailable (SSR)
      }
    });
  }

  toggle(): void {
    this.lang.update((v) => (v === 'en' ? 'cs' : 'en'));
  }
}
