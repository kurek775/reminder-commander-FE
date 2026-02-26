import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

export interface UserResponse {
  id: string;
  email: string;
  display_name: string;
  picture_url?: string;
  whatsapp_phone?: string;
  whatsapp_verified: boolean;
  is_active: boolean;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<UserResponse | null>(null);

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  constructor() {
    if (!this.tokenService.isTokenExpired()) {
      this.me().catch(() => this.tokenService.clearTokens());
    }
  }
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;

  async login(): Promise<void> {
    const response = await firstValueFrom(
      this.http.get<{ auth_url: string }>(`${this.apiUrl}/google`),
    );
    window.location.href = response.auth_url;
  }

  async exchangeCode(code: string): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.apiUrl}/exchange`, { code }),
    );
    this.tokenService.setTokens(tokens.access_token, tokens.refresh_token);
    await this.me();
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {
          refresh_token: refreshToken,
        }),
      );
      this.tokenService.setTokens(tokens.access_token, tokens.refresh_token);
      return true;
    } catch {
      this.tokenService.clearTokens();
      return false;
    }
  }

  async me(): Promise<void> {
    const user = await firstValueFrom(
      this.http.get<UserResponse>(`${this.apiUrl}/me`),
    );
    this.currentUser.set(user);
  }

  async linkWhatsapp(phone: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}/whatsapp/link`, { phone }),
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
