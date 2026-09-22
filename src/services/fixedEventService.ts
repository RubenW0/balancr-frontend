import { apiClient } from './apiClient';
import type { CreateFixedEventPayload, FixedEvent } from '../types/fixedEvent';

export async function getFixedEvents(): Promise<FixedEvent[]> {
  const { data } = await apiClient.get<FixedEvent[]>('/fixed-events');
  return data;
}

export async function createFixedEvent(payload: CreateFixedEventPayload): Promise<FixedEvent> {
  const { data } = await apiClient.post<FixedEvent>('/fixed-events', payload);
  return data;
}
