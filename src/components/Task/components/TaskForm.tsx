import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateTaskPayload } from '../../../types/task';
import '../styles/TaskForm.css';

interface TaskFormProps {
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title: trimmed, completed: false });
      setTitle('');
    } catch {
      // Fout wordt al bijgehouden in useTasks; hier niets extra nodig.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nieuwe taak..."
        aria-label="Titel van nieuwe taak"
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting || !title.trim()}>
        Toevoegen
      </button>
    </form>
  );
}
