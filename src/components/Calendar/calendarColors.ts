import type { CalendarItem, CalendarItemKind } from '../../types/calendarItem';

// Items get a colour per category (FIXED: event type, PLANNED: goal type); unknown ones fall back to the kind's colour.
const CATEGORY_COLORS: Partial<Record<CalendarItemKind, Record<string, string>>> = {
  FIXED: {
    class: '#2563eb',
    work: '#d97706',
    exam: '#dc2626',
    other: '#64748b',
  },
  // Two greens, so planned sessions stay recognisable as one kind.
  PLANNED: {
    training: '#16a34a',
    study: '#4d7c0f',
  },
};

const KIND_COLORS: Record<CalendarItemKind, string> = {
  FIXED: '#0d9488',
  PLANNED: '#16a34a',
};

export function getCalendarItemColor(item: CalendarItem): string {
  const byCategory = item.category ? CATEGORY_COLORS[item.kind]?.[item.category] : undefined;
  return byCategory ?? KIND_COLORS[item.kind];
}
