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
    <li className="activity-goal-item">
      <div className="activity-goal-info">
        <span className="activity-goal-name">{goal.name}</span>
        <span className="activity-goal-detail">
          {TYPE_LABELS[goal.type]}
          {goal.intensity && <> ({INTENSITY_LABELS[goal.intensity].toLowerCase()})</>} &middot;{' '}
          {goal.frequencyPerWeek}x per week &middot; {goal.durationMinutes} min
        </span>
        <span className="activity-goal-detail">
          {formatRest(goal.restDaysBetween)} &middot; Priority: {PRIORITY_LABELS[goal.priority]}
          {goal.preferredTime !== 'ANY' && (
            <> &middot; Preferred: {PREFERRED_TIME_LABELS[goal.preferredTime]}</>
          )}
        </span>
      </div>
      <div className="activity-goal-actions">
        <button type="button" onClick={() => onEdit(goal)}>
          Edit
        </button>
        <button type="button" className="activity-goal-delete" onClick={() => onDelete(goal)}>
          Delete
        </button>
      </div>
    </li>
  );
}
