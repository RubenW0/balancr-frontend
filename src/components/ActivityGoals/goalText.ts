import type { ActivityGoalIntensity, ActivityGoalResponseDTO, ActivityGoalType } from '../../types/activityGoal';
import { INTENSITY_LABELS, PREFERRED_TIME_LABELS } from './activityGoalLabels';

// Mirrors ActivityGoal.effectiveRestDays() in the backend: used when restDaysBetween is empty.
const AUTO_REST_DAYS: Record<ActivityGoalIntensity, number> = {
  LIGHT: 0,
  MEDIUM: 1,
  HEAVY: 2,
};

/** Rest days the backend applies when restDaysBetween is null. Study (no intensity) gets 0. */
export function autoRestDays(type: ActivityGoalType, intensity: ActivityGoalIntensity | null): number {
  if (type !== 'TRAINING' || intensity === null) return 0;
  return AUTO_REST_DAYS[intensity];
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** Placeholder of the "Rest between sessions" field, e.g. "Auto: 1 day". */
export function restPlaceholder(type: ActivityGoalType, intensity: ActivityGoalIntensity | null): string {
  return `Auto: ${formatDays(autoRestDays(type, intensity))}`;
}

/** "3x per week · 60 min" */
export function goalScheduleText(goal: Pick<ActivityGoalResponseDTO, 'frequencyPerWeek' | 'durationMinutes'>): string {
  return `${goal.frequencyPerWeek}x per week · ${goal.durationMinutes} min`;
}

/**
 * The optional second line of a goal card, e.g. "heavy · rest 2 days · evening".
 * Only parts that apply are included; null when nothing does. Rest is shown when
 * set explicitly or, for Training, as the effective value, but never as 0 days.
 */
export function goalDetailsText(goal: ActivityGoalResponseDTO): string | null {
  const parts: string[] = [];
  const isTraining = goal.type === 'TRAINING';

  if (isTraining && goal.intensity) parts.push(INTENSITY_LABELS[goal.intensity].toLowerCase());

  const rest = goal.restDaysBetween ?? (isTraining ? autoRestDays(goal.type, goal.intensity) : 0);
  if (rest > 0) parts.push(`rest ${formatDays(rest)}`);

  if (goal.preferredTime && goal.preferredTime !== 'ANY') {
    parts.push(PREFERRED_TIME_LABELS[goal.preferredTime].toLowerCase());
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

/** "6 goals · 14h per week" (total = sum of frequency x duration). */
export function goalsSummaryText(goals: ActivityGoalResponseDTO[]): string {
  const minutes = goals.reduce((sum, goal) => sum + goal.frequencyPerWeek * goal.durationMinutes, 0);
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${goals.length} ${goals.length === 1 ? 'goal' : 'goals'} · ${hours}h per week`;
}
