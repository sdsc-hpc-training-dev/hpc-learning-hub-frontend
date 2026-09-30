"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <h1>Something went wrong</h1>
      <button
        type="button"
        onClick={() => {
          reset();
        }}
      >
        Try again
      </button>
    </main>
  );
}
