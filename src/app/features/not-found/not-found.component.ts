import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="max-w-md mx-auto px-6 py-24 text-center relative overflow-hidden">
      <div class="hero-glow opacity-30"></div>
      
      <div class="relative z-10">
        <h1 class="text-6xl font-bold gradient-text mb-6">404</h1>
        <h2 class="text-2xl font-bold text-gray-100 mb-4 tracking-tight">
          {{ 'notFound.title' | transloco }}
        </h2>
        <p class="text-sm text-gray-500 mb-10 font-medium">
          {{ 'notFound.message' | transloco }}
        </p>
        <a routerLink="/"
           class="inline-block px-8 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-[0.98]">
          {{ 'notFound.backHome' | transloco }}
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
