import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PlanResponseDTO, ScheduledSessionDTO } from '../../../types/plan';
import { PlanToolbar } from './PlanToolbar';

function session(sessionNumber: number): ScheduledSessionDTO {
  return {
    goalId: 1,
    goalName: 'Gym',
    type: 'TRAINING',
    sessionNumber,
    start: '2026-10-26T10:00:00',
    end: '2026-10-26T11:00:00',
  };
}

function renderToolbar(plan: PlanResponseDTO | null) {
  render(<PlanToolbar plan={plan} isPlanning={false} disabled={false} onPlan={vi.fn()} onClear={vi.fn()} />);
}

describe('PlanToolbar', () => {
  it('shows a short chip with the full explanation in its tooltip', () => {
    const scheduled = Array.from({ length: 10 }, (_, index) => session(index + 1));
    renderToolbar({ weekStart: '2026-10-26', scheduled, unscheduled: [] });

    const chip = screen.getByText('10 planned · preview');
    expect(chip.getAttribute('title')).toBe(
      '10 sessions planned. This plan is a preview and is not saved: it disappears when you go to another week or change a fixed event.',
    );
    expect(screen.queryByText(/This plan is a preview/)).toBeNull();
  });

  it('shows no chip without a plan', () => {
    renderToolbar(null);
    expect(screen.queryByText(/planned · preview/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear plan' })).toBeNull();
  });
});
