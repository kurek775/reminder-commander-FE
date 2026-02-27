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
    /* ===== Custom animations ===== */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    :host { display: block; }

    .anim-float { animation: float 6s ease-in-out infinite; }

    .anim-fade-1 { animation: fade-up 0.8s ease both; }
    .anim-fade-2 { animation: fade-up 0.8s ease 0.15s both; }
    .anim-fade-3 { animation: fade-up 0.8s ease 0.3s both; }
    .anim-fade-4 { animation: fade-up 0.8s ease 0.45s both; }
    .anim-fade-5 { animation: fade-up 1s ease 0.4s both; }

    .gradient-text {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gold-text {
      background: linear-gradient(180deg, #fbbf24, #d97706);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gradient-border-top {
      position: relative;
    }
    .gradient-border-top::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .gradient-border-top:hover::before { opacity: 1; }

    .hero-glow {
      position: absolute;
      top: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }
    .hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(30,30,46,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30,30,46,0.3) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
      pointer-events: none;
    }
    .cta-glow {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 400px;
      background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.03) 40%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
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
