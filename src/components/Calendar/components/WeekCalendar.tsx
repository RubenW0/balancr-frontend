import { useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import type { Ref } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import nlLocale from '@fullcalendar/core/locales/nl';
import type {
  BusinessHoursInput,
  DateSelectArg,
  DatesSetArg,
  DayHeaderContentArg,
  EventClickArg,
  EventInput,
  FormatterInput,
} from '@fullcalendar/core';
import type { CalendarItem } from '../../../types/calendarItem';
import { getCalendarItemColorKey } from '../calendarColors';
import '../styles/WeekCalendar.css';

/** Week navigation, so the page can render its own toolbar. */
export interface WeekCalendarHandle {
  prev: () => void;
  next: () => void;
  today: () => void;
}

interface WeekCalendarProps {
  ref?: Ref<WeekCalendarHandle>;
  items: CalendarItem[];
  businessHours?: BusinessHoursInput;
  /**
   * Called with the visible range (start inclusive, end exclusive) and its title
   * on load and on every navigation.
   */
  onRangeChange: (start: Date, end: Date, title: string) => void;
  /** Click or drag over an empty time slot. */
  onSelectSlot: (start: Date, end: Date) => void;
  onItemClick: (item: CalendarItem) => void;
}

const TIME_FORMAT: FormatterInput = { hour: '2-digit', minute: '2-digit', hour12: false };

/** Day header: weekday in small capitals with the date number below it (circled for today). */
function renderDayHeader(arg: DayHeaderContentArg) {
  return (
    <span className="week-calendar-day">
      <span className="week-calendar-weekday">{arg.view.calendar.formatDate(arg.date, { weekday: 'short' })}</span>
      <span className="week-calendar-date">{arg.date.getDate()}</span>
    </span>
  );
}

export function WeekCalendar({
  ref,
  items,
  businessHours,
  onRangeChange,
  onSelectSlot,
  onItemClick,
}: WeekCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  useImperativeHandle(
    ref,
    () => ({
      prev: () => calendarRef.current?.getApi().prev(),
      next: () => calendarRef.current?.getApi().next(),
      today: () => calendarRef.current?.getApi().today(),
    }),
    [],
  );

  const events = useMemo<EventInput[]>(
    () =>
      items.map((item) => ({
        // Ids are only unique per kind, so prefix them.
        id: `${item.kind}-${item.id}`,
        title: item.title,
        start: item.start,
        end: item.end,
        // Colours come from CSS (tokens), selected by these classes.
        classNames: [
          `week-calendar-item-${item.kind.toLowerCase()}`,
          `week-calendar-color-${getCalendarItemColorKey(item)}`,
        ],
        extendedProps: { item },
      })),
    [items],
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => onRangeChange(arg.start, arg.end, arg.view.title),
    [onRangeChange],
  );

  const handleSelect = useCallback(
    (arg: DateSelectArg) => {
      arg.view.calendar.unselect();
      onSelectSlot(arg.start, arg.end);
    },
    [onSelectSlot],
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => onItemClick(arg.event.extendedProps.item as CalendarItem),
    [onItemClick],
  );

  return (
    <div className="week-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={nlLocale}
        firstDay={1}
        headerToolbar={false}
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        scrollTime="07:00:00"
        slotLabelFormat={TIME_FORMAT}
        eventTimeFormat={TIME_FORMAT}
        // Blocks lower than this show time and title on one line, so short sessions stay readable in compact rows.
        eventShortHeight={40}
        dayHeaderContent={renderDayHeader}
        // Fills its container and stretches the slots to fit; the time grid only scrolls when they cannot shrink further.
        height="100%"
        expandRows
        nowIndicator
        businessHours={businessHours}
        events={events}
        editable={false}
        selectable
        selectMirror
        datesSet={handleDatesSet}
        select={handleSelect}
        eventClick={handleEventClick}
      />
    </div>
  );
}
