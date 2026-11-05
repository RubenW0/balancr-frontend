import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  separateFromGoalIds: [],
  userId: 1,
  createdAt: '',
  updatedAt: '',
};

function otherGoal(id: number, name: string, overrides: Partial<ActivityGoalResponseDTO> = {}): ActivityGoalResponseDTO {
  return { ...existingGoal, id, name, priority: 2, preferredTime: null, ...overrides };
}

// Unsorted on purpose: the dropdown sorts by name.
const otherGoals = [otherGoal(9, 'Running'), otherGoal(8, 'Gym Pull'), otherGoal(10, 'Statistics', { type: 'STUDY' })];

function renderDialog(goal?: ActivityGoalResponseDTO, goals: ActivityGoalResponseDTO[] = goal ? [goal] : []) {
  const onClose = vi.fn();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<GoalDialog goal={goal} goals={goals} onSubmit={onSubmit} onClose={onClose} />);
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
      separateFromGoalIds: [],
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

  it('sends null intensity for Study, null rest when empty and no separations by default', async () => {
    const { onSubmit } = renderDialog();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Statistics' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Study' }));
    fireEvent.change(screen.getByLabelText('Times per week'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '90' } });
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
      separateFromGoalIds: [],
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
    expect(screen.getByText('preferred time, priority, not on same day as')).toBeTruthy();
  });
});

describe('GoalDialog "Not on the same day as"', () => {
  const field = () => screen.getByLabelText('Not on the same day as');
  const plainGoal = { ...existingGoal, priority: 2, preferredTime: null };

  function openMoreOptions() {
    fireEvent.click(screen.getByRole('button', { name: /More options/ }));
  }

  it('lists the other goals sorted by name, without the goal being edited', () => {
    renderDialog(plainGoal, [plainGoal, ...otherGoals]);
    openMoreOptions();
    fireEvent.click(field());

    const names = within(screen.getByRole('listbox')).getAllByRole('option').map((option) => option.textContent);
    expect(names).toEqual(['Gym Pull', 'Running', 'Statistics']);
  });

  it('selects goals as chips, removes them again and sends the sorted ids', async () => {
    const { onSubmit } = renderDialog(plainGoal, [plainGoal, ...otherGoals]);
    openMoreOptions();
    expect(screen.getByText('None')).toBeTruthy();

    fireEvent.click(field());
    fireEvent.click(screen.getByRole('option', { name: 'Statistics' }));
    fireEvent.click(screen.getByRole('option', { name: 'Gym Pull' }));
    expect(screen.getByRole('option', { name: 'Gym Pull' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('option', { name: 'Running' }));

    fireEvent.click(screen.getByRole('button', { name: 'Remove Running' }));
    expect(screen.queryByRole('button', { name: 'Remove Running' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Gym Pull' })).toBeTruthy();
    expect(screen.queryByText('None')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].separateFromGoalIds).toEqual([8, 10]);
  });

  it('works with the keyboard and closes on Escape without closing the dialog', () => {
    const { onClose } = renderDialog(undefined, otherGoals);
    openMoreOptions();
    fireEvent.keyDown(field(), { key: 'ArrowDown' });

    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: ' ' });
    expect(screen.getByRole('option', { name: 'Running' }).getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(list, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(field());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes the dropdown on a click outside', () => {
    renderDialog(undefined, otherGoals);
    openMoreOptions();
    fireEvent.click(field());
    expect(screen.getByRole('listbox')).toBeTruthy();
    fireEvent.mouseDown(screen.getByLabelText('Name'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('is disabled with a hint when there are no other goals', () => {
    renderDialog(plainGoal, [plainGoal]);
    openMoreOptions();
    expect(screen.getByText('Add another goal first')).toBeTruthy();
    expect((field() as HTMLButtonElement).disabled).toBe(true);
  });

  it('counts a selection as a change, but not one that was undone', () => {
    const { dialog, onClose } = renderDialog(undefined, otherGoals);
    openMoreOptions();
    fireEvent.click(field());
    fireEvent.click(screen.getByRole('option', { name: 'Running' }));
    pressEscape(dialog);
    expect(screen.getByRole('dialog', { name: 'Discard changes?' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    fireEvent.click(screen.getByRole('option', { name: 'Running' }));
    pressEscape(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('preselects the goals returned for the other side of the relation and opens "More options"', () => {
    // The relation was saved on Gym Pull ("not with Gym"), so the API also lists Gym Pull (8) on Gym.
    const gym = { ...plainGoal, separateFromGoalIds: [8] };
    renderDialog(gym, [gym, ...otherGoals]);

    expect(screen.getByRole('button', { name: /More options/ }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Remove Gym Pull' })).toBeTruthy();
    fireEvent.click(field());
    expect(screen.getByRole('option', { name: 'Gym Pull' }).getAttribute('aria-selected')).toBe('true');
  });
});
