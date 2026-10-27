export const FIXED_EVENT_TYPES = ['class', 'work', 'exam', 'other'] as const;

export interface FixedEvent {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  isMovable: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST and PUT. Date-times are ISO LocalDateTime without a time zone. */
export interface CreateFixedEventPayload {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  isMovable?: boolean;
}

/** Window for GET /fixed-events, as ISO LocalDateTime strings. */
export interface FixedEventRange {
  from: string;
  to: string;
}
