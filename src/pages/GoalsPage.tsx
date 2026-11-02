import { useState } from 'react';
import { ErrorBanner } from '../components/Banner/ErrorBanner';
import { GoalCard } from '../components/ActivityGoals/components/GoalCard';
import { GoalDialog } from '../components/ActivityGoals/components/GoalDialog';
import { goalsSummaryText } from '../components/ActivityGoals/goalText';
import { ConfirmDialog } from '../components/Dialog/components/ConfirmDialog';
import { useActivityGoals } from '../hooks/useActivityGoals';
import type { ActivityGoalResponseDTO } from '../types/activityGoal';
import './GoalsPage.css';

type DialogState = { mode: 'create' } | { mode: 'edit'; goal: ActivityGoalResponseDTO };

export function GoalsPage() {
  const { activityGoals, isLoading, error, reload, addActivityGoal, updateActivityGoal, deleteActivityGoal } =
    useActivityGoals();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<ActivityGoalResponseDTO | null>(null);

  const openCreate = () => setDialog({ mode: 'create' });
  const openEdit = (goal: ActivityGoalResponseDTO) => setDialog({ mode: 'edit', goal });
  const closeDialog = () => setDialog(null);
  const hasGoals = activityGoals.length > 0;

  return (
    <section className="page goals-page">
      <header className="page-header">
        <h1>Goals</h1>
        {hasGoals && <span className="page-summary">{goalsSummaryText(activityGoals)}</span>}
        <div className="page-actions">
          <button type="button" className="button button--primary" onClick={openCreate}>
            + New goal
          </button>
        </div>
      </header>

      {error && (
        <div className="goals-error">
          <ErrorBanner message={error} onRetry={reload} />
        </div>
      )}

      {isLoading && !hasGoals ? (
        <p className="muted">Loading goals...</p>
      ) : hasGoals ? (
        <ul className="goal-grid">
          {activityGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={openEdit} onDelete={setDeletingGoal} />
          ))}
        </ul>
      ) : (
        !error && (
          <div className="goal-empty">
            <span>No goals yet. Add what you want to fit into your week.</span>
            <button type="button" className="button button--primary" onClick={openCreate}>
              + New goal
            </button>
          </div>
        )
      )}

      {dialog?.mode === 'create' && <GoalDialog onSubmit={addActivityGoal} onClose={closeDialog} />}
      {dialog?.mode === 'edit' && (
        <GoalDialog
          key={dialog.goal.id}
          goal={dialog.goal}
          onSubmit={(payload) => updateActivityGoal(dialog.goal.id, payload)}
          onClose={closeDialog}
        />
      )}

      {deletingGoal && (
        <ConfirmDialog
          title="Delete goal"
          message={`Delete "${deletingGoal.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteActivityGoal(deletingGoal.id)}
          onClose={() => setDeletingGoal(null)}
        />
      )}
    </section>
  );
}
