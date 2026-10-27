export type CalendarItemKind = 'FIXED' | 'PLANNED';

/**
 * Anything shown in the week calendar. The calendar only knows this type, so
 * every source (fixed events, planned sessions) is mapped to it.
 */
export interface CalendarItem {
  /** Id of the source record; unique per kind, not across kinds. */
  id: number;
  title: string;
  /** ISO LocalDateTime, e.g. 2026-10-19T09:00:00. */
  start: string;
  end: string;
  kind: CalendarItemKind;
  /** Optional sub-type used for colouring: the fixed event type ("class", "work") or the goal type ("training", "study"). */
  category?: string;
}
