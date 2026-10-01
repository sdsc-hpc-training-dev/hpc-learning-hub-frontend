"use client";

import RouteError from "@/components/ui/RouteError";

interface LearningPathsErrorProps {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}

export default function LearningPathsError({
  error,
  retry,
}: Readonly<LearningPathsErrorProps>) {
  return (
    <RouteError
      error={error}
      title="Learning paths are temporarily unavailable."
      message="We could not reach the training catalog. Please try again."
      retry={retry}
    />
  );
}
