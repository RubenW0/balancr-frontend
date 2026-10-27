import type { PlanResponseDTO } from '../../../types/plan';
import '../styles/Plan.css';

interface PlanToolbarProps {
  plan: PlanResponseDTO | null;
  isPlanning: boolean;
  error: string | null;
  disabled: boolean;
  onPlan: () => void;
  onClear: () => void;
}

/** "Plan my week" / "Clear plan" above the calendar, with the planning status. */
export function PlanToolbar({ plan, isPlanning, error, disabled, onPlan, onClear }: PlanToolbarProps) {
  return (
    <div className="plan-toolbar">
      <div className="plan-toolbar-buttons">
        <button type="button" onClick={onPlan} disabled={disabled || isPlanning}>
          {isPlanning ? 'Planning...' : 'Plan my week'}
        </button>
        {plan && (
          <button type="button" className="plan-toolbar-clear" onClick={onClear}>
            Clear plan
          </button>
        )}
      </div>

      <div aria-live="polite">
        {isPlanning && <p className="plan-toolbar-note">Planning your week...</p>}
        {plan && (
          <p className="plan-toolbar-note">
            {plan.scheduled.length} session(s) planned. This plan is a preview and is not saved: it disappears
            when you go to another week or change a fixed event.
          </p>
        )}
      </div>

      {error && (
        <p className="plan-error" role="alert">
          Could not plan the week: {error}
        </p>
      )}
    </div>
  );
}
