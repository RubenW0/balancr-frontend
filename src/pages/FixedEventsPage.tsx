import { useFixedEvents } from '../hooks/useFixedEvents';
import { FixedEventForm } from '../components/FixedEvents/components/FixedEventForm';
import { FixedEventList } from '../components/FixedEvents/components/FixedEventList';
import './FixedEventsPage.css';

export function FixedEventsPage() {
  const { fixedEvents, isLoading, error, addFixedEvent } = useFixedEvents();

  return (
    <section className="fixed-events-page">
      <h1>Fixed Events</h1>
      <p className="fixed-events-subtitle">
        {fixedEvents.length === 0 ? 'Overview of your fixed events' : `${fixedEvents.length} fixed event(s)`}
      </p>

      <FixedEventForm onSubmit={addFixedEvent} />

      {error && <p className="fixed-events-error">{error}</p>}

      {isLoading ? (
        <p className="fixed-events-loading">Loading fixed events...</p>
      ) : (
        <FixedEventList fixedEvents={fixedEvents} />
      )}
    </section>
  );
}
