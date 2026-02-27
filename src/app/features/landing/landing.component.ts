import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { AuthService } from '../../core/auth/auth.service';
import { TokenService } from '../../core/auth/token.service';

@Component({
  selector: 'app-landing',
  imports: [TranslocoModule],
  templateUrl: './landing.component.html',
  styles: `
    :host { display: block; }
    .anim-fade-1 { @apply animate-fade-up; }
    .anim-fade-2 { @apply animate-fade-up [animation-delay:0.15s]; }
    .anim-fade-3 { @apply animate-fade-up [animation-delay:0.3s]; }
    .anim-fade-4 { @apply animate-fade-up [animation-delay:0.45s]; }
    .anim-fade-5 { @apply animate-fade-up [animation-duration:1s] [animation-delay:0.4s]; }
  `,
})
export class LandingComponent {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  constructor() {
    if (!this.tokenService.isTokenExpired()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onGetStarted(): void {
    this.authService.login();
  }
}
