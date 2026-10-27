import { apiClient } from './apiClient';
import type { PlanRequestDTO, PlanResponseDTO } from '../types/plan';

/** Plans the week starting on `weekStart` (YYYY-MM-DD). Nothing is saved. */
export async function createPlan(payload: PlanRequestDTO): Promise<PlanResponseDTO> {
  const { data } = await apiClient.post<PlanResponseDTO>('/plan', payload);
  return data;
}
