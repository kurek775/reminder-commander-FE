import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { SheetsListComponent, SheetIntegration } from './sheets-list.component';
import en from '../../../../assets/i18n/en.json';
import cs from '../../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('SheetsListComponent', () => {
  let httpClient: { get: ReturnType<typeof vi.fn> };

  const mockSheets: SheetIntegration[] = [
    {
      id: 'sheet-1',
      user_id: 'user-1',
      google_sheet_id: 'abc123',
      sheet_name: 'Health Tracker',
      is_active: true,
    },
  ];

  beforeEach(async () => {
    httpClient = { get: vi.fn().mockReturnValue(of(mockSheets)) };

    await TestBed.configureTestingModule({
      imports: [SheetsListComponent, translocoTesting],
      providers: [{ provide: HttpClient, useValue: httpClient }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SheetsListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load and display sheets', async () => {
    const fixture = TestBed.createComponent(SheetsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.sheets()).toEqual(mockSheets);
    expect(fixture.nativeElement.textContent).toContain('Health Tracker');
  });
});
