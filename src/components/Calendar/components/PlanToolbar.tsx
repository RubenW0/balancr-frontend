import type { ReactNode } from 'react';
import type { PlanResponseDTO } from '../../../types/plan';
import { planSummary } from '../planSummary';
import '../styles/Plan.css';

interface PlanToolbarProps {
  plan: PlanResponseDTO | null;
  isPlanning: boolean;
  disabled: boolean;
  onPlan: () => void;
  onClear: () => void;
  /** Extra actions shown left of "Clear plan" (e.g. "+ Event"). */
  children?: ReactNode;
}

/** Planning controls on the right of the calendar's top bar: status, extra actions, "Clear plan" and "Plan my week". */
export function PlanToolbar({ plan, isPlanning, disabled, onPlan, onClear, children }: PlanToolbarProps) {
  const summary = plan ? planSummary(plan) : null;

  return (
    <div className="plan-toolbar">
      <div className="plan-toolbar-status" aria-live="polite">
        {isPlanning && <span className="plan-toolbar-note">Planning your week...</span>}
        {plan && plan.unscheduled.length === 0 && <span className="pill pill--success">Everything fits</span>}
        {summary && (
          <span className="pill plan-toolbar-chip" title={summary.explanation}>
            {summary.label}
          </span>
        )}
      </div>
      {children}
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
