import { apiClient } from './apiClient';
import type { AvailabilityWindow, AvailabilityWindowRequestDTO } from '../types/availability';

/** Always returns 7 windows, Monday to Sunday. */
export async function getAvailability(): Promise<AvailabilityWindow[]> {
  const { data } = await apiClient.get<AvailabilityWindow[]>('/availability');
  return data;
}

/** Upserts the given weekdays (at most 7, one per weekday) and returns the full week. */
export async function saveAvailability(windows: AvailabilityWindowRequestDTO[]): Promise<AvailabilityWindow[]> {
  const { data } = await apiClient.put<AvailabilityWindow[]>('/availability', windows);
  return data;
}
