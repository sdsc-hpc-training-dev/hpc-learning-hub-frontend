"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

interface InlineErrorProps {
  title: string;
  message: string;
  retryLabel?: string;
  toast?: boolean;
  onRetry?: () => void;
}

export default function InlineError({
  title,
  message,
  retryLabel = "Try again",
  toast = true,
  onRetry,
}: Readonly<InlineErrorProps>) {
  const router = useRouter();
  const notify = useToast();

  useEffect(() => {
    if (toast) notify(message, "error");
  }, [message, notify, toast]);

  return (
    <section className="inline-error" role="alert" aria-live="assertive">
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <button
        className="button button--secondary"
        type="button"
        onClick={() => {
          if (onRetry) onRetry();
          else router.refresh();
        }}
      >
        {retryLabel}
      </button>
    </section>
  );
}
