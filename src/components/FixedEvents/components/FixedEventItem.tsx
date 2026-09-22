import type { FixedEvent } from '../../../types/fixedEvent';
import '../styles/FixedEventItem.css';

interface FixedEventItemProps {
  event: FixedEvent;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function FixedEventItem({ event }: FixedEventItemProps) {
  return (
    <li className="fixed-event-item">
      <div className="fixed-event-info">
        <span className="fixed-event-title">{event.title}</span>
        <span className="fixed-event-type">{event.type}</span>
      </div>
      <span className="fixed-event-time">
        {formatDateTime(event.startTime)} – {formatDateTime(event.endTime)}
      </span>
    </li>
  );
}
