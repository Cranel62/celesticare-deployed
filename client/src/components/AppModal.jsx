import { useEffect, useRef } from 'react';
import '../styles/AppModal.css';

export default function AppModal({
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  isDanger = false,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const isConfirmation = Boolean(onConfirm);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    (isConfirmation ? confirmButtonRef : closeButtonRef).current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusableElements = dialogRef.current.querySelectorAll('button:not([disabled])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isConfirmation]);

  return (
    <div
      className="app-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={`app-modal${isDanger ? ' app-modal-danger' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        aria-describedby="app-modal-message"
      >
        <div className="app-modal-icon" aria-hidden="true">
          <i className={`fas ${isDanger ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
        </div>
        <h2 id="app-modal-title">{title}</h2>
        <p id="app-modal-message">{message}</p>
        <div className="app-modal-actions">
          {onConfirm && (
            <button
              ref={confirmButtonRef}
              type="button"
              className="app-modal-confirm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            className="app-modal-close"
            onClick={onClose}
          >
            {onConfirm ? cancelLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
