"use client";

import RouteError from "@/components/ui/RouteError";

export default function ErrorPage({
  error,
  retry,
}: {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      title="This page could not load."
      message="Please try again. If the problem continues, return to the Training Library."
      retry={retry}
    />
  );
}
