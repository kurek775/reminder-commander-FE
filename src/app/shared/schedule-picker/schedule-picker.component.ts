import { Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';

import {
  buildCron,
  HOUR_OPTIONS,
  INTERVAL_OPTIONS,
  padHour,
  ScheduleType,
} from '../cron-utils';

@Component({
  selector: 'app-schedule-picker',
  imports: [FormsModule, TranslocoModule],
  templateUrl: './schedule-picker.component.html',
})
export class SchedulePickerComponent {
  scheduleType = model<ScheduleType>('daily');
  scheduleHour = model(8);
  scheduleDay = model(1);
  scheduleInterval = model(3);

  cronExpression = computed(() =>
    buildCron(this.scheduleType(), this.scheduleHour(), this.scheduleDay(), this.scheduleInterval()),
  );

  readonly hourOptions = HOUR_OPTIONS;
  readonly intervalOptions = INTERVAL_OPTIONS;
  readonly padHour = padHour;
}
