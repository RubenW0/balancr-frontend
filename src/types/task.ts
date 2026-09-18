export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTaskPayload {
  title: string;
  completed: boolean;
}

export type UpdateTaskPayload = CreateTaskPayload;
