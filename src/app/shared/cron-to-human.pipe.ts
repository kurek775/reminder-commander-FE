import { Pipe, PipeTransform } from '@angular/core';
import { cronToHuman } from './cron-utils';

@Pipe({ name: 'cronToHuman' })
export class CronToHumanPipe implements PipeTransform {
  transform(cron: string): string {
    return cronToHuman(cron);
  }
}
