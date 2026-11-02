import { useCallback, useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';

/**
 * Close handling for form dialogs. requestClose (for Esc, the backdrop and
 * Cancel) closes right away when nothing changed; with unsaved changes it
 * asks "Discard changes?" first. Render confirmDialog next to the form dialog.
 * Saving should call onClose directly, so it never asks.
 */
export function useDiscardGuard(isDirty: boolean, onClose: () => void) {
  const [isConfirming, setIsConfirming] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty) setIsConfirming(true);
    else onClose();
  }, [isDirty, onClose]);

  const confirmDialog = isConfirming ? (
    <ConfirmDialog
      title="Discard changes?"
      message="Your changes have not been saved."
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      onConfirm={onClose}
      onClose={() => setIsConfirming(false)}
    />
  ) : null;

  return { requestClose, confirmDialog };
}
