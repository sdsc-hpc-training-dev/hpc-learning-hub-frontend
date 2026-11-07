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
  headingLevel?: 1 | 2;
}

export default function InlineError({
  title,
  message,
  retryLabel = "Try again",
  toast = true,
  onRetry,
  headingLevel = 2,
}: Readonly<InlineErrorProps>) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const router = useRouter();
  const notify = useToast();

  useEffect(() => {
    if (toast) notify(message, "error");
  }, [message, notify, toast]);

  return (
    <section className="inline-error" role="alert" aria-live="assertive">
      <div>
        <Heading>{title}</Heading>
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
