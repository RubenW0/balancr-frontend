import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ActivityGoalResponseDTO } from '../../../types/activityGoal';
import { GoalDialog } from './GoalDialog';

const existingGoal: ActivityGoalResponseDTO = {
  id: 7,
  name: 'Gym',
  type: 'TRAINING',
  frequencyPerWeek: 3,
  durationMinutes: 60,
  intensity: 'HEAVY',
  restDaysBetween: null,
  priority: 3,
  preferredTime: 'EVENING',
  userId: 1,
  createdAt: '',
  updatedAt: '',
};

function renderDialog(goal?: ActivityGoalResponseDTO) {
  const onClose = vi.fn();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<GoalDialog goal={goal} onSubmit={onSubmit} onClose={onClose} />);
  return { onClose, onSubmit, dialog: screen.getByRole('dialog', { name: goal ? 'Edit goal' : 'New goal' }) };
}

/** Escape on a native <dialog> fires a cancelable "cancel" event. */
function pressEscape(dialog: HTMLElement) {
  fireEvent(dialog, createEvent('cancel', dialog, { cancelable: true }));
}

function clickBackdrop(dialog: HTMLElement) {
  fireEvent.mouseDown(dialog);
  fireEvent.click(dialog);
}

describe('GoalDialog dirty check', () => {
  it.each([
    ['Escape', pressEscape],
    ['a backdrop click', clickBackdrop],
    ['Cancel', () => fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))],
  ])('closes immediately on %s when nothing changed', (_, close) => {
    const { dialog, onClose } = renderDialog();
    close(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Discard changes?')).toBeNull();
  });

  it.each([
    ['Escape', pressEscape],
    ['a backdrop click', clickBackdrop],
    ['Cancel', () => fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))],
  ])('asks before discarding changes on %s', (_, close) => {
    const { dialog, onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Run' } });
    close(dialog);
    expect(screen.getByRole('dialog', { name: 'Discard changes?' })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps editing or discards from the confirm dialog', async () => {
    const { dialog, onClose } = renderDialog(existingGoal);
    fireEvent.change(screen.getByLabelText('Times per week'), { target: { value: '4' } });

    pressEscape(dialog);
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() => expect(screen.queryByText('Discard changes?')).toBeNull());
    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Times per week') as HTMLInputElement).value).toBe('4');

    pressEscape(dialog);
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('does not count a change that was undone', () => {
    const { dialog, onClose } = renderDialog(existingGoal);
    fireEvent.click(screen.getByRole('radio', { name: 'Study' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Training' }));
    pressEscape(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves without asking and keeps the original priority number', async () => {
    const { onClose, onSubmit } = renderDialog({ ...existingGoal, priority: 3 });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Gym Push' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Discard changes?')).toBeNull();
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Gym Push',
      type: 'TRAINING',
      frequencyPerWeek: 3,
      durationMinutes: 60,
      intensity: 'HEAVY',
      restDaysBetween: null,
      priority: 3,
      preferredTime: 'EVENING',
    });
  });
});

describe('GoalDialog fields', () => {
  it('updates the rest placeholder live from the intensity and the category', () => {
    renderDialog();
    const rest = () => (screen.getByLabelText('Rest between sessions') as HTMLInputElement).placeholder;

    fireEvent.change(screen.getByLabelText('Intensity'), { target: { value: 'LIGHT' } });
    expect(rest()).toBe('Auto: 0 days');
    fireEvent.change(screen.getByLabelText('Intensity'), { target: { value: 'MEDIUM' } });
    expect(rest()).toBe('Auto: 1 day');
    fireEvent.change(screen.getByLabelText('Intensity'), { target: { value: 'HEAVY' } });
    expect(rest()).toBe('Auto: 2 days');

    fireEvent.click(screen.getByRole('radio', { name: 'Study' }));
    expect(screen.queryByLabelText('Intensity')).toBeNull();
    expect(rest()).toBe('Auto: 0 days');
  });

  it('sends null intensity for Study, null rest when empty and the group name only when set', async () => {
    const { onSubmit } = renderDialog();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Statistics' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Study' }));
    fireEvent.change(screen.getByLabelText('Times per week'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '90' } });
    fireEvent.click(screen.getByRole('button', { name: /More options/ }));
    fireEvent.change(screen.getByLabelText('Keep on separate days from'), { target: { value: ' Exams ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create goal' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      name: 'Statistics',
      type: 'STUDY',
      frequencyPerWeek: 2,
      durationMinutes: 90,
      intensity: null,
      restDaysBetween: null,
      priority: 2,
      preferredTime: null,
      groupName: 'Exams',
    });
  });

  it('shows validation errors under the fields and does not submit', () => {
    const { onSubmit } = renderDialog();
    fireEvent.change(screen.getByLabelText('Times per week'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create goal' }));

    expect(screen.getByText('Name is required.')).toBeTruthy();
    expect(screen.getByText('Enter a whole number from 1 to 7.')).toBeTruthy();
    expect(screen.getByText('Enter a duration of at least 1 minute.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('opens "More options" when editing a goal that uses them', () => {
    renderDialog(existingGoal);
    expect(screen.getByRole('button', { name: /More options/ }).getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps "More options" closed for a new goal', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /More options/ }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('preferred time, priority, keep apart')).toBeTruthy();
  });
});
