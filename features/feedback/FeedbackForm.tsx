"use client";
/* eslint-disable @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-misused-promises, @typescript-eslint/no-deprecated, sonarjs/deprecation, max-lines-per-function */

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

type FoundWhatNeeded = "yes" | "partly" | "no" | "just_browsing";
interface FeedbackValues {
  rating: number | null;
  foundWhatNeeded: FoundWhatNeeded | "";
  workedWell: string;
  improvements: string;
}

const initialValues: FeedbackValues = {
  rating: null,
  foundWhatNeeded: "",
  workedWell: "",
  improvements: "",
};

function friendlyError(status: number) {
  if (status === 429) return "Feedback is temporarily busy. Please try again shortly.";
  if (status >= 500) return "Feedback is temporarily unavailable. Please try again later.";
  return "Please review your response and try again.";
}

const exploreOptions = [
  { href: "/learning-paths", title: "Learning Paths", detail: "Build your skills one step at a time with a guided sequence of training materials." },
  { href: "/events", title: "Events & Recordings", detail: "See what's coming up at SDSC or catch a workshop you missed." },
  { href: "/programs", title: "Programs & Series", detail: "Discover related materials from SDSC webinars, summer institutes, and training series." },
];

export default function FeedbackForm() {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const ratingRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (submitted) {
      successRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [submitted]);
  const update = <K extends keyof FeedbackValues>(key: K, value: FeedbackValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (values.rating === null) {
      setError("Choose an overall experience rating before sending feedback.");
      ratingRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: values.rating,
          foundWhatNeeded: values.foundWhatNeeded || null,
          workedWell: values.workedWell.trim() ? values.workedWell : null,
          improvements: values.improvements.trim() ? values.improvements : null,
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setSubmitted(true);
    } catch (reason) {
      const status = Number(reason instanceof Error ? reason.message : 0);
      setError(friendlyError(status));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <>
      <section className="feedback-complete" aria-labelledby="feedback-thanks">
        <div className="section-shell">
          <p className="eyebrow feedback-receipt" role="status">Feedback received</p>
          <h1 id="feedback-thanks" ref={successRef} tabIndex={-1}>Thanks for helping us improve.</h1>
          <p className="feedback-invitation">What would you like to learn next? Find a tutorial for your next HPC task, revisit a workshop, or explore something new at your own pace.</p>
          <div className="feedback-actions">
            <Link href="/materials" className="button button--gold">Browse the Training Library</Link>
          </div>
        </div>
      </section>
      <section className="feedback-explore" aria-labelledby="feedback-explore">
        <div className="section-shell">
          <h2 id="feedback-explore">Keep exploring the Hub</h2>
          <nav aria-label="Explore the Learning Hub">
            <ul className="feedback-destinations">
              {exploreOptions.map(({ href, title, detail }) => (
                <li key={href}>
                  <Link href={href} className="feedback-destination">
                    <span className="text-link">{title} <span aria-hidden="true">&rarr;</span></span>
                    <span>{detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>;
  }

  const form = (
    <form className="feedback-form" onSubmit={submit} noValidate aria-describedby={error ? "feedback-error" : undefined}>
      <p>
        We do not collect your identity or use your answers for analytics. Do
        not include personal or sensitive information; anonymous responses are
        retained for up to 12 months.
      </p>
      {error ? <div id="feedback-error" className="feedback-error" role="alert">{error}</div> : null}
      <fieldset disabled={submitting}>
        <legend>Overall experience <span aria-hidden="true">(required)</span></legend>
        <div className="feedback-options">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating}><input ref={rating === 1 ? ratingRef : undefined} type="radio" name="rating" value={rating} checked={values.rating === rating} required onChange={() => update("rating", rating)} /> {rating}</label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={submitting}>
        <legend>Did you find what you needed? <span>(optional)</span></legend>
        <div className="feedback-options">
          {([ ["yes", "Yes"], ["partly", "Partly"], ["no", "No"], ["just_browsing", "Just browsing"] ] as const).map(([value, label]) => (
            <label key={value}><input type="radio" name="foundWhatNeeded" value={value} checked={values.foundWhatNeeded === value} onChange={() => update("foundWhatNeeded", value)} /> {label}</label>
          ))}
        </div>
      </fieldset>
      <label htmlFor="worked-well">What worked well? <span>(optional)</span></label>
      <textarea id="worked-well" maxLength={500} value={values.workedWell} disabled={submitting} onChange={(event) => update("workedWell", event.target.value)} aria-describedby="worked-well-count" />
      <p id="worked-well-count" className="feedback-counter">{values.workedWell.length}/500</p>
      <label htmlFor="improvements">What could improve? <span>(optional)</span></label>
      <textarea id="improvements" maxLength={500} value={values.improvements} disabled={submitting} onChange={(event) => update("improvements", event.target.value)} aria-describedby="improvements-count" />
      <p id="improvements-count" className="feedback-counter">{values.improvements.length}/500</p>
      <button className="button button--gold" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send feedback"}</button>
    </form>
  );

  return <>
    <section className="page-hero" aria-labelledby="feedback-heading">
      <div className="page-hero__shell">
        <span className="eyebrow">Feedback</span>
        <h1 id="feedback-heading">Help improve the Learning Hub.</h1>
        <p>Your feedback helps us improve the public training experience.</p>
      </div>
    </section>
    <section className="section">
      <div className="section-shell feedback-shell">{form}</div>
    </section>
  </>;
}
