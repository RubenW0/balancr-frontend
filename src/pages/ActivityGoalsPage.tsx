import { useState } from 'react';
import { useActivityGoals } from '../hooks/useActivityGoals';
import { ActivityGoalForm } from '../components/ActivityGoals/components/ActivityGoalForm';
import { ActivityGoalList } from '../components/ActivityGoals/components/ActivityGoalList';
import { ConfirmDialog } from '../components/Dialog/components/ConfirmDialog';
import { Dialog } from '../components/Dialog/components/Dialog';
import type { ActivityGoalResponseDTO } from '../types/activityGoal';
import './ActivityGoalsPage.css';

export function ActivityGoalsPage() {
  const { activityGoals, isLoading, error, addActivityGoal, updateActivityGoal, deleteActivityGoal } =
    useActivityGoals();
  const [editingGoal, setEditingGoal] = useState<ActivityGoalResponseDTO | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<ActivityGoalResponseDTO | null>(null);

  return (
    <section className="activity-goals-page">
      <h1>Activity Goals</h1>
      <p className="activity-goals-subtitle">
        {activityGoals.length === 0
          ? 'Overview of your activity goals'
          : `${activityGoals.length} activity goal(s)`}
      </p>

      <ActivityGoalForm onSubmit={addActivityGoal} />

      {error && (
        <p className="activity-goals-error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="activity-goals-loading">Loading activity goals...</p>
      ) : (
        <ActivityGoalList activityGoals={activityGoals} onEdit={setEditingGoal} onDelete={setDeletingGoal} />
      )}

      {editingGoal && (
        <Dialog title="Edit activity goal" onClose={() => setEditingGoal(null)}>
          <ActivityGoalForm
            key={editingGoal.id}
            goal={editingGoal}
            onSubmit={async (payload) => {
              await updateActivityGoal(editingGoal.id, payload);
              setEditingGoal(null);
            }}
            onCancel={() => setEditingGoal(null)}
          />
        </Dialog>
      )}

      {deletingGoal && (
        <ConfirmDialog
          title="Delete activity goal"
          message={`Delete "${deletingGoal.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteActivityGoal(deletingGoal.id)}
          onClose={() => setDeletingGoal(null)}
        />
      )}
    </section>
  );
}
