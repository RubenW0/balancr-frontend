import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../../services/apiClient';
import { FIXED_EVENT_TYPES } from '../../../types/fixedEvent';
import type { CreateFixedEventPayload } from '../../../types/fixedEvent';
import { combineDateAndTime } from '../../../utils/dateTime';
import { ErrorBanner } from '../../Banner/ErrorBanner';
import { ConfirmDialog } from '../../Dialog/components/ConfirmDialog';
import { Dialog } from '../../Dialog/components/Dialog';
import { useDiscardGuard } from '../../Dialog/useDiscardGuard';

export interface FixedEventDialogValues {
  title: string;
  type: string;
  /** <input type="date"> value, e.g. "2026-10-19". */
  date: string;
  /** <input type="time"> values, e.g. "09:00". */
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

type FieldErrors = Partial<Record<'title' | 'date' | 'startTime' | 'endTime', string>>;

function validate(values: FixedEventDialogValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.title.trim()) errors.title = 'Title is required.';
  if (!values.date) errors.date = 'Date is required.';
  if (!values.startTime) errors.startTime = 'Start time is required.';
  if (!values.endTime) errors.endTime = 'End time is required.';
  // "HH:mm" strings compare correctly as text.
  else if (values.startTime && values.endTime <= values.startTime) errors.endTime = 'End time must be after start time.';
  return errors;
}

export function FixedEventDialog({ initialValues, onDelete, onSave, onClose }: FixedEventDialogProps) {
  const id = useId();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isEdit = onDelete !== undefined;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const { requestClose, confirmDialog } = useDiscardGuard(isDirty, onClose);

  // Keep a free-text type from the API selectable instead of silently changing it.
  const typeOptions: string[] = FIXED_EVENT_TYPES.includes(values.type as (typeof FIXED_EVENT_TYPES)[number])
    ? [...FIXED_EVENT_TYPES]
    : [values.type, ...FIXED_EVENT_TYPES];

  const setField = <K extends keyof FixedEventDialogValues>(key: K, value: FixedEventDialogValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setApiError(null);
    setIsBusy(true);
    try {
      await onSave({
        title: values.title.trim(),
        type: values.type,
        startTime: combineDateAndTime(values.date, values.startTime),
        endTime: combineDateAndTime(values.date, values.endTime),
        isMovable: values.isMovable,
      });
      onClose();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unknown error while saving the fixed event.');
      setIsBusy(false);
    }
  };

  return (
    <>
      <Dialog title={isEdit ? 'Edit event' : 'New event'} onRequestClose={requestClose} isBusy={isBusy}>
        <form className="app-dialog-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor={`${id}-title`}>Title</label>
            <input
              id={`${id}-title`}
              type="text"
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. Math class"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? `${id}-title-error` : undefined}
              disabled={isBusy}
              autoFocus
            />
            {errors.title && (
              <p id={`${id}-title-error`} className="field-error">
                {errors.title}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor={`${id}-type`}>Type</label>
            <select
              id={`${id}-type`}
              value={values.type}
              onChange={(e) => setField('type', e.target.value)}
              disabled={isBusy}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor={`${id}-date`}>Date</label>
            <input
              id={`${id}-date`}
              type="date"
              value={values.date}
              onChange={(e) => setField('date', e.target.value)}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? `${id}-date-error` : undefined}
              disabled={isBusy}
            />
            {errors.date && (
              <p id={`${id}-date-error`} className="field-error">
                {errors.date}
              </p>
            )}
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor={`${id}-start`}>Start time</label>
              <input
                id={`${id}-start`}
                type="time"
                value={values.startTime}
                onChange={(e) => setField('startTime', e.target.value)}
                aria-invalid={errors.startTime ? true : undefined}
                aria-describedby={errors.startTime ? `${id}-start-error` : undefined}
                disabled={isBusy}
              />
              {errors.startTime && (
                <p id={`${id}-start-error`} className="field-error">
                  {errors.startTime}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor={`${id}-end`}>End time</label>
              <input
                id={`${id}-end`}
                type="time"
                value={values.endTime}
                onChange={(e) => setField('endTime', e.target.value)}
                aria-invalid={errors.endTime ? true : undefined}
                aria-describedby={errors.endTime ? `${id}-end-error` : undefined}
                disabled={isBusy}
              />
              {errors.endTime && (
                <p id={`${id}-end-error`} className="field-error">
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={values.isMovable}
              onChange={(e) => setField('isMovable', e.target.checked)}
              disabled={isBusy}
            />
            Movable (the planner may move this event)
          </label>

          {apiError && <ErrorBanner message={apiError} />}

          <div className="app-dialog-actions">
            {isEdit && (
              <button
                type="button"
                className="button button--danger app-dialog-actions-start"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isBusy}
              >
                Delete
              </button>
            )}
            <button type="button" className="button button--ghost" onClick={requestClose} disabled={isBusy}>
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={isBusy}>
              {isBusy ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Dialog>

      {confirmDialog}

      {isConfirmingDelete && onDelete && (
        <ConfirmDialog
          title="Delete event"
          message={`Delete "${initialValues.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={async () => {
            await onDelete();
            onClose();
          }}
          onClose={() => setIsConfirmingDelete(false)}
        />
      )}
    </>
  );
}
