import type { MouseEvent } from 'react';
import type { ActivityGoalResponseDTO } from '../../../types/activityGoal';
import { TYPE_LABELS } from '../activityGoalLabels';
import { goalDetailsText, goalScheduleText } from '../goalText';
import { priorityLabel, priorityToLevel } from '../priorityOptions';
import '../styles/GoalCard.css';

interface GoalCardProps {
  goal: ActivityGoalResponseDTO;
  onEdit: (goal: ActivityGoalResponseDTO) => void;
  onDelete: (goal: ActivityGoalResponseDTO) => void;
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const level = priorityToLevel(goal.priority);
  const details = goalDetailsText(goal);

  // The icon buttons sit inside the clickable card, so keep their clicks from also opening the editor.
  const handleAction = (e: MouseEvent, action: (goal: ActivityGoalResponseDTO) => void) => {
    e.stopPropagation();
    action(goal);
  };

  return (
    <li className={`goal-card goal-card--${goal.type.toLowerCase()}`} onClick={() => onEdit(goal)}>
      <div className="goal-card-head">
        <div className="goal-card-title">
          <h2 className="goal-card-name">{goal.name}</h2>
          <p className="goal-card-category">{TYPE_LABELS[goal.type]}</p>
        </div>
        {level !== 'NORMAL' && <span className="pill goal-card-priority">{priorityLabel(level)}</span>}
      </div>

      <p className="goal-card-schedule">{goalScheduleText(goal)}</p>
      {details && <p className="goal-card-details">{details}</p>}

      <div className="goal-card-actions">
        <button
          type="button"
          className="icon-button"
          onClick={(e) => handleAction(e, onEdit)}
          aria-label={`Edit ${goal.name}`}
          title="Edit"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          className="icon-button icon-button--danger"
          onClick={(e) => handleAction(e, onDelete)}
          aria-label={`Delete ${goal.name}`}
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
