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
    .anim-fade-1 { animation: fade-up 0.8s ease both; }
    .anim-fade-2 { animation: fade-up 0.8s ease 0.15s both; }
    .anim-fade-3 { animation: fade-up 0.8s ease 0.3s both; }
    .anim-fade-4 { animation: fade-up 0.8s ease 0.45s both; }
    .anim-fade-5 { animation: fade-up 1s ease 0.4s both; }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
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
