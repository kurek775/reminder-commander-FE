import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  phone = signal('');
  saveMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  readonly authService = inject(AuthService);
  private readonly transloco = inject(TranslocoService);

  ngOnInit(): void {
    if (!this.authService.currentUser()) {
      this.authService.me();
    }
    this.phone.set(this.authService.currentUser()?.whatsapp_phone ?? '');
  }

  async onLinkWhatsapp(): Promise<void> {
    this.errorMessage.set(null);
    this.saveMessage.set(null);
    try {
      await this.authService.linkWhatsapp(this.phone());
      await this.authService.me();
      this.saveMessage.set(this.transloco.translate('auth.profile.phoneSaved'));
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        this.errorMessage.set(this.transloco.translate('auth.profile.phoneAlreadyTaken'));
      } else {
        this.errorMessage.set('Failed to link phone. Please try again.');
      }
    }
  }
}
