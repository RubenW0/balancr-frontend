import type { CalendarItem, CalendarItemKind } from '../../types/calendarItem';

/**
 * Colour keys for calendar items. The colours themselves are tokens in
 * styles/tokens.css; WeekCalendar.css maps each key to its token through the
 * class `week-calendar-color-<key>`, so no colour values live in TypeScript.
 */
export type CalendarColorKey = 'class' | 'exam' | 'sport' | 'work' | 'other' | 'training' | 'study';

// Per kind: category (FIXED: event type, PLANNED: goal type) -> colour key.
const CATEGORY_COLORS: Record<CalendarItemKind, Record<string, CalendarColorKey>> = {
  FIXED: {
    school: 'class',
    class: 'class',
    exam: 'exam',
    sport: 'sport',
    work: 'work',
    other: 'other',
  },
  PLANNED: {
    training: 'training',
    study: 'study',
  },
};

// Used for unknown categories.
const KIND_COLORS: Record<CalendarItemKind, CalendarColorKey> = {
  FIXED: 'other',
  PLANNED: 'training',
};

export function getCalendarItemColorKey(item: CalendarItem): CalendarColorKey {
  const byCategory = item.category ? CATEGORY_COLORS[item.kind][item.category] : undefined;
  return byCategory ?? KIND_COLORS[item.kind];
}
