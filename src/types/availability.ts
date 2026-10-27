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
