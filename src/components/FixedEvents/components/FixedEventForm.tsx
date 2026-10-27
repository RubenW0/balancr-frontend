import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateFixedEventPayload } from '../../../types/fixedEvent';
import { fromDateTimeInputValue } from '../../../utils/dateTime';
import '../styles/FixedEventForm.css';

interface FixedEventFormProps {
  onSubmit: (payload: CreateFixedEventPayload) => Promise<void>;
}

export function FixedEventForm({ onSubmit }: FixedEventFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedType = type.trim();

    if (!trimmedTitle || !trimmedType || !startTime || !endTime) {
      setValidationError('Title, type, start time and end time are required.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        type: trimmedType,
        startTime: fromDateTimeInputValue(startTime),
        endTime: fromDateTimeInputValue(endTime),
      });
      setTitle('');
      setType('');
      setStartTime('');
      setEndTime('');
    } catch {
      // The error is already tracked in useFixedEvents; nothing extra needed here.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="card fixed-event-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="fixed-event-title">Title</label>
        <input
          id="fixed-event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Dentist appointment"
          disabled={isSubmitting}
        />
      </div>

      <div className="field">
        <label htmlFor="fixed-event-type">Type</label>
        <input
          id="fixed-event-type"
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g. dentist appointment, dinner with friends"
          disabled={isSubmitting}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="fixed-event-start">Start time</label>
          <input
            id="fixed-event-start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="field">
          <label htmlFor="fixed-event-end">End time</label>
          <input
            id="fixed-event-end"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {validationError && <p className="alert alert--danger">{validationError}</p>}

      <button type="submit" className="button button--primary" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add fixed event'}
      </button>
    </form>
  );
}
