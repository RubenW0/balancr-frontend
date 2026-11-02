import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FixedEventDialog } from './FixedEventDialog';
import type { FixedEventDialogValues } from './FixedEventDialog';

const values: FixedEventDialogValues = {
  title: 'Math class',
  type: 'class',
  date: '2026-10-26',
  startTime: '09:00',
  endTime: '10:00',
  isMovable: false,
};

function renderDialog() {
  const onClose = vi.fn();
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(<FixedEventDialog initialValues={values} onSave={onSave} onClose={onClose} />);
  return { onClose, onSave, dialog: screen.getByRole('dialog', { name: 'New event' }) };
}

function pressEscape(dialog: HTMLElement) {
  fireEvent(dialog, createEvent('cancel', dialog, { cancelable: true }));
}

describe('FixedEventDialog', () => {
  it('closes immediately when nothing changed', () => {
    const { dialog, onClose } = renderDialog();
    pressEscape(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('asks before discarding a changed field', async () => {
    const { dialog, onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '11:00' } });
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    expect(screen.getByRole('dialog', { name: 'Discard changes?' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('shows an inline error when the end is not after the start', () => {
    const { onSave } = renderDialog();
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '08:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('End time must be after start time.')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('combines date and times into local date-times without "Z"', async () => {
    const { onSave, onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-28' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({
      title: 'Math class',
      type: 'class',
      startTime: '2026-10-28T09:00:00',
      endTime: '2026-10-28T10:00:00',
      isMovable: false,
    });
  });
});
