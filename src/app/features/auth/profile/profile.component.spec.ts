import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { ProfileComponent } from './profile.component';
import { AuthService, UserResponse } from '../../../core/auth/auth.service';
import en from '../../../../assets/i18n/en.json';
import cs from '../../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('ProfileComponent', () => {
  const mockUser: UserResponse = {
    id: 'user-123',
    email: 'test@example.com',
    display_name: 'Test User',
    whatsapp_verified: false,
    is_active: true,
  };

  let authService: {
    currentUser: ReturnType<typeof signal<UserResponse | null>>;
    me: ReturnType<typeof vi.fn>;
    linkWhatsapp: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      currentUser: signal<UserResponse | null>(mockUser),
      me: vi.fn().mockResolvedValue(undefined),
      linkWhatsapp: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, translocoTesting],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display user info', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test User');
    expect(fixture.nativeElement.textContent).toContain('test@example.com');
  });

  it('should call linkWhatsapp when form is submitted', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.componentInstance.phone.set('+48123456789');
    fixture.componentInstance.onLinkWhatsapp();
    expect(authService.linkWhatsapp).toHaveBeenCalledWith('+48123456789');
  });
});
