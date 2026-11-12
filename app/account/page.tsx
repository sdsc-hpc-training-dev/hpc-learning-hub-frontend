"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/features/auth/SessionProvider";
import LearnerProfilePanel from "@/features/my-learning/LearnerProfilePanel";

// eslint-disable-next-line complexity, max-lines-per-function
export default function AccountsPage() {
  const { status, account, privateRequest, signOut } = useSession();
  const [error, setError] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<string | null>(null);
  useEffect(() => {
    setCallbackStatus(
      new URLSearchParams(window.location.search).get("status"),
    );
  }, []);
  return (
    <div className="section-shell account-page my-learning">
      <div className="my-learning-heading">
        <h1>My Account</h1>
      </div>
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
      {error && account ? (
        <p role="alert">Sign-out could not be completed. Please try again.</p>
      ) : null}
      {account && privateRequest ? (
        <>
          <LearnerProfilePanel key={account.id} />
          <section
            className="learner-profile"
            aria-labelledby="account-learning-heading"
          >
            <h2 id="account-learning-heading">My Learning</h2>
            <div className="learner-actions">
              <Link className="text-link" href="/my-learning#saved-materials">
                Saved materials
              </Link>
              <Link
                className="button button--secondary"
                href="/my-learning#personal-paths"
              >
                Go to my learning paths
              </Link>
            </div>
          </section>
          <div className="learner-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                setError(false);
                void signOut().catch(() => {
                  setError(true);
                });
              }}
            >
              Sign out
            </button>
          </div>
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
