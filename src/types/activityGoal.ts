export type ActivityGoalType = 'TRAINING' | 'STUDY';

export type ActivityGoalIntensity = 'LIGHT' | 'MEDIUM' | 'HEAVY';

/** 1 = low, 2 = normal (the default), 3 = high. */
export type ActivityGoalPriority = 1 | 2 | 3;

/** Part of the day the planner should prefer; ANY (the default) means no preference. */
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
  priority: ActivityGoalPriority;
  preferredTime: ActivityGoalPreferredTime;
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
  priority: ActivityGoalPriority;
  preferredTime: ActivityGoalPreferredTime;
}
