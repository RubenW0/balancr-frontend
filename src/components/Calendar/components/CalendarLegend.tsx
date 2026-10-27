import type { CalendarColorKey } from '../calendarColors';
import '../styles/CalendarLegend.css';

interface LegendEntry {
  label: string;
  color: CalendarColorKey;
}

const ENTRIES: LegendEntry[] = [
  { label: 'Fixed', color: 'class' },
  { label: 'Training', color: 'training' },
  { label: 'Study', color: 'study' },
];

/** Compact legend for the calendar's top bar; dots reuse the calendar's colour classes. */
export function CalendarLegend() {
  return (
    <ul className="calendar-legend" aria-label="Legend">
      {ENTRIES.map((entry) => (
        <li key={entry.label} className="calendar-legend-item">
          <span className={`calendar-legend-dot week-calendar-color-${entry.color}`} aria-hidden="true" />
          {entry.label}
        </li>
      ))}
    </ul>
  );
}
