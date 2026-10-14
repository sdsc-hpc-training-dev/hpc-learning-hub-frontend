"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

type ToastHandler = (message: string, variant?: ToastVariant) => void;

function ignoreToast(): void {
  return;
}

const ToastContext = createContext<ToastHandler>(ignoreToast);

function ToastItem({
  toast,
  onDismiss,
}: Readonly<{ toast: ToastMessage; onDismiss: (id: number) => void }>) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [onDismiss, toast.id]);

  return (
    <div
      className={`toast toast--${toast.variant}`}
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
    >
      <p>{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => {
          onDismiss(toast.id);
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const nextId = useRef(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const notify = useCallback<ToastHandler>((message, variant = "info") => {
    nextId.current += 1;
    const toast = { id: nextId.current, message, variant };
    setToasts((current) => [...current.slice(-2), toast]);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastHandler {
  return useContext(ToastContext);
}
