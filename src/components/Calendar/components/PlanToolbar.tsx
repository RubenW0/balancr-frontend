import type { PlanResponseDTO } from '../../../types/plan';
import '../styles/Plan.css';

interface PlanToolbarProps {
  plan: PlanResponseDTO | null;
  isPlanning: boolean;
  disabled: boolean;
  onPlan: () => void;
  onClear: () => void;
}

/** Planning controls on the right of the calendar's top bar: status, "Clear plan" and "Plan my week". */
export function PlanToolbar({ plan, isPlanning, disabled, onPlan, onClear }: PlanToolbarProps) {
  const note = plan
    ? `${plan.scheduled.length} session(s) planned. This plan is a preview and is not saved: it disappears when you go to another week or change a fixed event.`
    : null;

  return (
    <div className="plan-toolbar">
      <div className="plan-toolbar-status" aria-live="polite">
        {isPlanning && <span className="plan-toolbar-note">Planning your week...</span>}
        {plan && plan.unscheduled.length === 0 && <span className="pill pill--success">Everything fits</span>}
        {note && (
          <span className="plan-toolbar-note" title={note}>
            {note}
          </span>
        )}
      </div>
      {plan && (
        <button type="button" className="button button--secondary" onClick={onClear}>
          Clear plan
        </button>
      )}
      <button type="button" className="button button--primary" onClick={onPlan} disabled={disabled || isPlanning}>
        {isPlanning ? 'Planning...' : 'Plan my week'}
      </button>
    </div>
  );
}
