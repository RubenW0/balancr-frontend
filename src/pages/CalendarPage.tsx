import { useCallback, useMemo, useRef, useState } from 'react';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import { CalendarLegend } from '../components/Calendar/components/CalendarLegend';
import { PlanToolbar } from '../components/Calendar/components/PlanToolbar';
import { UnscheduledList } from '../components/Calendar/components/UnscheduledList';
import { WeekCalendar } from '../components/Calendar/components/WeekCalendar';
import type { WeekCalendarHandle } from '../components/Calendar/components/WeekCalendar';
import { WeekNav } from '../components/Calendar/components/WeekNav';
import { FixedEventDialog } from '../components/FixedEvents/components/FixedEventDialog';
import type { FixedEventDialogValues } from '../components/FixedEvents/components/FixedEventDialog';
import { useAvailability } from '../hooks/useAvailability';
import { usePlan } from '../hooks/usePlan';
import { useWeekFixedEvents } from '../hooks/useWeekFixedEvents';
import {
  availabilityToBusinessHours,
  fixedEventToCalendarItem,
  scheduledSessionToCalendarItem,
} from '../mappers/calendarMappers';
import type { CalendarItem } from '../types/calendarItem';
import type { CreateFixedEventPayload, FixedEvent } from '../types/fixedEvent';
import { toDateInputValue, toLocalDateString, toLocalDateTimeString, toTimeInputValue } from '../utils/dateTime';
import './CalendarPage.css';

const CALENDAR_HELP =
  'Click or drag over an empty time slot to add a fixed event. Click an event to edit or delete it. ' +
  'Use "Plan my week" to preview where your activity goals fit.';

type DialogState =
  | { mode: 'create'; values: FixedEventDialogValues }
  | { mode: 'edit'; event: FixedEvent };

export function CalendarPage() {
  const {
    fixedEvents,
    isLoading,
    error,
    hasRange,
    setRange,
    reload,
    addFixedEvent,
    updateFixedEvent,
    deleteFixedEvent,
  } = useWeekFixedEvents();
  const availability = useAvailability();
  const { plan, isPlanning, error: planError, requestPlan, clearPlan } = usePlan();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  // Monday of the visible week as YYYY-MM-DD; a plan is only valid for this week.
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const weekStartRef = useRef<string | null>(null);
  const calendarRef = useRef<WeekCalendarHandle>(null);
  const [weekView, setWeekView] = useState({ title: '', isCurrentWeek: true });

  const visiblePlan = plan && plan.weekStart === weekStart ? plan : null;
  const fixedItems = useMemo(() => fixedEvents.map(fixedEventToCalendarItem), [fixedEvents]);
  const plannedItems = useMemo(
    () => visiblePlan?.scheduled.map(scheduledSessionToCalendarItem) ?? [],
    [visiblePlan],
  );
  const items = useMemo(() => [...fixedItems, ...plannedItems], [fixedItems, plannedItems]);
  const businessHours = useMemo(
    () => (availability.windows.length > 0 ? availabilityToBusinessHours(availability.windows) : undefined),
    [availability.windows],
  );

  const handleRangeChange = useCallback(
    (start: Date, end: Date, title: string) => {
      const now = new Date();
      setWeekView({ title, isCurrentWeek: now >= start && now < end });
      setRange({ from: toLocalDateTimeString(start), to: toLocalDateTimeString(end) });
      // The week starts on Monday (firstDay=1), so start is that Monday at 00:00 local time.
      const nextWeekStart = toLocalDateString(start);
      if (weekStartRef.current !== nextWeekStart) {
        weekStartRef.current = nextWeekStart;
        setWeekStart(nextWeekStart);
        clearPlan();
      }
    },
    [setRange, clearPlan],
  );

  const handlePlan = useCallback(() => {
    if (weekStart) requestPlan(weekStart);
  }, [weekStart, requestPlan]);

  // Changing a fixed event makes the plan outdated, so drop it after a successful save.
  const handleAdd = useCallback(
    async (payload: CreateFixedEventPayload) => {
      await addFixedEvent(payload);
      clearPlan();
    },
    [addFixedEvent, clearPlan],
  );

  const handleUpdate = useCallback(
    async (id: number, payload: CreateFixedEventPayload) => {
      await updateFixedEvent(id, payload);
      clearPlan();
    },
    [updateFixedEvent, clearPlan],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteFixedEvent(id);
      clearPlan();
    },
    [deleteFixedEvent, clearPlan],
  );

  const openCreateDialog = useCallback((date: string, startTime: string, endTime: string) => {
    setDialog({ mode: 'create', values: { title: '', type: 'class', date, startTime, endTime, isMovable: false } });
  }, []);

  const handleSelectSlot = useCallback(
    (start: Date, end: Date) => {
      // A selection that ends at midnight ends at "00:00" of the next day; in the dialog that is 23:59 on the same day.
      const endsAtMidnight = toDateInputValue(end) !== toDateInputValue(start);
      openCreateDialog(toDateInputValue(start), toTimeInputValue(start), endsAtMidnight ? '23:59' : toTimeInputValue(end));
    },
    [openCreateDialog],
  );

  // "+ Event": the first day of the visible week, 09:00-10:00.
  const handleAddEvent = useCallback(() => {
    if (weekStart) openCreateDialog(weekStart, '09:00', '10:00');
  }, [weekStart, openCreateDialog]);

  const handleItemClick = useCallback(
    (item: CalendarItem) => {
      // Planned sessions are a read-only preview.
      if (item.kind !== 'FIXED') return;
      const event = fixedEvents.find((fixedEvent) => fixedEvent.id === item.id);
      if (event) setDialog({ mode: 'edit', event });
    },
    [fixedEvents],
  );

  const closeDialog = useCallback(() => setDialog(null), []);

  // A server that is down fails both loads with the same message, so show each message once.
  const loadErrors = [...new Set([error, availability.error].filter((message) => message !== null))];
  const retryLoad = () => {
    reload();
    availability.reload();
  };

  const isEmpty = hasRange && !isLoading && !error && fixedItems.length === 0;

  return (
    <section className="page calendar-page">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-start">
          <WeekNav
            title={weekView.title}
            isCurrentWeek={weekView.isCurrentWeek}
            onPrev={() => calendarRef.current?.prev()}
            onNext={() => calendarRef.current?.next()}
            onToday={() => calendarRef.current?.today()}
          />
          <span className="calendar-info" role="img" aria-label={CALENDAR_HELP} title={CALENDAR_HELP} tabIndex={0}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
              <path d="M8 7.25v3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="5" r="0.9" fill="currentColor" />
            </svg>
          </span>
          <span className="calendar-status" aria-live="polite">
            {isLoading && 'Loading fixed events...'}
            {isEmpty && 'No fixed events this week.'}
          </span>
        </div>
        <div className="calendar-toolbar-end">
          <CalendarLegend />
          <PlanToolbar
            plan={visiblePlan}
            isPlanning={isPlanning}
            disabled={weekStart === null}
            onPlan={handlePlan}
            onClear={clearPlan}
          >
            <button type="button" className="button button--secondary" onClick={handleAddEvent} disabled={!weekStart}>
              + Event
            </button>
          </PlanToolbar>
        </div>
      </div>

      {visiblePlan && visiblePlan.unscheduled.length > 0 && <UnscheduledList sessions={visiblePlan.unscheduled} />}

      {(loadErrors.length > 0 || planError) && (
        <div className="calendar-errors">
          {loadErrors.map((message) => (
            <ErrorBanner key={message} message={message} onRetry={retryLoad} />
          ))}
          {planError && <ErrorBanner message={planError} onRetry={handlePlan} />}
        </div>
      )}

      <div className="calendar-main">
        <WeekCalendar
          ref={calendarRef}
          items={items}
          businessHours={businessHours}
          onRangeChange={handleRangeChange}
          onSelectSlot={handleSelectSlot}
          onItemClick={handleItemClick}
        />
        {isEmpty && !visiblePlan && <p className="calendar-empty-hint">{CALENDAR_HELP}</p>}
      </div>

      {dialog?.mode === 'create' && (
        <FixedEventDialog initialValues={dialog.values} onSave={handleAdd} onClose={closeDialog} />
      )}
      {dialog?.mode === 'edit' && (
        <FixedEventDialog
          key={dialog.event.id}
          initialValues={{
            title: dialog.event.title,
            type: dialog.event.type,
            date: toDateInputValue(dialog.event.startTime),
            startTime: toTimeInputValue(dialog.event.startTime),
            endTime: toTimeInputValue(dialog.event.endTime),
            isMovable: dialog.event.isMovable,
          }}
          onSave={(payload) => handleUpdate(dialog.event.id, payload)}
          onDelete={() => handleDelete(dialog.event.id)}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}
