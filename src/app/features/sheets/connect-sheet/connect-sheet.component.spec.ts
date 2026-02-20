import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { ConnectSheetComponent } from './connect-sheet.component';
import en from '../../../../assets/i18n/en.json';
import cs from '../../../../assets/i18n/cs.json';

const translocoTesting = TranslocoTestingModule.forRoot({
  langs: { en, cs },
  translocoConfig: { availableLangs: ['en', 'cs'], defaultLang: 'en' },
  preloadLangs: true,
} as TranslocoTestingOptions);

describe('ConnectSheetComponent', () => {
  let httpClient: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    httpClient = { get: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConnectSheetComponent, translocoTesting],
      providers: [{ provide: HttpClient, useValue: httpClient }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ConnectSheetComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should disable button when URL is invalid', () => {
    const fixture = TestBed.createComponent(ConnectSheetComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    // Empty URL → invalid
    expect(component.isValidUrl()).toBe(false);

    // Valid sheet URL → valid
    component.sheetUrl.set(
      'https://docs.google.com/spreadsheets/d/abc123XYZ/edit',
    );
    expect(component.isValidUrl()).toBe(true);
  });
});
