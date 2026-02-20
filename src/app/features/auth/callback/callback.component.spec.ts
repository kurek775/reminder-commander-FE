import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { CallbackComponent } from './callback.component';
import { AuthService } from '../../../core/auth/auth.service';
import en from '../../../../assets/i18n/en.json';
import cs from '../../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('CallbackComponent', () => {
  let authService: { handleCallback: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let activatedRoute: { snapshot: { queryParamMap: { get: ReturnType<typeof vi.fn> } } };

  const setup = async (token: string | null) => {
    authService = { handleCallback: vi.fn().mockResolvedValue(undefined) };
    router = { navigate: vi.fn().mockResolvedValue(true) };
    activatedRoute = { snapshot: { queryParamMap: { get: vi.fn().mockReturnValue(token) } } };

    await TestBed.configureTestingModule({
      imports: [CallbackComponent, translocoTesting],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    return TestBed.createComponent(CallbackComponent);
  };

  it('should call handleCallback and navigate to /profile when token present', async () => {
    const fixture = await setup('test-jwt-token');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authService.handleCallback).toHaveBeenCalledWith('test-jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should navigate to /login when no token', async () => {
    const fixture = await setup(null);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
