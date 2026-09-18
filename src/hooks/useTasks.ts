import { useCallback, useEffect, useState } from 'react';
import * as taskService from '../services/taskService';
import { ApiError } from '../services/apiClient';
import type { CreateTaskPayload, Task } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTasks(await taskService.getTasks());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Onbekende fout bij het ophalen van taken.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(async (payload: CreateTaskPayload) => {
    setError(null);
    try {
      const created = await taskService.createTask(payload);
      setTasks((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Onbekende fout bij het aanmaken van de taak.');
      throw err;
    }
  }, []);

  const toggleTask = useCallback(async (task: Task) => {
    setError(null);
    try {
      const updated = await taskService.updateTask(task.id, {
        title: task.title,
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Onbekende fout bij het bijwerken van de taak.');
    }
  }, []);

  const removeTask = useCallback(async (id: number) => {
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Onbekende fout bij het verwijderen van de taak.');
    }
  }, []);

  return { tasks, isLoading, error, reload: load, addTask, toggleTask, removeTask };
}
