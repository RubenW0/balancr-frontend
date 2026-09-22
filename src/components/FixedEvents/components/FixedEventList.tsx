import type { FixedEvent } from '../../../types/fixedEvent';
import { FixedEventItem } from './FixedEventItem';
import '../styles/FixedEventList.css';

interface FixedEventListProps {
  fixedEvents: FixedEvent[];
}

export function FixedEventList({ fixedEvents }: FixedEventListProps) {
  if (fixedEvents.length === 0) {
    return <p className="fixed-event-list-empty">No fixed events yet. Add one above.</p>;
  }

  return (
    <ul className="fixed-event-list">
      {fixedEvents.map((event) => (
        <FixedEventItem key={event.id} event={event} />
      ))}
    </ul>
  );
}
