import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
    });
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should default to light mode when no localStorage value', () => {
    const service = TestBed.runInInjectionContext(() => new ThemeService());
    expect(service.isDark()).toBe(false);
  });

  it('should initialize to dark mode when localStorage has "dark"', () => {
    localStorageMock['theme'] = 'dark';
    const service = TestBed.runInInjectionContext(() => new ThemeService());
    expect(service.isDark()).toBe(true);
  });

  it('should add dark class to documentElement when dark mode is enabled', () => {
    localStorageMock['theme'] = 'dark';
    const service = TestBed.runInInjectionContext(() => new ThemeService());
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should persist dark to localStorage when toggled on', () => {
    const service = TestBed.runInInjectionContext(() => new ThemeService());
    service.toggle();
    TestBed.flushEffects();
    expect(localStorageMock['theme']).toBe('dark');
  });

  it('should remove dark class and persist light after double toggle', () => {
    const service = TestBed.runInInjectionContext(() => new ThemeService());
    service.toggle();
    TestBed.flushEffects();
    service.toggle();
    TestBed.flushEffects();
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorageMock['theme']).toBe('light');
  });
});
