export type ScheduleType = 'daily' | 'weekly' | 'hourly';

export interface ParsedCron {
  type: ScheduleType;
  hour: number;
  day: number;
  interval: number;
}

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
export const INTERVAL_OPTIONS = [1, 2, 3, 4, 6, 8, 12];

export function padHour(h: number): string {
  return String(h).padStart(2, '0') + ':00';
}

export function buildCron(type: ScheduleType, hour: number, day: number, interval: number): string {
  switch (type) {
    case 'daily':
      return `0 ${hour} * * *`;
    case 'weekly':
      return `0 ${hour} * * ${day}`;
    case 'hourly':
      return `0 */${interval} * * *`;
  }
}

export function parseCron(cron: string): ParsedCron {
  let m: RegExpMatchArray | null;
  if ((m = cron.match(/^0 (\d+) \* \* (\d)$/))) {
    return { type: 'weekly', hour: Number(m[1]), day: Number(m[2]), interval: 3 };
  }
  if ((m = cron.match(/^0 (\d+) \* \* \*$/))) {
    return { type: 'daily', hour: Number(m[1]), day: 1, interval: 3 };
  }
  if ((m = cron.match(/^0 \*\/(\d+) \* \* \*$/))) {
    return { type: 'hourly', hour: 8, day: 1, interval: Number(m[1]) };
  }
  return { type: 'daily', hour: 8, day: 1, interval: 3 };
}

export function cronToHuman(cron: string): string {
  let m: RegExpMatchArray | null;
  if ((m = cron.match(/^0 (\d+) \* \* (\d)$/))) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `Every ${days[Number(m[2])]} at ${String(m[1]).padStart(2, '0')}:00`;
  }
  if ((m = cron.match(/^0 (\d+) \* \* \*$/))) {
    return `Daily at ${String(m[1]).padStart(2, '0')}:00`;
  }
  if ((m = cron.match(/^0 \*\/(\d+) \* \* \*$/))) {
    return `Every ${m[1]} hours`;
  }
  return cron;
}
