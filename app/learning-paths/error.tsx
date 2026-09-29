"use client";

import { useEffect } from "react";

interface LearningPathsErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function LearningPathsError({
  error,
  reset,
}: Readonly<LearningPathsErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="learning-path-status learning-path-status--error"
      role="alert"
    >
      <h1>Learning paths are temporarily unavailable.</h1>
      <p>We could not reach the training catalog. Please try again later.</p>
      <button className="button button--gold" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
