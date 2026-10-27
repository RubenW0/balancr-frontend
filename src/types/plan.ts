import type { ActivityGoalType } from './activityGoal';

/** Body for POST /plan. weekStart is a local date, strictly YYYY-MM-DD. */
export interface PlanRequestDTO {
  weekStart: string;
}

export interface ScheduledSessionDTO {
  goalId: number;
  goalName: string;
  type: ActivityGoalType;
  sessionNumber: number;
  /** ISO LocalDateTime, e.g. 2026-10-26T10:00:00. */
  start: string;
  end: string;
}

export type UnscheduledReason = 'NO_FREE_BLOCK' | 'NO_VALID_SLOT';

export interface UnscheduledSessionDTO {
  goalId: number;
  goalName: string;
  type: ActivityGoalType;
  sessionNumber: number;
  reason: UnscheduledReason;
}

/** A computed plan for one week. The backend does not store it. */
export interface PlanResponseDTO {
  weekStart: string;
  scheduled: ScheduledSessionDTO[];
  unscheduled: UnscheduledSessionDTO[];
}
