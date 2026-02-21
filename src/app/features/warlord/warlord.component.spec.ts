import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { WarlordComponent } from './warlord.component';
import { WarlordService } from './warlord.service';

import en from '../../../assets/i18n/en.json';
import cs from '../../../assets/i18n/cs.json';

function buildTestingModule() {
  return TestBed.configureTestingModule({
    imports: [
      WarlordComponent,
      TranslocoTestingModule.forRoot({ langs: { en, cs }, preloadLangs: true }),
    ],
    providers: [provideHttpClient(), provideHttpClientTesting(), WarlordService],
  });
}

describe('WarlordComponent', () => {
  let fixture: ComponentFixture<WarlordComponent>;
  let component: WarlordComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    buildTestingModule();
    fixture = TestBed.createComponent(WarlordComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', async () => {
    fixture.detectChanges();
    http.expectOne((req) => req.url.includes('/rules/')).flush([]);
    http.expectOne((req) => req.url.includes('/sheets/')).flush([]);
    http.expectOne((req) => req.url.includes('/interactions/')).flush([]);
    expect(component).toBeTruthy();
  });

  it('should initialise with empty rules and logs', async () => {
    fixture.detectChanges();
    http.expectOne((req) => req.url.includes('/rules/')).flush([]);
    http.expectOne((req) => req.url.includes('/sheets/')).flush([]);
    http.expectOne((req) => req.url.includes('/interactions/')).flush([]);
    expect(component.rules()).toEqual([]);
    expect(component.logs()).toEqual([]);
  });

  it('isFormValid should be false when fields are empty', () => {
    expect(component.isFormValid()).toBe(false);
  });

  it('isFormValid should be true when name and sheet are set', () => {
    component.formName.set('My Rule');
    component.formSheetId.set('sheet-uuid');
    expect(component.isFormValid()).toBe(true);
  });

  it('cronExpression should generate correct daily cron', () => {
    component.scheduleType.set('daily');
    component.scheduleHour.set(9);
    expect(component.cronExpression()).toBe('0 9 * * *');
  });

  it('showForm should toggle on toggleForm()', () => {
    expect(component.showForm()).toBe(false);
    component.toggleForm();
    expect(component.showForm()).toBe(true);
    component.toggleForm();
    expect(component.showForm()).toBe(false);
  });
});
