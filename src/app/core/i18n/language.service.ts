import { Injectable, effect, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  lang = signal<'en' | 'cs'>(
    (localStorage.getItem('lang') as 'en' | 'cs') ?? 'en',
  );

  constructor(private readonly transloco: TranslocoService) {
    effect(() => {
      this.transloco.setActiveLang(this.lang());
      localStorage.setItem('lang', this.lang());
    });
  }

  toggle(): void {
    this.lang.update((v) => (v === 'en' ? 'cs' : 'en'));
  }
}
