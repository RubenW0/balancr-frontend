import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import { useAvailability } from '../hooks/useAvailability';
import * as availabilityService from '../services/availabilityService';
import { ApiError } from '../services/apiClient';
import type { AvailabilityWindow, DayOfWeek } from '../types/availability';
import './AvailabilityPage.css';

const DAYS: { day: DayOfWeek; label: string }[] = [
  { day: 'MONDAY', label: 'Monday' },
  { day: 'TUESDAY', label: 'Tuesday' },
  { day: 'WEDNESDAY', label: 'Wednesday' },
  { day: 'THURSDAY', label: 'Thursday' },
  { day: 'FRIDAY', label: 'Friday' },
  { day: 'SATURDAY', label: 'Saturday' },
  { day: 'SUNDAY', label: 'Sunday' },
];

// The backend's window for a weekday without a stored row (AvailabilityService.DEFAULT_START/END).
const DEFAULT_START = '08:00';
const DEFAULT_END = '22:00';

const CLOSED_DAY_NOTE =
  "Days can't be switched off yet: the server has no way to store a day without planning, and a day without hours falls back to 08:00-22:00.";

/** One editable weekday; times are <input type="time"> values ("08:00"). */
interface DayRow {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

function toRows(windows: AvailabilityWindow[]): DayRow[] {
  return DAYS.map(({ day }) => {
    const window = windows.find((w) => w.dayOfWeek === day);
    return {
      day,
      startTime: window ? window.startTime.slice(0, 5) : DEFAULT_START,
      endTime: window ? window.endTime.slice(0, 5) : DEFAULT_END,
    };
  });
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function rowError(row: DayRow): string | null {
  if (!row.startTime || !row.endTime) return 'Enter a start and end time.';
  // "HH:mm" strings compare correctly as text.
  if (row.endTime <= row.startTime) return 'End time must be after start time.';
  return null;
}

function formatHours(minutes: number): string {
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export function AvailabilityPage() {
  const { windows, error, isLoading, reload } = useAvailability();

  if (isLoading || error) {
    return (
      <section className="page availability-page">
        <header className="page-header">
          <h1>Availability</h1>
        </header>
        {error ? <ErrorBanner message={error} onRetry={reload} /> : <p className="muted">Loading availability...</p>}
      </section>
    );
  }

  return <AvailabilityEditor initialWindows={windows} />;
}

/** Mounted once the week has loaded, so its state starts from the loaded windows. */
function AvailabilityEditor({ initialWindows }: { initialWindows: AvailabilityWindow[] }) {
  const [rows, setRows] = useState(() => toRows(initialWindows));
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const totalMinutes = rows.reduce(
    (sum, row) => sum + (rowError(row) ? 0 : toMinutes(row.endTime) - toMinutes(row.startTime)),
    0,
  );

  const updateRow = (day: DayOfWeek, changes: Partial<DayRow>) => {
    setRows((prev) => prev.map((row) => (row.day === day ? { ...row, ...changes } : row)));
    setIsSaved(false);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    setIsSaved(false);
    if (rows.some((row) => rowError(row))) return;

    setSaveError(null);
    setIsSaving(true);
    try {
      // Every day is sent: a day left out would keep its stored window, not become closed.
      const saved = await availabilityService.saveAvailability(
        rows.map((row) => ({ dayOfWeek: row.day, startTime: `${row.startTime}:00`, endTime: `${row.endTime}:00` })),
      );
      setRows(toRows(saved));
      setShowErrors(false);
      setIsSaved(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Unknown error while saving availability.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="page availability-page" onSubmit={handleSave} noValidate>
      <header className="page-header">
        <h1>Availability</h1>
        <span className="page-summary">{formatHours(totalMinutes)} available per week</span>
        <div className="page-actions">
          <button type="submit" className="button button--primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>
      <p className="page-description">
        The planner only schedules goals inside these hours. Fixed events block time on top of this.
      </p>

      <div className="availability-messages" aria-live="polite">
        {saveError && <ErrorBanner message={saveError} />}
        {isSaved && <p className="banner banner--success">Availability saved.</p>}
      </div>

      <ul className="card availability-list">
        {rows.map((row) => {
          const label = DAYS.find((d) => d.day === row.day)!.label;
          const error = showErrors ? rowError(row) : null;
          const errorId = `availability-${row.day}-error`;
          const start = toMinutes(row.startTime || DEFAULT_START);
          const end = toMinutes(row.endTime || DEFAULT_END);

          return (
            <li key={row.day} className="availability-row">
              <span className="availability-day">{label}</span>
              <div className="availability-times">
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateRow(row.day, { startTime: e.target.value })}
                  aria-label={`${label} start time`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  disabled={isSaving}
                />
                <span className="availability-dash" aria-hidden="true">
                  -
                </span>
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateRow(row.day, { endTime: e.target.value })}
                  aria-label={`${label} end time`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  disabled={isSaving}
                />
              </div>
              <div className="availability-timeline" aria-hidden="true">
                {end > start && (
                  <span
                    className="availability-timeline-fill"
                    style={{ left: `${(start / 1440) * 100}%`, width: `${((end - start) / 1440) * 100}%` }}
                  />
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked="true"
                aria-label={`Plan on ${label}`}
                className="switch"
                title={CLOSED_DAY_NOTE}
                disabled
              />
              {error && (
                <p id={errorId} className="field-error availability-error">
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="availability-note">{CLOSED_DAY_NOTE}</p>
    </form>
  );
}
