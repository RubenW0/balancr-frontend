import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import '../styles/Dialog.css';

interface DialogProps {
  title: string;
  /** Called on Escape; ignored while busy. */
  onClose: () => void;
  isBusy?: boolean;
  children: ReactNode;
}

/** Modal built on the native <dialog>, which handles focus and the backdrop. */
export function Dialog({ title, onClose, isBusy = false, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!isBusy) onClose();
      }}
    >
      <div className="app-dialog-body">
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
