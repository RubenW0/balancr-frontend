import { useEffect, useId, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import '../styles/Dialog.css';

interface DialogProps {
  title: string;
  /** Called on Escape and on a click on the backdrop; ignored while busy. */
  onRequestClose: () => void;
  isBusy?: boolean;
  /** 'wide' is used for longer forms (520px instead of 440px). */
  size?: 'default' | 'wide';
  children: ReactNode;
}

/**
 * Centred modal built on the native <dialog>: it handles focus, puts the
 * dialog in the top layer (above FullCalendar) and draws the backdrop.
 */
export function Dialog({ title, onRequestClose, isBusy = false, size = 'default', children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A click only counts as "on the backdrop" when it also started there, so selecting text and releasing outside doesn't close.
  const pressStartedOnBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const requestClose = () => {
    if (!isBusy) onRequestClose();
  };

  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    // The <dialog> itself is only the target outside its content, i.e. on the backdrop.
    if (e.target === dialogRef.current && pressStartedOnBackdrop.current) requestClose();
    pressStartedOnBackdrop.current = false;
  };

  return (
    <dialog
      ref={dialogRef}
      className={`app-dialog${size === 'wide' ? ' app-dialog--wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === dialogRef.current;
      }}
      onClick={handleClick}
    >
      <div className="app-dialog-body">
        <h2 id={titleId} className="app-dialog-title">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
