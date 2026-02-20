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

  readonly authService = inject(AuthService);
  private readonly transloco = inject(TranslocoService);

  ngOnInit(): void {
    if (!this.authService.currentUser()) {
      this.authService.me();
    }
  }

  onLinkWhatsapp(): void {
    this.authService.linkWhatsapp(this.phone()).then(() => {
      this.saveMessage.set(this.transloco.translate('auth.profile.phoneSaved'));
    });
  }
}
