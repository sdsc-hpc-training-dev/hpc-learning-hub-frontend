"use client";

import { useState } from "react";
import { useSession } from "./SessionProvider";

export default function SignOutButton() {
  const { status, signOut } = useSession();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  if (status !== "signed-in") return null;

  async function submit() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      await signOut();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="button button--secondary"
        disabled={pending}
        onClick={() => {
          void submit();
        }}
      >
        {pending ? "Signing out..." : "Sign out"}
      </button>
      {failed ? (
        <p role="alert">Sign-out could not be completed. Please try again.</p>
      ) : null}
    </div>
  );
}
