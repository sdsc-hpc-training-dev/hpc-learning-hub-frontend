"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { useSession } from "./SessionProvider";
import { registerAccount, requestLoginCode, verifyLoginCode } from "./api";

export type AccountMode = "signin" | "create";

function safeReturnPath(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/my-learning";
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function fieldValue(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

// The account panel coordinates several related form states.
// eslint-disable-next-line complexity, max-lines-per-function, sonarjs/cognitive-complexity
export default function AccountPanel({
  initialMode = "signin",
  returnTo,
  onModeChange,
}: Readonly<{ initialMode?: AccountMode; returnTo?: string; onModeChange?: (mode: AccountMode) => void }>) {
  const [mode, setMode] = useState<AccountMode>(initialMode);
  const [challenge, setChallenge] = useState<{ challengeId: string; expiresAt: string } | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { account, loading: sessionLoading, refresh, signOut } = useSession();
  const router = useRouter();
  const destination = safeReturnPath(returnTo);
  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = fieldValue(form, "email").trim();
    const username = fieldValue(form, "username").trim();
    const password = fieldValue(form, "password");
    const confirmation = fieldValue(form, "confirmPassword");

    // This is a local confirmation check; authentication and password policy are enforced by Gateway.
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (password !== confirmation) {
      setError("Those passwords do not match.");
      setPending(false);
      return;
    }

    try {
      await registerAccount({ email, username, password });
      setIdentifier(email);
      setMode("signin");
      onModeChange?.("signin");
      setMessage("Your account is ready. Sign in to receive a verification code by email.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function handleRequestCode(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const emailOrUsername = fieldValue(form, "emailOrUsername").trim();
    const password = fieldValue(form, "password");
    try {
      const result = await requestLoginCode({ emailOrUsername, password });
      setIdentifier(emailOrUsername);
      setChallenge(result);
      setMessage("We sent a six-digit verification code to the email address on your account.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const code = fieldValue(form, "code").trim();
    try {
      await verifyLoginCode({ challengeId: challenge.challengeId, code });
      const current = await refresh();
      if (!current) {
        setError("Your code was accepted, but we could not confirm the signed-in session. Please try signing in again.");
        return;
      }
      router.replace(destination);
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function handleSignOut() {
    setPending(true);
    setError("");
    try {
      await signOut();
      setMessage("You have signed out.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  if (sessionLoading) {
    return <section className="auth-card account-panel" role="status">Checking your account…</section>;
  }

  if (account) {
    return (
      <section className="auth-card account-panel" aria-labelledby="account-title">
        <div className="auth-card__heading">
          <span className="auth-step">Your account</span>
          <h2 id="account-title">You’re signed in</h2>
          <p>Your public training library is always available. Your bookmarks and personal paths are saved to this account.</p>
        </div>
        <div className="account-identity">
          <span className="account-avatar" aria-hidden="true">{account.username.slice(0, 1).toUpperCase()}</span>
          <div><strong>{account.username}</strong><span>{account.email}</span></div>
        </div>
        {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
        {message ? <p className="form-message" role="status">{message}</p> : null}
        <div className="account-panel__actions">
          <Link className="button button--gold" href="/my-learning">Go to My Learning</Link>
          <button className="button button--secondary" type="button" disabled={pending} onClick={() => { void handleSignOut(); }}>{pending ? "Signing out…" : "Sign out"}</button>
        </div>
      </section>
    );
  }

  return (
    <div className="auth-stack">
      <section className="auth-card account-panel" aria-labelledby="account-title">
        {challenge ? (
          <>
            <div className="auth-progress" aria-label="Sign-in progress">
              <span className="is-complete"><strong>✓</strong> Account</span><i /><span className="is-current"><strong>2</strong> Verify</span>
            </div>
            <div className="auth-card__heading">
              <span className="auth-step">Step 2 of 2</span>
              <h2 id="account-title">Check your email</h2>
              <p>Enter the six-digit code we sent for <strong>{identifier}</strong>.</p>
            </div>
            {message ? <p className="form-message" role="status">{message}</p> : null}
            {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
            <form className="account-form auth-fields" onSubmit={(event) => { void handleVerify(event); }}>
              <div className="auth-field">
                <label htmlFor="verification-code">Six-digit code</label>
                <input className="verification-input" id="verification-code" name="code" type="text" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required autoFocus />
                <small>The code can be used once and expires after ten minutes.</small>
                {challenge.expiresAt ? <small>Code expires {new Date(challenge.expiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.</small> : null}
              </div>
              <button className="button button--primary auth-submit" type="submit" disabled={pending}>{pending ? "Verifying…" : "Verify and sign in"}</button>
              <button className="account-text-button" type="button" onClick={() => { setChallenge(null); setMessage(""); setError(""); }}>Back to sign in</button>
            </form>
          </>
        // eslint-disable-next-line sonarjs/no-nested-conditional
        ) : mode === "create" ? (
          <>
            <div className="auth-progress" aria-label="Account creation progress">
              <span className="is-current"><strong>1</strong> Account</span><i /><span><strong>2</strong> Verify</span>
            </div>
            <div className="auth-card__heading">
              <span className="auth-step">Step 1 of 2</span>
              <h2 id="account-title">Create your learner account</h2>
              <p>Already have an account? <button className="auth-switch" type="button" onClick={() => { setMode("signin"); onModeChange?.("signin"); setError(""); setMessage(""); }}>Sign in</button></p>
            </div>
            {message ? <p className="form-message" role="status">{message}</p> : null}
            {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
            <form className="account-form auth-fields" onSubmit={(event) => { void handleCreate(event); }}>
              <div className="auth-field">
                <label htmlFor="signup-email">Email address</label>
                <input id="signup-email" name="email" type="email" autoComplete="email" required />
                <small>Used for sign-in verification.</small>
              </div>
              <div className="auth-field">
                <label htmlFor="signup-username">Username</label>
                <input id="signup-username" name="username" autoComplete="username" minLength={3} maxLength={50} pattern="[A-Za-z0-9_]+" required />
                <small>3–50 letters, numbers, or underscores.</small>
              </div>
              <div className="auth-field">
                <label htmlFor="signup-password">Create a password</label>
                <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={15} maxLength={128} required />
                <small>Use 15–128 characters.</small>
              </div>
              <div className="auth-field">
                <label htmlFor="signup-confirm-password">Confirm password</label>
                <input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={15} maxLength={128} required />
              </div>
              <button className="button button--primary auth-submit" type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-card__heading">
              <span className="auth-step">Sign in</span>
              <h2 id="account-title">Welcome back</h2>
              <p>New to the Learning Hub? <button className="auth-switch" type="button" onClick={() => { setMode("create"); onModeChange?.("create"); setError(""); setMessage(""); }}>Create an account</button></p>
            </div>
            {message ? <p className="form-message" role="status">{message}</p> : null}
            {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
            <form className="account-form auth-fields" onSubmit={(event) => { void handleRequestCode(event); }}>
              <div className="auth-field">
                <label htmlFor="signin-identifier">Email address</label>
                <input id="signin-identifier" name="emailOrUsername" type="text" autoComplete="username" required defaultValue={identifier} />
              </div>
              <div className="auth-field">
                <div className="field-label-row"><label htmlFor="signin-password">Password</label><button type="button" className="field-link" onClick={() => { setMessage("To reset your password, contact your Learning Hub administrator."); setError(""); }}>Forgot password?</button></div>
                <input id="signin-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <button className="button button--primary auth-submit" type="submit" disabled={pending}>{pending ? "Sending code…" : "Sign in"}</button>
              <button className="button button--secondary auth-create-action" type="button" onClick={() => { setMode("create"); onModeChange?.("create"); setError(""); setMessage(""); }}>Create a new learner account</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
