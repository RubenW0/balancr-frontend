export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

/** One weekday of the user's availability. id is null for a day without a saved row (default window). */
export interface AvailabilityWindow {
  id: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  userId: number;
}

/**
 * Body item for PUT /availability. Times are LocalTime strings ("08:00:00").
 * Weekdays left out of the request keep their stored window; there is no way to mark a day as closed.
 */
export interface AvailabilityWindowRequestDTO {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}
