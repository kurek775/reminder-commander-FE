import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, TranslocoModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  phone = signal('');
  saveMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  readonly authService = inject(AuthService);
  private readonly transloco = inject(TranslocoService);
  private readonly toast = inject(ToastService);

  async ngOnInit(): Promise<void> {
    if (!this.authService.currentUser()) {
      await this.authService.me();
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
      this.toast.success(this.transloco.translate('toast.phoneSaved'));
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        this.errorMessage.set(this.transloco.translate('auth.profile.phoneAlreadyTaken'));
        this.toast.error(this.transloco.translate('toast.phoneAlreadyTaken'));
      } else {
        this.errorMessage.set(this.transloco.translate('auth.profile.phoneLinkFailed'));
        this.toast.error(this.transloco.translate('toast.phoneFailed'));
      }
    }
  }
}
