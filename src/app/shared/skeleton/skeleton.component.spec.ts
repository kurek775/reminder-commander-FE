import { TestBed } from '@angular/core/testing';

import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 3 skeleton cards by default', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.animate-pulse');
    expect(cards.length).toBe(3);
  });

  it('should render custom number of cards', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.animate-pulse');
    expect(cards.length).toBe(5);
  });
});
