import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

/**
 * One editable weekday; times are <input type="time"> values ("08:00").
 * A closed day keeps its times, so switching it on again brings them back.
 */
interface DayRow {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  closed: boolean;
}

/** Simple: one "Plan between" line for the whole week. Per day: a row per weekday with an on/off toggle. */
type Mode = 'simple' | 'perDay';

function toRows(windows: AvailabilityWindow[]): DayRow[] {
  return DAYS.map(({ day }) => {
    const window = windows.find((w) => w.dayOfWeek === day);
    return {
      day,
      startTime: window ? window.startTime.slice(0, 5) : DEFAULT_START,
      endTime: window ? window.endTime.slice(0, 5) : DEFAULT_END,
      closed: window?.closed ?? false,
    };
  });
}

/**
 * True when every day is open with the same hours, so the simple mode shows the week without losing anything.
 * A week that was never customised gets the same default window on every day, so it counts too.
 */
function isUniform(rows: DayRow[]): boolean {
  const [first] = rows;
  return rows.every((row) => !row.closed && row.startTime === first.startTime && row.endTime === first.endTime);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timesError(row: DayRow): string | null {
  if (!row.startTime || !row.endTime) return 'Enter a start and end time.';
  // "HH:mm" strings compare correctly as text.
  if (row.endTime <= row.startTime) return 'End time must be after start time.';
  return null;
}

/** A closed day has nothing to check: its times are not used. */
function rowError(row: DayRow): string | null {
  return row.closed ? null : timesError(row);
}

/** Planned minutes per week; closed days and invalid rows count as 0. */
function weeklyMinutes(rows: DayRow[]): number {
  return rows.reduce(
    (sum, row) => sum + (row.closed || timesError(row) ? 0 : toMinutes(row.endTime) - toMinutes(row.startTime)),
    0,
  );
}

function formatHours(minutes: number): string {
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

/**
 * Availability is only reachable from the gear in the top bar, so the page offers its own way back:
 * to the previous page in the app, or to the calendar when it was opened directly.
 */
function BackButton() {
  const navigate = useNavigate();
  // The first page loaded in the app has the key "default": there is no page of ours to go back to.
  const canGoBack = useLocation().key !== 'default';

  return (
    <button
      type="button"
      className="availability-back-link"
      onClick={() => (canGoBack ? navigate(-1) : navigate('/calendar'))}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

export function AvailabilityPage() {
  const { windows, error, isLoading, reload } = useAvailability();

  if (isLoading || error) {
    return (
      <section className="page availability-page">
        <BackButton />
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
  const [mode, setMode] = useState<Mode>(() => (isUniform(toRows(initialWindows)) ? 'simple' : 'perDay'));
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const allClosed = rows.every((row) => row.closed);

  const updateRow = (day: DayOfWeek, changes: Partial<DayRow>) => {
    setRows((prev) => prev.map((row) => (row.day === day ? { ...row, ...changes } : row)));
    setIsSaved(false);
  };

  /** Simple mode edits all seven days at once. */
  const updateAllRows = (changes: Partial<DayRow>) => {
    setRows((prev) => prev.map((row) => ({ ...row, ...changes })));
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
      // Every day is sent: a day left out would keep its stored window. Closed days keep their times,
      // which the server ignores (it keeps the stored ones).
      const saved = await availabilityService.saveAvailability(
        rows.map((row) => ({
          dayOfWeek: row.day,
          startTime: `${row.startTime}:00`,
          endTime: `${row.endTime}:00`,
          closed: mode === 'simple' ? false : row.closed,
        })),
      );
      // The mode stays as it is, also when the saved week would fit the other one.
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
      <BackButton />
      <header className="page-header">
        <h1>Availability</h1>
        <span className="page-summary">{formatHours(weeklyMinutes(rows))} available per week</span>
        <div className="page-actions">
          <button type="submit" className="button button--primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>
      <p className="page-description">
        The planner only schedules goals inside these hours. Fixed events block time on top of this.
      </p>
      {allClosed && <p className="availability-warning">All days are closed, nothing can be planned.</p>}

      <div className="availability-messages" aria-live="polite">
        {saveError && <ErrorBanner message={saveError} />}
        {isSaved && <p className="banner banner--success">Availability saved.</p>}
      </div>

      {mode === 'simple' ? (
        <SimpleWeek
          row={rows[0]}
          error={showErrors ? rowError(rows[0]) : null}
          disabled={isSaving}
          onChange={updateAllRows}
          onCustomise={() => setMode('perDay')}
        />
      ) : (
        <>
          <ul className="card availability-list">
            {rows.map((row) => (
              <DayRowItem
                key={row.day}
                row={row}
                error={showErrors ? rowError(row) : null}
                disabled={isSaving}
                onChange={(changes) => updateRow(row.day, changes)}
              />
            ))}
          </ul>
          {/* Only offered when it loses nothing: every day open with the same hours. */}
          {isUniform(rows) && (
            <button type="button" className="text-button availability-back" onClick={() => setMode('simple')}>
              Back to simple
            </button>
          )}
        </>
      )}
    </form>
  );
}

interface SimpleWeekProps {
  row: DayRow;
  error: string | null;
  disabled: boolean;
  onChange: (changes: Partial<DayRow>) => void;
  onCustomise: () => void;
}

function SimpleWeek({ row, error, disabled, onChange, onCustomise }: SimpleWeekProps) {
  const errorId = 'availability-simple-error';
  const invalidProps = error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {};

  return (
    <div className="card availability-simple">
      <div className="availability-simple-line">
        <span>Plan between</span>
        <input
          type="time"
          value={row.startTime}
          onChange={(e) => onChange({ startTime: e.target.value })}
          aria-label="Start time"
          disabled={disabled}
          {...invalidProps}
        />
        <span>and</span>
        <input
          type="time"
          value={row.endTime}
          onChange={(e) => onChange({ endTime: e.target.value })}
          aria-label="End time"
          disabled={disabled}
          {...invalidProps}
        />
        <button type="button" className="text-button availability-customise" onClick={onCustomise}>
          Customise per day
        </button>
      </div>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

interface DayRowItemProps {
  row: DayRow;
  error: string | null;
  disabled: boolean;
  onChange: (changes: Partial<DayRow>) => void;
}

function DayRowItem({ row, error, disabled, onChange }: DayRowItemProps) {
  const label = DAYS.find((d) => d.day === row.day)!.label;
  const errorId = `availability-${row.day}-error`;
  const invalidProps = error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {};
  const start = toMinutes(row.startTime || DEFAULT_START);
  const end = toMinutes(row.endTime || DEFAULT_END);

  return (
    <li className={`availability-row${row.closed ? ' availability-row--closed' : ''}`}>
      <span className="availability-day">{label}</span>
      <div className="availability-times">
        <input
          type="time"
          value={row.startTime}
          onChange={(e) => onChange({ startTime: e.target.value })}
          aria-label={`${label} start time`}
          disabled={disabled || row.closed}
          {...invalidProps}
        />
        <span className="availability-dash" aria-hidden="true">
          -
        </span>
        <input
          type="time"
          value={row.endTime}
          onChange={(e) => onChange({ endTime: e.target.value })}
          aria-label={`${label} end time`}
          disabled={disabled || row.closed}
          {...invalidProps}
        />
      </div>
      {row.closed ? (
        <span className="availability-closed-note">No planning on this day</span>
      ) : (
        <div className="availability-timeline" aria-hidden="true">
          {end > start && (
            <span
              className="availability-timeline-fill"
              style={{ left: `${(start / 1440) * 100}%`, width: `${((end - start) / 1440) * 100}%` }}
            />
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={!row.closed}
        aria-label={`Plan on ${label}`}
        className="switch"
        onClick={() => onChange({ closed: !row.closed })}
        disabled={disabled}
      />
      {error && (
        <p id={errorId} className="field-error availability-error">
          {error}
        </p>
      )}
    </li>
  );
}
