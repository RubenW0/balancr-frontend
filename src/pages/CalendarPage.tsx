import { useCallback, useMemo, useRef, useState } from 'react';
import { PlanToolbar } from '../components/Calendar/components/PlanToolbar';
import { UnscheduledList } from '../components/Calendar/components/UnscheduledList';
import { WeekCalendar } from '../components/Calendar/components/WeekCalendar';
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
import { toDateTimeInputValue, toLocalDateString, toLocalDateTimeString } from '../utils/dateTime';
import './CalendarPage.css';

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
    (start: Date, end: Date) => {
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

  const handleSelectSlot = useCallback((start: Date, end: Date) => {
    setDialog({
      mode: 'create',
      values: {
        title: '',
        type: 'class',
        startTime: toDateTimeInputValue(start),
        endTime: toDateTimeInputValue(end),
        isMovable: false,
      },
    });
  }, []);

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

  const isEmpty = hasRange && !isLoading && !error && fixedItems.length === 0;

  return (
    <section className="calendar-page">
      <h1>Calendar</h1>
      <p className="calendar-subtitle">
        Click or drag over an empty time slot to add a fixed event. Click an event to edit or delete it.
        Use "Plan my week" to preview where your activity goals fit.
      </p>

      {error && (
        <p className="calendar-error" role="alert">
          Could not load fixed events: {error}
        </p>
      )}
      {availability.error && (
        <p className="calendar-error" role="alert">
          Could not load availability: {availability.error}
        </p>
      )}

      <div className="calendar-status" aria-live="polite">
        {isLoading && <span>Loading fixed events...</span>}
        {isEmpty && <span>No fixed events this week.</span>}
      </div>

      <PlanToolbar
        plan={visiblePlan}
        isPlanning={isPlanning}
        error={planError}
        disabled={weekStart === null}
        onPlan={handlePlan}
        onClear={clearPlan}
      />

      <WeekCalendar
        items={items}
        businessHours={businessHours}
        onRangeChange={handleRangeChange}
        onSelectSlot={handleSelectSlot}
        onItemClick={handleItemClick}
      />

      {visiblePlan && <UnscheduledList sessions={visiblePlan.unscheduled} />}

      {dialog?.mode === 'create' && (
        <FixedEventDialog initialValues={dialog.values} onSave={handleAdd} onClose={closeDialog} />
      )}
      {dialog?.mode === 'edit' && (
        <FixedEventDialog
          key={dialog.event.id}
          initialValues={{
            title: dialog.event.title,
            type: dialog.event.type,
            startTime: toDateTimeInputValue(dialog.event.startTime),
            endTime: toDateTimeInputValue(dialog.event.endTime),
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
