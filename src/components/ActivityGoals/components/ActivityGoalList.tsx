import type { ActivityGoalResponseDTO } from '../../../types/activityGoal';
import { ActivityGoalItem } from './ActivityGoalItem';
import '../styles/ActivityGoalList.css';

interface ActivityGoalListProps {
  activityGoals: ActivityGoalResponseDTO[];
  onEdit: (goal: ActivityGoalResponseDTO) => void;
  onDelete: (goal: ActivityGoalResponseDTO) => void;
}

export function ActivityGoalList({ activityGoals, onEdit, onDelete }: ActivityGoalListProps) {
  if (activityGoals.length === 0) {
    return <p className="card activity-goal-list-empty">No activity goals yet. Add one above.</p>;
  }

  return (
    <ul className="activity-goal-list">
      {activityGoals.map((goal) => (
        <ActivityGoalItem key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
