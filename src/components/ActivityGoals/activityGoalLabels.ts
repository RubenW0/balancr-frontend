import type {
  ActivityGoalIntensity,
  ActivityGoalPreferredTime,
  ActivityGoalPriority,
  ActivityGoalType,
} from '../../types/activityGoal';

export const TYPE_LABELS: Record<ActivityGoalType, string> = {
  TRAINING: 'Training',
  STUDY: 'Study',
};

export const INTENSITY_LABELS: Record<ActivityGoalIntensity, string> = {
  LIGHT: 'Light',
  MEDIUM: 'Medium',
  HEAVY: 'Heavy',
};

export const PRIORITY_LABELS: Record<ActivityGoalPriority, string> = {
  1: 'Low',
  2: 'Normal',
  3: 'High',
};

export const PREFERRED_TIME_LABELS: Record<ActivityGoalPreferredTime, string> = {
  ANY: 'Any',
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};
