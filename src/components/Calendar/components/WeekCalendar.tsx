import { useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import nlLocale from '@fullcalendar/core/locales/nl';
import type {
  BusinessHoursInput,
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventInput,
  FormatterInput,
} from '@fullcalendar/core';
import type { CalendarItem } from '../../../types/calendarItem';
import { getCalendarItemColor } from '../calendarColors';
import '../styles/WeekCalendar.css';

interface WeekCalendarProps {
  items: CalendarItem[];
  businessHours?: BusinessHoursInput;
  /** Called with the visible range (start inclusive, end exclusive) on load and on every navigation. */
  onRangeChange: (start: Date, end: Date) => void;
  /** Click or drag over an empty time slot. */
  onSelectSlot: (start: Date, end: Date) => void;
  onItemClick: (item: CalendarItem) => void;
}

const TIME_FORMAT: FormatterInput = { hour: '2-digit', minute: '2-digit', hour12: false };

export function WeekCalendar({
  items,
  businessHours,
  onRangeChange,
  onSelectSlot,
  onItemClick,
}: WeekCalendarProps) {
  const events = useMemo<EventInput[]>(
    () =>
      items.map((item) => {
        const color = getCalendarItemColor(item);
        return {
          // Ids are only unique per kind, so prefix them.
          id: `${item.kind}-${item.id}`,
          title: item.title,
          start: item.start,
          end: item.end,
          backgroundColor: color,
          borderColor: color,
          classNames: [`week-calendar-item-${item.kind.toLowerCase()}`],
          extendedProps: { item },
        };
      }),
    [items],
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => onRangeChange(arg.start, arg.end),
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
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={nlLocale}
        firstDay={1}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        scrollTime="08:00:00"
        slotLabelFormat={TIME_FORMAT}
        eventTimeFormat={TIME_FORMAT}
        height={720}
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
