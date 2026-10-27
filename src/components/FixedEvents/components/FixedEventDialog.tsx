import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../../services/apiClient';
import { FIXED_EVENT_TYPES } from '../../../types/fixedEvent';
import type { CreateFixedEventPayload } from '../../../types/fixedEvent';
import { fromDateTimeInputValue } from '../../../utils/dateTime';
import '../styles/FixedEventDialog.css';

export interface FixedEventDialogValues {
  title: string;
  type: string;
  /** datetime-local input values, e.g. "2026-10-19T09:00". */
  startTime: string;
  endTime: string;
  isMovable: boolean;
}

interface FixedEventDialogProps {
  initialValues: FixedEventDialogValues;
  /** Without onDelete the dialog creates a new event; with it, it edits an existing one. */
  onDelete?: () => Promise<void>;
  onSave: (payload: CreateFixedEventPayload) => Promise<void>;
  onClose: () => void;
}

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function FixedEventDialog({ initialValues, onDelete, onSave, onClose }: FixedEventDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(initialValues.title);
  const [type, setType] = useState(initialValues.type);
  const [startTime, setStartTime] = useState(initialValues.startTime);
  const [endTime, setEndTime] = useState(initialValues.endTime);
  const [isMovable, setIsMovable] = useState(initialValues.isMovable);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = onDelete !== undefined;
  // Keep a free-text type from the API selectable instead of silently changing it.
  const typeOptions: string[] = FIXED_EVENT_TYPES.includes(type as (typeof FIXED_EVENT_TYPES)[number])
    ? [...FIXED_EVENT_TYPES]
    : [type, ...FIXED_EVENT_TYPES];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !type || !startTime || !endTime) {
      setError('Title, type, start time and end time are required.');
      return;
    }
    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return;
    }

    setError(null);
    setIsBusy(true);
    try {
      await onSave({
        title: trimmedTitle,
        type,
        startTime: fromDateTimeInputValue(startTime),
        endTime: fromDateTimeInputValue(endTime),
        isMovable,
      });
      onClose();
    } catch (err) {
      setError(toErrorMessage(err, 'Unknown error while saving the fixed event.'));
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm(`Delete "${initialValues.title}"?`)) return;

    setError(null);
    setIsBusy(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(toErrorMessage(err, 'Unknown error while deleting the fixed event.'));
      setIsBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed-event-dialog"
      aria-labelledby="fixed-event-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!isBusy) onClose();
      }}
    >
      <form className="fixed-event-dialog-form" onSubmit={handleSubmit}>
        <h2 id="fixed-event-dialog-title">{isEdit ? 'Edit fixed event' : 'New fixed event'}</h2>

        <div className="fixed-event-dialog-field">
          <label htmlFor="fixed-event-dialog-name">Title</label>
          <input
            id="fixed-event-dialog-name"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Math class"
            disabled={isBusy}
            autoFocus
          />
        </div>

        <div className="fixed-event-dialog-field">
          <label htmlFor="fixed-event-dialog-type">Type</label>
          <select
            id="fixed-event-dialog-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isBusy}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="fixed-event-dialog-row">
          <div className="fixed-event-dialog-field">
            <label htmlFor="fixed-event-dialog-start">Start time</label>
            <input
              id="fixed-event-dialog-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="fixed-event-dialog-field">
            <label htmlFor="fixed-event-dialog-end">End time</label>
            <input
              id="fixed-event-dialog-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <label className="fixed-event-dialog-checkbox">
          <input
            type="checkbox"
            checked={isMovable}
            onChange={(e) => setIsMovable(e.target.checked)}
            disabled={isBusy}
          />
          Movable (the planner may move this event)
        </label>

        {error && (
          <p className="fixed-event-dialog-error" role="alert">
            {error}
          </p>
        )}

        <div className="fixed-event-dialog-actions">
          {isEdit && (
            <button
              type="button"
              className="fixed-event-dialog-delete"
              onClick={handleDelete}
              disabled={isBusy}
            >
              Delete
            </button>
          )}
          <button type="button" className="fixed-event-dialog-cancel" onClick={onClose} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" disabled={isBusy}>
            {isBusy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
