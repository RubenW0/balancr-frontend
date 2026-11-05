export type ActivityGoalType = 'TRAINING' | 'STUDY';

export type ActivityGoalIntensity = 'LIGHT' | 'MEDIUM' | 'HEAVY';

/** Part of the day the planner should prefer; ANY (the default, also sent as null) means no preference. */
export type ActivityGoalPreferredTime = 'ANY' | 'MORNING' | 'AFTERNOON' | 'EVENING';

export const ACTIVITY_GOAL_NAME_MAX_LENGTH = 50;

export interface ActivityGoalResponseDTO {
  id: number;
  name: string;
  type: ActivityGoalType;
  frequencyPerWeek: number;
  durationMinutes: number;
  /** Set for TRAINING, null for STUDY. */
  intensity: ActivityGoalIntensity | null;
  /** null means: use the default for the intensity. */
  restDaysBetween: number | null;
  /** 1-3, higher is planned first; see components/ActivityGoals/priorityOptions.ts. */
  priority: number;
  preferredTime: ActivityGoalPreferredTime | null;
  /**
   * Goals this one is never planned on the same day as, sorted, [] when none.
   * The relation is symmetric: if A lists B, B also lists A.
   */
  separateFromGoalIds: number[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST and PUT. PUT replaces the whole goal, so always send every field. */
export interface ActivityGoalRequestDTO {
  /** Required, 1 to 50 characters. */
  name: string;
  type: ActivityGoalType;
  frequencyPerWeek: number;
  durationMinutes: number;
  intensity: ActivityGoalIntensity | null;
  restDaysBetween: number | null;
  priority: number;
  /** null = no preference (the backend stores ANY). */
  preferredTime: ActivityGoalPreferredTime | null;
  /** Ids of the user's other goals; replaces the whole set (also the side saved on the other goal). */
  separateFromGoalIds: number[];
}
