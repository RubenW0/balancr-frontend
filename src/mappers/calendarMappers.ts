import type { BusinessHoursInput } from '@fullcalendar/core';
import type { AvailabilityWindow, DayOfWeek } from '../types/availability';
import type { CalendarItem } from '../types/calendarItem';
import type { FixedEvent } from '../types/fixedEvent';
import type { ScheduledSessionDTO } from '../types/plan';

export function fixedEventToCalendarItem(event: FixedEvent): CalendarItem {
  return {
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    kind: 'FIXED',
    category: event.type.toLowerCase(),
  };
}

/** Planned sessions have no id of their own, so the index in the plan is used. */
export function scheduledSessionToCalendarItem(session: ScheduledSessionDTO, index: number): CalendarItem {
  return {
    id: index,
    title: `${session.goalName} #${session.sessionNumber}`,
    start: session.start,
    end: session.end,
    kind: 'PLANNED',
    category: session.type.toLowerCase(),
  };
}

// The API uses MONDAY..SUNDAY, FullCalendar uses 0 (Sunday) to 6 (Saturday).
const FULLCALENDAR_DAY: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/** Each availability window becomes the business hours of its weekday; the rest is greyed out. */
export function availabilityToBusinessHours(windows: AvailabilityWindow[]): BusinessHoursInput {
  return windows.map((window) => ({
    daysOfWeek: [FULLCALENDAR_DAY[window.dayOfWeek]],
    startTime: window.startTime,
    // An end of 00:00 means "until midnight".
    endTime: window.endTime === '00:00:00' ? '24:00:00' : window.endTime,
  }));
}
