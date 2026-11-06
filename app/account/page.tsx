"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/features/auth/SessionProvider";

// eslint-disable-next-line complexity, max-lines-per-function
export default function AccountsPage() {
  const { status, account, signOut } = useSession();
  const [error, setError] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<string | null>(null);
  useEffect(() => {
    setCallbackStatus(
      new URLSearchParams(window.location.search).get("status"),
    );
  }, []);
  return (
    <div className="section-shell account-page">
      <h1>Account</h1>
      {status === "checking" ? (
        <p role="status">Checking your account...</p>
      ) : null}
      {status === "disabled" ? <p>Accounts are not available.</p> : null}
      {status === "unavailable" || callbackStatus === "unavailable" ? (
        <p role="alert">
          Sign-in is temporarily unavailable. Please try again later.
        </p>
      ) : null}
      {callbackStatus === "denied" ? (
        <p role="alert">Sign-in was not completed. Please try again.</p>
      ) : null}
      {status === "expired" ? (
        <p role="alert">Your session expired. Please sign in again.</p>
      ) : null}
      {error ? (
        <p role="alert">Sign-out could not be completed. Please try again.</p>
      ) : null}
      {account ? (
        <>
          <p>Signed in as {account.username}.</p>
          <p>
            <Link href="/my-learning">My Learning</Link>
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              void signOut().catch(() => {
                setError(true);
              });
            }}
          >
            Sign out
          </button>
        </>
      ) : null}
      {status === "anonymous" ||
      status === "expired" ||
      status === "unavailable" ? (
        <p>
          <a className="button button--gold" href="/api/v1/auth/cilogon/login">
            Sign in with CILogon
          </a>
        </p>
      ) : null}
    </div>
  );
}
