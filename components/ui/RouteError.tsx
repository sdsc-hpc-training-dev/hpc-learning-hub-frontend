"use client";

import { useEffect } from "react";
import { useToast } from "./ToastProvider";

interface RouteErrorProps {
  title: string;
  message: string;
  error?: Error;
  retry: () => void;
}

export default function RouteError({
  title,
  message,
  error,
  retry,
}: Readonly<RouteErrorProps>) {
  const notify = useToast();

  useEffect(() => {
    if (error) console.error(error);
    notify(message, "error");
  }, [error, message, notify]);

  return (
    <section className="route-error" role="alert">
      <span className="eyebrow">Something went wrong</span>
      <h1>{title}</h1>
      <p>{message}</p>
      <button className="button button--gold" type="button" onClick={retry}>
        Try again
      </button>
    </section>
  );
}
