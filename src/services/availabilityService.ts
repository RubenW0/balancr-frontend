import { apiClient } from './apiClient';
import type { AvailabilityWindow } from '../types/availability';

/** Always returns 7 windows, Monday to Sunday. */
export async function getAvailability(): Promise<AvailabilityWindow[]> {
  const { data } = await apiClient.get<AvailabilityWindow[]>('/availability');
  return data;
}
