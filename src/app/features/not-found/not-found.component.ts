import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="max-w-md mx-auto px-6 py-24 text-center">
      <h1 class="text-3xl font-bold text-gray-100 mb-4">
        {{ 'notFound.title' | transloco }}
      </h1>
      <p class="text-sm text-gray-400 mb-8">
        {{ 'notFound.message' | transloco }}
      </p>
      <a routerLink="/dashboard"
         class="inline-block px-5 py-2.5 text-sm font-medium rounded-md bg-gradient-to-r from-cyan-500 to-violet-500 text-white transition-colors">
        {{ 'notFound.backHome' | transloco }}
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
