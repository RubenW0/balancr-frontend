import { describe, expect, it } from 'vitest';
import type { ActivityGoalResponseDTO } from '../../types/activityGoal';
import { goalDetailsText, goalsSummaryText, restPlaceholder } from './goalText';

function goal(overrides: Partial<ActivityGoalResponseDTO>): ActivityGoalResponseDTO {
  return {
    id: 1,
    name: 'Gym',
    type: 'TRAINING',
    frequencyPerWeek: 3,
    durationMinutes: 60,
    intensity: 'MEDIUM',
    restDaysBetween: null,
    priority: 2,
    preferredTime: 'ANY',
    userId: 1,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('restPlaceholder', () => {
  it('shows the automatic rest days for each intensity', () => {
    expect(restPlaceholder('TRAINING', 'LIGHT')).toBe('Auto: 0 days');
    expect(restPlaceholder('TRAINING', 'MEDIUM')).toBe('Auto: 1 day');
    expect(restPlaceholder('TRAINING', 'HEAVY')).toBe('Auto: 2 days');
  });

  it('uses 0 days for Study and for Training without an intensity yet', () => {
    expect(restPlaceholder('STUDY', null)).toBe('Auto: 0 days');
    expect(restPlaceholder('TRAINING', null)).toBe('Auto: 0 days');
  });
});

describe('goalDetailsText', () => {
  it('shows intensity, effective rest and preferred time for Training', () => {
    expect(goalDetailsText(goal({ intensity: 'HEAVY', preferredTime: 'EVENING' }))).toBe('heavy · rest 2 days · evening');
  });

  it('never prints rest 0 days or "any" time', () => {
    expect(goalDetailsText(goal({ intensity: 'LIGHT', preferredTime: null }))).toBe('light');
    expect(goalDetailsText(goal({ intensity: 'MEDIUM', restDaysBetween: 0 }))).toBe('medium');
  });

  it('shows rest for Study only when it was set', () => {
    expect(goalDetailsText(goal({ type: 'STUDY', intensity: null }))).toBeNull();
    expect(goalDetailsText(goal({ type: 'STUDY', intensity: null, restDaysBetween: 1 }))).toBe('rest 1 day');
  });
});

describe('goalsSummaryText', () => {
  it('sums frequency x duration in hours', () => {
    expect(goalsSummaryText([goal({}), goal({ frequencyPerWeek: 2, durationMinutes: 45 })])).toBe(
      '2 goals · 4.5h per week',
    );
    expect(goalsSummaryText([goal({})])).toBe('1 goal · 3h per week');
  });
});
