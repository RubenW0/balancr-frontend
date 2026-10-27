import { apiClient } from './apiClient';
import type { CreateFixedEventPayload, FixedEvent, FixedEventRange } from '../types/fixedEvent';

/** All fixed events, or only those overlapping `range` when it is given. */
export async function getFixedEvents(range?: FixedEventRange): Promise<FixedEvent[]> {
  const { data } = await apiClient.get<FixedEvent[]>('/fixed-events', { params: range });
  return data;
}

export async function createFixedEvent(payload: CreateFixedEventPayload): Promise<FixedEvent> {
  const { data } = await apiClient.post<FixedEvent>('/fixed-events', payload);
  return data;
}

export async function updateFixedEvent(id: number, payload: CreateFixedEventPayload): Promise<FixedEvent> {
  const { data } = await apiClient.put<FixedEvent>(`/fixed-events/${id}`, payload);
  return data;
}

export async function deleteFixedEvent(id: number): Promise<void> {
  await apiClient.delete(`/fixed-events/${id}`);
}
