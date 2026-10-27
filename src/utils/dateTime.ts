// The backend uses LocalDateTime, so every date-time we send is local time
// without a time zone or "Z" (never use Date.toISOString() for that).

const pad = (value: number) => String(value).padStart(2, '0');

/** Date -> "2026-10-19" in local time. */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Date -> "2026-10-19T09:00:00" in local time. */
export function toLocalDateTimeString(date: Date): string {
  return `${toLocalDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Date or ISO LocalDateTime -> "2026-10-19T09:00", the value format of <input type="datetime-local">. */
export function toDateTimeInputValue(value: Date | string): string {
  return (typeof value === 'string' ? value : toLocalDateTimeString(value)).slice(0, 16);
}

/** "2026-10-19T09:00" from a datetime-local input -> "2026-10-19T09:00:00". */
export function fromDateTimeInputValue(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}
