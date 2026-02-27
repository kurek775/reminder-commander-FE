import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [TranslocoModule],
  templateUrl: './login.component.html',
  styles: [`
    .gradient-text {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  onSignIn(): void {
    this.authService.login();
  }
}
