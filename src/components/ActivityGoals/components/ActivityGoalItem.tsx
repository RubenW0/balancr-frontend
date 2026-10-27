import type { ActivityGoalResponseDTO } from '../../../types/activityGoal';
import {
  INTENSITY_LABELS,
  PREFERRED_TIME_LABELS,
  PRIORITY_LABELS,
  TYPE_LABELS,
} from '../activityGoalLabels';
import '../styles/ActivityGoalItem.css';

interface ActivityGoalItemProps {
  goal: ActivityGoalResponseDTO;
  onEdit: (goal: ActivityGoalResponseDTO) => void;
  onDelete: (goal: ActivityGoalResponseDTO) => void;
}

function formatRest(restDaysBetween: number | null): string {
  if (restDaysBetween === null) return 'Rest: default';
  return `Rest: ${restDaysBetween} ${restDaysBetween === 1 ? 'day' : 'days'}`;
}

export function ActivityGoalItem({ goal, onEdit, onDelete }: ActivityGoalItemProps) {
  return (
    <li className="card activity-goal-item">
      <div className="activity-goal-info">
        <span className="activity-goal-name">{goal.name}</span>
        <span className="activity-goal-detail">
          {TYPE_LABELS[goal.type]}
          {goal.intensity && <> ({INTENSITY_LABELS[goal.intensity].toLowerCase()})</>} &middot;{' '}
          {goal.frequencyPerWeek}x per week &middot; {goal.durationMinutes} min
        </span>
        <span className="activity-goal-meta">
          <span className="pill">{formatRest(goal.restDaysBetween)}</span>
          <span className="pill">Priority: {PRIORITY_LABELS[goal.priority]}</span>
          {goal.preferredTime !== 'ANY' && (
            <span className="pill">Preferred: {PREFERRED_TIME_LABELS[goal.preferredTime]}</span>
          )}
        </span>
      </div>
      <div className="activity-goal-actions">
        <button type="button" className="button button--secondary button--sm" onClick={() => onEdit(goal)}>
          Edit
        </button>
        <button type="button" className="button button--danger button--sm" onClick={() => onDelete(goal)}>
          Delete
        </button>
      </div>
    </li>
  );
}
