import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/Task/components/TaskForm';
import { TaskList } from '../components/Task/components/TaskList';
import './TasksPage.css';

export function TasksPage() {
  const { tasks, isLoading, error, addTask, toggleTask, removeTask } = useTasks();

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <section className="tasks-page">
      <h1>Taken</h1>
      <p className="tasks-subtitle">
        {tasks.length === 0 ? 'Overzicht van je taken' : `${remaining} van ${tasks.length} taken nog te doen`}
      </p>

      <TaskForm onSubmit={addTask} />

      {error && <p className="tasks-error">{error}</p>}

      {isLoading ? (
        <p className="tasks-loading">Taken laden...</p>
      ) : (
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={removeTask} />
      )}
    </section>
  );
}
