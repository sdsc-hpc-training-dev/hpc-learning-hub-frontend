"use client";

import { useEffect, useId, useRef, useState } from "react";

// eslint-disable-next-line max-lines-per-function -- Keep the native dialog and its pending/retry state together.
export default function DeletePathDialog({
  title,
  onCancel,
  onDelete,
}: Readonly<{
  title: string;
  onCancel: () => void;
  onDelete: () => Promise<void>;
}>) {
  const heading = useId();
  const description = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    return () => {
      if (element?.open) element.close();
    };
  }, []);

  async function confirmDelete() {
    setPending(true);
    setFailed(false);
    try {
      await onDelete();
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="path-delete-dialog"
      aria-labelledby={heading}
      aria-describedby={description}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
    >
      <h2 id={heading}>Delete this learning path?</h2>
      <p id={description}>
        <strong>{title}</strong> will be permanently deleted. Your bookmarks
        will stay saved.
      </p>
      {failed ? (
        <p role="alert">The path could not be deleted. Please try again.</p>
      ) : null}
      <div className="learner-actions">
        <button
          ref={cancel}
          className="button button--secondary"
          type="button"
          disabled={pending}
          onClick={onCancel}
        >
          Keep path
        </button>
        <button
          className="button path-delete-confirm"
          type="button"
          disabled={pending}
          onClick={() => {
            void confirmDelete();
          }}
        >
          {pending ? "Deleting..." : "Delete path"}
        </button>
      </div>
    </dialog>
  );
}
