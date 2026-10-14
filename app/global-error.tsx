"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: Readonly<{
  error: Error & { digest?: string };
  retry: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="route-error" role="alert">
          <span className="eyebrow">Something went wrong</span>
          <h1>The Learning Hub could not start.</h1>
          <p>Try loading the application again.</p>
          <button className="button button--gold" type="button" onClick={retry}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
