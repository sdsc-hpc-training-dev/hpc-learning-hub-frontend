"use client";

import { useEffect, useId, useRef, useState, type SubmitEvent } from "react";
import type { LearnerProfile } from "./api";
import { useLearnerProfile } from "./LearnerProfileProvider";

type ProfileFormProps = Readonly<{
  profile: LearnerProfile;
  pending: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
  setup?: boolean;
}>;

function ProfileForm({
  profile,
  pending,
  onSave,
  onCancel,
  setup,
}: ProfileFormProps) {
  const nameCountId = useId();
  const nameLimit = 80;
  const [name, setName] = useState(profile.displayName ?? "");
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!setup) nameInput.current?.focus();
  }, [setup]);
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim()) onSave(name.trim());
  }

  return (
    <form className="account-editor" onSubmit={submit}>
      <label>
        Preferred name
        <input
          ref={nameInput}
          value={name}
          required
          maxLength={nameLimit}
          aria-describedby={nameCountId}
          autoComplete="nickname"
          disabled={pending}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </label>
      <p className="learner-field-count" id={nameCountId}>
        {name.length} / {nameLimit} characters
      </p>
      <div className="learner-actions">
        <button
          className="button button--gold"
          type="submit"
          disabled={pending || !name.trim()}
        >
          {setup ? "Save and continue" : "Save profile"}
        </button>
        <button
          className="button button--secondary"
          type="button"
          disabled={pending}
          onClick={onCancel}
        >
          {setup ? "Keep browsing" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

function ProfileSummary({
  profile,
  pending,
  onEdit,
  onSkip,
}: Readonly<{
  profile: LearnerProfile;
  pending: boolean;
  onEdit: () => void;
  onSkip: () => void;
}>) {
  return (
    <>
      <p className="learner-display-name">
        Preferred name: {profile.displayName ?? "Not set"}
      </p>
      <div className="learner-actions">
        <button
          className="button button--secondary"
          type="button"
          disabled={pending}
          onClick={onEdit}
        >
          {profile.setupComplete ? "Edit profile" : "Set up profile"}
        </button>
        {!profile.setupComplete ? (
          <button
            className="button button--secondary"
            type="button"
            disabled={pending}
            onClick={onSkip}
          >
            Skip for now
          </button>
        ) : null}
      </div>
    </>
  );
}

// eslint-disable-next-line complexity, max-lines-per-function, sonarjs/cognitive-complexity -- Keep setup and edit states in one form.
export default function LearnerProfilePanel({
  setupOnly = false,
}: Readonly<{ setupOnly?: boolean }>) {
  const { profile, failed, retry, save } = useLearnerProfile();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  if (setupOnly && (profile?.setupComplete || (!profile && !failed)))
    return null;

  function close() {
    setEditing(false);
    heading.current?.focus();
  }

  async function submit(name: string | null) {
    if (!save) return;
    setPending(true);
    setError(false);
    try {
      await save(name);
      close();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className={
        setupOnly ? "learner-profile learner-profile--setup" : "learner-profile"
      }
      aria-labelledby="profile-heading"
    >
      <h2 id="profile-heading" ref={heading} tabIndex={-1}>
        {setupOnly ? "What should we call you?" : "Your profile"}
      </h2>
      {setupOnly && profile ? (
        <p>
          Choose the name you would like to see when you sign in. You can change
          it later.
        </p>
      ) : null}
      {error || failed ? (
        <p role="alert">
          {profile
            ? "Your changes could not be saved."
            : "Your profile could not be loaded."}
        </p>
      ) : null}
      {!profile && !failed ? <p role="status">Loading profile...</p> : null}
      {failed ? (
        <button
          type="button"
          className="button button--secondary"
          onClick={retry}
        >
          Try again
        </button>
      ) : null}
      {profile && !setupOnly ? (
        <p className="learner-email">
          Email from CILogon: {profile.email ?? "Not provided"}{" "}
          {profile.email ? <span>(private)</span> : null}
        </p>
      ) : null}
      {profile && (editing || setupOnly) ? (
        <ProfileForm
          profile={profile}
          pending={pending}
          setup={setupOnly}
          onSave={(name) => {
            void submit(name);
          }}
          onCancel={
            setupOnly
              ? () => {
                  void submit(profile.displayName);
                }
              : close
          }
        />
      ) : null}
      {profile && !editing && !setupOnly ? (
        <ProfileSummary
          profile={profile}
          pending={pending}
          onEdit={() => {
            setError(false);
            setEditing(true);
          }}
          onSkip={() => {
            void submit(profile.displayName);
          }}
        />
      ) : null}
    </section>
  );
}
