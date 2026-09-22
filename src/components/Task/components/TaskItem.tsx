import type { Task } from '../../../types/task';
import '../styles/TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="task-item">
      <label>
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task)} />
        <span className={task.completed ? 'task-title completed' : 'task-title'}>{task.title}</span>
      </label>
      <button type="button" className="delete-button" onClick={() => onDelete(task.id)} aria-label={`Verwijder ${task.title}`}>
        Verwijderen
      </button>
    </li>
  );
}
