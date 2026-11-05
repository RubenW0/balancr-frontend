import type { PlanResponseDTO } from '../../types/plan';

/** Short chip text for a plan ("10 planned · preview") and the full explanation for its tooltip. */
export function planSummary(plan: PlanResponseDTO): { label: string; explanation: string } {
  const count = plan.scheduled.length;
  return {
    label: `${count} planned · preview`,
    explanation:
      `${count} ${count === 1 ? 'session' : 'sessions'} planned. This plan is a preview and is not saved: ` +
      'it disappears when you go to another week or change a fixed event.',
  };
}
