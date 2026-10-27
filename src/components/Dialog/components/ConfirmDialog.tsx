import { useState } from 'react';
import { ApiError } from '../../../services/apiClient';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  /** Closes the dialog when it resolves; a rejection is shown in the dialog. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setIsBusy(false);
    }
  };

  return (
    <Dialog title={title} onClose={onClose} isBusy={isBusy}>
      <p className="app-dialog-message">{message}</p>

      {error && (
        <p className="app-dialog-error" role="alert">
          {error}
        </p>
      )}

      <div className="app-dialog-actions">
        <button type="button" className="app-dialog-secondary" onClick={onClose} disabled={isBusy}>
          Cancel
        </button>
        <button
          type="button"
          className="app-dialog-danger"
          onClick={handleConfirm}
          disabled={isBusy}
          autoFocus
        >
          {isBusy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
