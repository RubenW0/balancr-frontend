/**
 * The only place that maps priority labels to the numeric API value.
 *
 * Direction: the backend scheduler sorts by priority DESCENDING
 * (SchedulingService.PROCESSING_ORDER), so a HIGHER number is planned FIRST.
 * This must match SchedulingService; if that order ever flips, flip the values here.
 */
export type PriorityLevel = 'HIGH' | 'NORMAL' | 'LOW';

export interface PriorityOption {
  level: PriorityLevel;
  label: string;
  value: number;
}

export const PRIORITY_OPTIONS: readonly PriorityOption[] = [
  { level: 'HIGH', label: 'High', value: 3 },
  { level: 'NORMAL', label: 'Normal', value: 2 },
  { level: 'LOW', label: 'Low', value: 1 },
];

export const DEFAULT_PRIORITY_LEVEL: PriorityLevel = 'NORMAL';

/** API number -> level; anything above Normal counts as High, anything below as Low. */
export function priorityToLevel(priority: number): PriorityLevel {
  if (priority >= 3) return 'HIGH';
  if (priority <= 1) return 'LOW';
  return 'NORMAL';
}

/**
 * Level -> API number. When the level of an existing goal did not change, its
 * original number is kept, so saving never rewrites a value the user didn't touch.
 */
export function levelToPriority(level: PriorityLevel, originalPriority?: number): number {
  if (originalPriority !== undefined && priorityToLevel(originalPriority) === level) return originalPriority;
  return PRIORITY_OPTIONS.find((option) => option.level === level)!.value;
}

export function priorityLabel(level: PriorityLevel): string {
  return PRIORITY_OPTIONS.find((option) => option.level === level)!.label;
}
