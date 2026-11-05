export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/**
 * One weekday of the user's availability. id is null for a day without a saved row (default window).
 * A closed day is not planned on but still carries its times: the ones it gets back when reopened.
 */
export interface AvailabilityWindow {
  id: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  closed: boolean;
  userId: number;
}

/**
 * Body item for PUT /availability. Times are LocalTime strings ("08:00:00") and required for an open day;
 * a closed day ignores them and keeps the stored ones. Weekdays left out of the request keep their stored window.
 */
export interface AvailabilityWindowRequestDTO {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  closed: boolean;
}
