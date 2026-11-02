import { useState } from 'react';
import { ApiError } from '../../../services/apiClient';
import { ErrorBanner } from '../../Banner/ErrorBanner';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Closes the dialog when it returns or resolves; a rejection is shown in the dialog. */
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
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
    <Dialog title={title} onRequestClose={onClose} isBusy={isBusy}>
      <p className="app-dialog-message">{message}</p>

      {error && <ErrorBanner message={error} />}

      <div className="app-dialog-actions">
        <button type="button" className="button button--ghost" onClick={onClose} disabled={isBusy}>
          {cancelLabel}
        </button>
        <button type="button" className="button button--danger" onClick={handleConfirm} disabled={isBusy} autoFocus>
          {isBusy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
