import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should add dark class on construction', () => {
    TestBed.runInInjectionContext(() => new ThemeService());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
