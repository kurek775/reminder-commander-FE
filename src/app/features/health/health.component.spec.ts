import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { HealthComponent } from './health.component';
import { HealthService, HealthResponse } from './health.service';
import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('HealthComponent', () => {
  let component: HealthComponent;
  let fixture: ComponentFixture<HealthComponent>;
  let getHealthMock: ReturnType<typeof vi.fn>;

  const mockHealth: HealthResponse = {
    status: 'ok',
    message: 'Hello from Reminder Commander!',
    version: '1.0.0',
  };

  beforeEach(async () => {
    getHealthMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [HealthComponent, translocoTesting],
      providers: [
        {
          provide: HealthService,
          useValue: { getHealth: getHealthMock },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    getHealthMock.mockReturnValue(of(mockHealth));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display health data on success', async () => {
    getHealthMock.mockReturnValue(of(mockHealth));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(mockHealth.message);
    expect(component.health()).toEqual(mockHealth);
    expect(component.isLoading()).toBe(false);
  });

  it('should show error message on failure', async () => {
    const errorMsg = 'Http failure response';
    getHealthMock.mockReturnValue(throwError(() => new Error(errorMsg)));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.errorMessage()).toBe(errorMsg);
    expect(component.isLoading()).toBe(false);
    expect(component.health()).toBeNull();
  });

  it('should have loading state true initially before service resolves', () => {
    getHealthMock.mockReturnValue(of(mockHealth));
    // Before detectChanges (ngOnInit), isLoading should be true
    expect(component.isLoading()).toBe(true);
  });
});
