import { useId, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../../services/apiClient';
import { ACTIVITY_GOAL_NAME_MAX_LENGTH } from '../../../types/activityGoal';
import type {
  ActivityGoalIntensity,
  ActivityGoalPreferredTime,
  ActivityGoalRequestDTO,
  ActivityGoalResponseDTO,
  ActivityGoalType,
} from '../../../types/activityGoal';
import { ErrorBanner } from '../../Banner/ErrorBanner';
import { Dialog } from '../../Dialog/components/Dialog';
import { useDiscardGuard } from '../../Dialog/useDiscardGuard';
import { INTENSITY_LABELS, PREFERRED_TIME_LABELS, TYPE_LABELS } from '../activityGoalLabels';
import { restPlaceholder } from '../goalText';
import { GoalMultiSelect } from './GoalMultiSelect';
import { DEFAULT_PRIORITY_LEVEL, PRIORITY_OPTIONS, levelToPriority, priorityToLevel } from '../priorityOptions';
import type { PriorityLevel } from '../priorityOptions';
import '../styles/GoalDialog.css';

interface GoalDialogProps {
  /** When given, the dialog edits this goal; otherwise it creates a new one. */
  goal?: ActivityGoalResponseDTO;
  /** All of the user's goals, for "Not on the same day as" (the edited goal itself is left out). */
  goals: ActivityGoalResponseDTO[];
  /** Saves the goal; the dialog closes when it resolves and shows the error when it rejects. */
  onSubmit: (payload: ActivityGoalRequestDTO) => Promise<void>;
  onClose: () => void;
}

/** Form state; numbers are kept as the input strings until saving. */
interface GoalFormValues {
  name: string;
  type: ActivityGoalType;
  frequencyPerWeek: string;
  durationMinutes: string;
  intensity: ActivityGoalIntensity | '';
  restDaysBetween: string;
  preferredTime: ActivityGoalPreferredTime;
  priority: PriorityLevel;
  /** Sorted, so the dirty check does not depend on the order of picking. */
  separateFromGoalIds: number[];
}

type FieldErrors = Partial<Record<keyof GoalFormValues, string>>;

const TYPES: ActivityGoalType[] = ['TRAINING', 'STUDY'];
const INTENSITIES: ActivityGoalIntensity[] = ['LIGHT', 'MEDIUM', 'HEAVY'];
const PREFERRED_TIMES: ActivityGoalPreferredTime[] = ['ANY', 'MORNING', 'AFTERNOON', 'EVENING'];

function toFormValues(goal?: ActivityGoalResponseDTO): GoalFormValues {
  return {
    name: goal?.name ?? '',
    type: goal?.type ?? 'TRAINING',
    frequencyPerWeek: goal ? String(goal.frequencyPerWeek) : '',
    durationMinutes: goal ? String(goal.durationMinutes) : '',
    intensity: goal?.intensity ?? '',
    restDaysBetween: goal?.restDaysBetween != null ? String(goal.restDaysBetween) : '',
    preferredTime: goal?.preferredTime ?? 'ANY',
    priority: goal ? priorityToLevel(goal.priority) : DEFAULT_PRIORITY_LEVEL,
    separateFromGoalIds: [...(goal?.separateFromGoalIds ?? [])].sort((a, b) => a - b),
  };
}

/** "More options" starts open when the goal already uses one of them. */
function hasMoreOptions(values: GoalFormValues): boolean {
  return (
    values.preferredTime !== 'ANY' ||
    values.priority !== DEFAULT_PRIORITY_LEVEL ||
    values.separateFromGoalIds.length > 0
  );
}

function isWholeNumber(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function validate(values: GoalFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Name is required.';
  else if (name.length > ACTIVITY_GOAL_NAME_MAX_LENGTH) {
    errors.name = `Name can be at most ${ACTIVITY_GOAL_NAME_MAX_LENGTH} characters.`;
  }

  const frequency = Number(values.frequencyPerWeek);
  if (!isWholeNumber(values.frequencyPerWeek) || frequency < 1 || frequency > 7) {
    errors.frequencyPerWeek = 'Enter a whole number from 1 to 7.';
  }

  if (!isWholeNumber(values.durationMinutes) || Number(values.durationMinutes) < 1) {
    errors.durationMinutes = 'Enter a duration of at least 1 minute.';
  }

  if (values.type === 'TRAINING' && !values.intensity) errors.intensity = 'Choose an intensity.';

  if (values.restDaysBetween.trim() !== '' && !isWholeNumber(values.restDaysBetween)) {
    errors.restDaysBetween = 'Enter a whole number of days, or leave it empty.';
  }
  return errors;
}

function toPayload(values: GoalFormValues, goal?: ActivityGoalResponseDTO): ActivityGoalRequestDTO {
  const isTraining = values.type === 'TRAINING';
  // PUT replaces the whole goal, so every field is always sent.
  return {
    name: values.name.trim(),
    type: values.type,
    frequencyPerWeek: Number(values.frequencyPerWeek),
    durationMinutes: Number(values.durationMinutes),
    intensity: isTraining && values.intensity ? values.intensity : null,
    // Empty = null, so the backend derives it from the intensity.
    restDaysBetween: values.restDaysBetween.trim() === '' ? null : Number(values.restDaysBetween),
    priority: levelToPriority(values.priority, goal?.priority),
    preferredTime: values.preferredTime === 'ANY' ? null : values.preferredTime,
    separateFromGoalIds: values.separateFromGoalIds,
  };
}

function Chevron() {
  return (
    <svg className="goal-dialog-chevron" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GoalDialog({ goal, goals, onSubmit, onClose }: GoalDialogProps) {
  const id = useId();
  const [initialValues] = useState(() => toFormValues(goal));
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showMore, setShowMore] = useState(() => goal !== undefined && hasMoreOptions(initialValues));

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const { requestClose, confirmDialog } = useDiscardGuard(isDirty, onClose);
  const isTraining = values.type === 'TRAINING';
  const otherGoals = useMemo(
    () => goals.filter((other) => other.id !== goal?.id).sort((a, b) => a.name.localeCompare(b.name)),
    [goals, goal?.id],
  );

  const setField = <K extends keyof GoalFormValues>(key: K, value: GoalFormValues[K]) => {
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
      await onSubmit(toPayload(values, goal));
      onClose();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unknown error while saving the goal.');
      setIsBusy(false);
    }
  };

  /** Props that tie an input to its inline error. */
  const errorProps = (key: keyof GoalFormValues) =>
    errors[key] ? { 'aria-invalid': true, 'aria-describedby': `${id}-${key}-error` } : {};

  const fieldError = (key: keyof GoalFormValues) =>
    errors[key] && (
      <p id={`${id}-${key}-error`} className="field-error">
        {errors[key]}
      </p>
    );

  return (
    <>
      <Dialog title={goal ? 'Edit goal' : 'New goal'} onRequestClose={requestClose} isBusy={isBusy} size="wide">
        <form className="app-dialog-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor={`${id}-name`}>Name</label>
            <input
              id={`${id}-name`}
              type="text"
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Gym, Statistics"
              maxLength={ACTIVITY_GOAL_NAME_MAX_LENGTH}
              disabled={isBusy}
              autoFocus
              {...errorProps('name')}
            />
            {fieldError('name')}
          </div>

          <div className="field">
            <span id={`${id}-type-label`} className="field-label">
              Category
            </span>
            <div className="segmented" role="radiogroup" aria-labelledby={`${id}-type-label`}>
              {TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={values.type === type}
                  className={`segmented-option segmented-option--${type.toLowerCase()}`}
                  onClick={() => setField('type', type)}
                  disabled={isBusy}
                >
                  <span className="segmented-dot" aria-hidden="true" />
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor={`${id}-frequency`}>Times per week</label>
              <input
                id={`${id}-frequency`}
                type="number"
                inputMode="numeric"
                min={1}
                max={7}
                value={values.frequencyPerWeek}
                onChange={(e) => setField('frequencyPerWeek', e.target.value)}
                disabled={isBusy}
                {...errorProps('frequencyPerWeek')}
              />
              {fieldError('frequencyPerWeek')}
            </div>

            <div className="field">
              <label htmlFor={`${id}-duration`}>Duration</label>
              <div className="input-with-unit">
                <input
                  id={`${id}-duration`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={5}
                  value={values.durationMinutes}
                  onChange={(e) => setField('durationMinutes', e.target.value)}
                  disabled={isBusy}
                  {...errorProps('durationMinutes')}
                />
                <span className="input-unit" aria-hidden="true">
                  min
                </span>
              </div>
              {fieldError('durationMinutes')}
            </div>
          </div>

          <div className={isTraining ? 'form-row' : undefined}>
            {isTraining && (
              <div className="field">
                <label htmlFor={`${id}-intensity`}>Intensity</label>
                <select
                  id={`${id}-intensity`}
                  value={values.intensity}
                  onChange={(e) => setField('intensity', e.target.value as ActivityGoalIntensity | '')}
                  disabled={isBusy}
                  {...errorProps('intensity')}
                >
                  <option value="" disabled>
                    Choose...
                  </option>
                  {INTENSITIES.map((intensity) => (
                    <option key={intensity} value={intensity}>
                      {INTENSITY_LABELS[intensity]}
                    </option>
                  ))}
                </select>
                {fieldError('intensity')}
              </div>
            )}

            <div className="field">
              <label htmlFor={`${id}-rest`}>Rest between sessions</label>
              <div className="input-with-unit">
                <input
                  id={`${id}-rest`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={values.restDaysBetween}
                  onChange={(e) => setField('restDaysBetween', e.target.value)}
                  placeholder={restPlaceholder(values.type, isTraining && values.intensity ? values.intensity : null)}
                  disabled={isBusy}
                  {...errorProps('restDaysBetween')}
                />
                {values.restDaysBetween !== '' && (
                  <span className="input-unit" aria-hidden="true">
                    days
                  </span>
                )}
              </div>
              {fieldError('restDaysBetween')}
            </div>
          </div>

          <div className="goal-dialog-more">
            <button
              type="button"
              className="goal-dialog-more-toggle"
              aria-expanded={showMore}
              aria-controls={`${id}-more`}
              onClick={() => setShowMore((open) => !open)}
            >
              <Chevron />
              <span className="goal-dialog-more-label">More options</span>
              {!showMore && <span className="goal-dialog-more-hint">preferred time, priority, not on same day as</span>}
            </button>

            {showMore && (
              <div id={`${id}-more`} className="goal-dialog-more-content">
                <div className="form-row">
                  <div className="field">
                    <label htmlFor={`${id}-preferred-time`}>Preferred time</label>
                    <select
                      id={`${id}-preferred-time`}
                      value={values.preferredTime}
                      onChange={(e) => setField('preferredTime', e.target.value as ActivityGoalPreferredTime)}
                      disabled={isBusy}
                    >
                      {PREFERRED_TIMES.map((time) => (
                        <option key={time} value={time}>
                          {PREFERRED_TIME_LABELS[time]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor={`${id}-priority`}>Priority</label>
                    <select
                      id={`${id}-priority`}
                      value={values.priority}
                      onChange={(e) => setField('priority', e.target.value as PriorityLevel)}
                      disabled={isBusy}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option key={option.level} value={option.level}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor={`${id}-separate`}>Not on the same day as</label>
                  <GoalMultiSelect
                    id={`${id}-separate`}
                    options={otherGoals}
                    value={values.separateFromGoalIds}
                    onChange={(ids) => setField('separateFromGoalIds', ids)}
                    disabled={isBusy}
                    aria-describedby={`${id}-separate-help`}
                  />
                  <p id={`${id}-separate-help`} className="field-help">
                    The planner never puts these on the same day.
                  </p>
                </div>
              </div>
            )}
          </div>

          {apiError && <ErrorBanner message={apiError} />}

          <div className="app-dialog-actions">
            <button type="button" className="button button--ghost" onClick={requestClose} disabled={isBusy}>
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={isBusy}>
              {isBusy ? 'Saving...' : goal ? 'Save' : 'Create goal'}
            </button>
          </div>
        </form>
      </Dialog>

      {confirmDialog}
    </>
  );
}
