import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../../services/apiClient';
import { ACTIVITY_GOAL_NAME_MAX_LENGTH } from '../../../types/activityGoal';
import type {
  ActivityGoalIntensity,
  ActivityGoalPreferredTime,
  ActivityGoalPriority,
  ActivityGoalRequestDTO,
  ActivityGoalResponseDTO,
  ActivityGoalType,
} from '../../../types/activityGoal';
import { PREFERRED_TIME_LABELS, PRIORITY_LABELS } from '../activityGoalLabels';
import '../styles/ActivityGoalForm.css';

interface ActivityGoalFormProps {
  /** When given, the form edits this goal; otherwise it creates a new one. */
  goal?: ActivityGoalResponseDTO;
  onSubmit: (payload: ActivityGoalRequestDTO) => Promise<void>;
  /** Shows a Cancel button (used in the edit dialog). */
  onCancel?: () => void;
}

const PRIORITIES: ActivityGoalPriority[] = [1, 2, 3];
const PREFERRED_TIMES: ActivityGoalPreferredTime[] = ['ANY', 'MORNING', 'AFTERNOON', 'EVENING'];

export function ActivityGoalForm({ goal, onSubmit, onCancel }: ActivityGoalFormProps) {
  const isEdit = goal !== undefined;
  // Unique ids, because the create form and the edit dialog can be on screen together.
  const id = useId();
  const [name, setName] = useState(goal?.name ?? '');
  const [type, setType] = useState<ActivityGoalType>(goal?.type ?? 'TRAINING');
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(goal ? String(goal.frequencyPerWeek) : '');
  const [durationMinutes, setDurationMinutes] = useState(goal ? String(goal.durationMinutes) : '');
  const [intensity, setIntensity] = useState<ActivityGoalIntensity | ''>(goal?.intensity ?? '');
  const [restDaysBetween, setRestDaysBetween] = useState(
    goal?.restDaysBetween != null ? String(goal.restDaysBetween) : '',
  );
  const [priority, setPriority] = useState<ActivityGoalPriority>(goal?.priority ?? 2);
  const [preferredTime, setPreferredTime] = useState<ActivityGoalPreferredTime>(
    goal?.preferredTime ?? 'ANY',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTypeChange = (nextType: ActivityGoalType) => {
    setType(nextType);
    if (nextType !== 'TRAINING') {
      setIntensity('');
    }
  };

  const showError = (message: string) => {
    setSuccessMessage(null);
    setValidationError(message);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const frequency = Number(frequencyPerWeek);
    const duration = Number(durationMinutes);
    const restDays = restDaysBetween.trim() === '' ? null : Number(restDaysBetween);

    if (!trimmedName || trimmedName.length > ACTIVITY_GOAL_NAME_MAX_LENGTH) {
      showError(`Name is required and can be at most ${ACTIVITY_GOAL_NAME_MAX_LENGTH} characters.`);
      return;
    }

    if (!frequencyPerWeek || !Number.isInteger(frequency) || frequency < 1 || frequency > 7) {
      showError('Frequency per week must be a whole number between 1 and 7.');
      return;
    }

    if (!durationMinutes || !Number.isInteger(duration) || duration < 1) {
      showError('Duration must be a whole number of minutes greater than 0.');
      return;
    }

    if (type === 'TRAINING' && !intensity) {
      showError('Intensity is required for training goals.');
      return;
    }

    if (restDays !== null && (!Number.isInteger(restDays) || restDays < 0)) {
      showError('Rest days must be a whole number of 0 or more, or empty.');
      return;
    }

    setValidationError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      // Always send every field: PUT resets omitted ones (priority to 2, rest days to null, preferred time to ANY).
      await onSubmit({
        name: trimmedName,
        type,
        frequencyPerWeek: frequency,
        durationMinutes: duration,
        intensity: type === 'TRAINING' ? (intensity as ActivityGoalIntensity) : null,
        restDaysBetween: restDays,
        priority,
        preferredTime,
      });
      if (!isEdit) {
        setName('');
        setType('TRAINING');
        setFrequencyPerWeek('');
        setDurationMinutes('');
        setIntensity('');
        setRestDaysBetween('');
        setPriority(2);
        setPreferredTime('ANY');
        setSuccessMessage('Activity goal added successfully.');
      }
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Unknown error while saving the activity goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = isEdit
    ? isSubmitting ? 'Saving...' : 'Save changes'
    : isSubmitting ? 'Adding...' : 'Add activity goal';

  return (
    <form
      className={`activity-goal-form${isEdit ? ' activity-goal-form-embedded' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="activity-goal-form-field">
        <label htmlFor={`${id}-name`}>Name</label>
        <input
          id={`${id}-name`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gym, Statistics"
          maxLength={ACTIVITY_GOAL_NAME_MAX_LENGTH}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="activity-goal-form-field">
        <label htmlFor={`${id}-type`}>Type</label>
        <select
          id={`${id}-type`}
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ActivityGoalType)}
          disabled={isSubmitting}
        >
          <option value="TRAINING">Training</option>
          <option value="STUDY">Study</option>
        </select>
      </div>

      <div className="activity-goal-form-row">
        <div className="activity-goal-form-field">
          <label htmlFor={`${id}-frequency`}>Frequency per week</label>
          <input
            id={`${id}-frequency`}
            type="number"
            min={1}
            max={7}
            value={frequencyPerWeek}
            onChange={(e) => setFrequencyPerWeek(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="activity-goal-form-field">
          <label htmlFor={`${id}-duration`}>Duration (minutes)</label>
          <input
            id={`${id}-duration`}
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {type === 'TRAINING' && (
        <div className="activity-goal-form-field">
          <label htmlFor={`${id}-intensity`}>Intensity</label>
          <select
            id={`${id}-intensity`}
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as ActivityGoalIntensity)}
            disabled={isSubmitting}
          >
            <option value="">Select intensity</option>
            <option value="LIGHT">Light</option>
            <option value="MEDIUM">Medium</option>
            <option value="HEAVY">Heavy</option>
          </select>
        </div>
      )}

      <div className="activity-goal-form-field">
        <label htmlFor={`${id}-rest`}>Rest days between (optional)</label>
        <input
          id={`${id}-rest`}
          type="number"
          min={0}
          value={restDaysBetween}
          onChange={(e) => setRestDaysBetween(e.target.value)}
          aria-describedby={`${id}-rest-help`}
          disabled={isSubmitting}
        />
        <p id={`${id}-rest-help`} className="activity-goal-form-help">
          Leave empty to use the default for the intensity (light 0, medium 1, heavy 2 days).
        </p>
      </div>

      <div className="activity-goal-form-row">
        <div className="activity-goal-form-field">
          <label htmlFor={`${id}-priority`}>Priority</label>
          <select
            id={`${id}-priority`}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as ActivityGoalPriority)}
            disabled={isSubmitting}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="activity-goal-form-field">
          <label htmlFor={`${id}-preferred-time`}>Preferred time</label>
          <select
            id={`${id}-preferred-time`}
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value as ActivityGoalPreferredTime)}
            disabled={isSubmitting}
          >
            {PREFERRED_TIMES.map((value) => (
              <option key={value} value={value}>
                {PREFERRED_TIME_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {validationError && (
        <p className="activity-goal-form-error" role="alert">
          {validationError}
        </p>
      )}
      {successMessage && <p className="activity-goal-form-success">{successMessage}</p>}

      <div className="activity-goal-form-actions">
        {onCancel && (
          <button
            type="button"
            className="activity-goal-form-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
