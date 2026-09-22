export interface FixedEvent {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  isMovable: boolean;
}

export interface CreateFixedEventPayload {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
}
