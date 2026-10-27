import { apiClient } from './apiClient';
import type { ActivityGoalRequestDTO, ActivityGoalResponseDTO } from '../types/activityGoal';

export async function getActivityGoals(): Promise<ActivityGoalResponseDTO[]> {
  const { data } = await apiClient.get<ActivityGoalResponseDTO[]>('/activity-goals');
  return data;
}

export async function createActivityGoal(
  payload: ActivityGoalRequestDTO,
): Promise<ActivityGoalResponseDTO> {
  const { data } = await apiClient.post<ActivityGoalResponseDTO>('/activity-goals', payload);
  return data;
}

export async function updateActivityGoal(
  id: number,
  payload: ActivityGoalRequestDTO,
): Promise<ActivityGoalResponseDTO> {
  const { data } = await apiClient.put<ActivityGoalResponseDTO>(`/activity-goals/${id}`, payload);
  return data;
}

export async function deleteActivityGoal(id: number): Promise<void> {
  await apiClient.delete(`/activity-goals/${id}`);
}
