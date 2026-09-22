import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateFixedEventPayload } from '../../../types/fixedEvent';
import '../styles/FixedEventForm.css';

interface FixedEventFormProps {
  onSubmit: (payload: CreateFixedEventPayload) => Promise<void>;
}

function toLocalDateTimeString(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
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
        startTime: toLocalDateTimeString(startTime),
        endTime: toLocalDateTimeString(endTime),
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
    <form className="fixed-event-form" onSubmit={handleSubmit}>
      <div className="fixed-event-form-field">
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

      <div className="fixed-event-form-field">
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

      <div className="fixed-event-form-row">
        <div className="fixed-event-form-field">
          <label htmlFor="fixed-event-start">Start time</label>
          <input
            id="fixed-event-start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="fixed-event-form-field">
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

      {validationError && <p className="fixed-event-form-error">{validationError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add fixed event'}
      </button>
    </form>
  );
}
