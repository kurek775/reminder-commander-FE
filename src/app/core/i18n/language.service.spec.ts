import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let localStorageMock: Record<string, string>;
  let setActiveLang: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorageMock = {};
    setActiveLang = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
    });

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        {
          provide: TranslocoService,
          useValue: { setActiveLang },
        },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should default to "en" when no localStorage value', () => {
    const service = TestBed.inject(LanguageService);
    expect(service.lang()).toBe('en');
  });

  it('should initialize to "cs" when localStorage has "cs"', () => {
    localStorageMock['lang'] = 'cs';
    const service = TestBed.runInInjectionContext(() =>
      new LanguageService(TestBed.inject(TranslocoService)),
    );
    expect(service.lang()).toBe('cs');
  });

  it('should toggle from "en" to "cs"', () => {
    const service = TestBed.inject(LanguageService);
    service.toggle();
    expect(service.lang()).toBe('cs');
  });

  it('should call setActiveLang when effect runs', () => {
    const service = TestBed.inject(LanguageService);
    TestBed.flushEffects();
    expect(setActiveLang).toHaveBeenCalledWith('en');
  });

  it('should persist lang to localStorage', () => {
    const service = TestBed.inject(LanguageService);
    TestBed.flushEffects();
    expect(localStorageMock['lang']).toBe('en');
  });

  it('should call setActiveLang with "cs" after toggle', () => {
    const service = TestBed.inject(LanguageService);
    service.toggle();
    TestBed.flushEffects();
    expect(setActiveLang).toHaveBeenCalledWith('cs');
    expect(localStorageMock['lang']).toBe('cs');
  });

  it('should toggle back from "cs" to "en"', () => {
    const service = TestBed.inject(LanguageService);
    service.toggle();
    service.toggle();
    expect(service.lang()).toBe('en');
  });
});
