import { apiClient } from './apiClient';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '../types/task';

export async function getTasks(completed?: boolean): Promise<Task[]> {
  const { data } = await apiClient.get<Task[]>('/tasks', {
    params: completed === undefined ? undefined : { completed },
  });
  return data;
}

export async function getTask(id: number): Promise<Task> {
  const { data } = await apiClient.get<Task>(`/tasks/${id}`);
  return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
