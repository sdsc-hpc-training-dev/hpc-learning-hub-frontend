"use client";

import Link from "next/link";
import { type SubmitEvent, useEffect, useRef, useState } from "react";

const fields = [
  { name: "title", label: "Short title", limit: 100, required: true, type: "text" },
  { name: "description", label: "What happened?", limit: 1000, required: true, type: "textarea" },
  { name: "pageUrl", label: "Page URL", limit: 500, required: false, type: "url" },
  { name: "steps", label: "Steps to reproduce", limit: 1000, required: false, type: "textarea" },
] as const;

const initialValues = { title: "", description: "", pageUrl: "", steps: "" };

function failure(status: number) {
  if (status === 429) return "Too many reports right now. Please try again shortly.";
  if (status === 413) return "This report is too large. Shorten it and try again.";
  if (status >= 400 && status < 500) return "Enter a title and description, and check that any page URL starts with http:// or https://.";
  return "We couldn't save your report. Your answers are still here. Please try again.";
}

function ReportConfirmation() {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return (
    <section className="feedback-complete" aria-labelledby="report-thanks">
      <div className="section-shell">
        <p className="eyebrow feedback-receipt" role="status">Report received</p>
        <h1 id="report-thanks" tabIndex={-1} ref={heading}>Thanks for flagging that.</h1>
        <p className="feedback-invitation">
          Your report helps us make the Hub easier to use. In the meantime, find a tutorial for your next project or pick a guided path to learn something new.
        </p>
        <nav className="feedback-actions" aria-label="Keep exploring">
          <Link href="/materials" className="button button--gold">Browse the Training Library</Link>
          <Link href="/learning-paths" className="button button--white">Explore learning paths</Link>
          <Link href="/events" className="button button--white">Find events and recordings</Link>
        </nav>
      </div>
    </section>
  );
}

// eslint-disable-next-line max-lines-per-function -- Keep the form states and accessible labels together.
export default function BugReportForm() {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const busy = useRef(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (!values.title.trim() || !values.description.trim()) {
      setError("Enter a short title and tell us what happened.");
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/v1/bug-reports", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.status === 201) setComplete(true);
      else setError(failure(response.status));
    } catch {
      setError(failure(0));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (complete) return <ReportConfirmation />;

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__shell">
          <h1>Report a bug</h1>
          <p>Something not working in the Learning Hub? Tell us what you ran into.</p>
        </div>
      </section>
      <section className="section">
        <div className="section-shell feedback-shell">
          <form className="feedback-form bug-report-form" aria-busy={pending} onSubmit={(event) => { void submit(event); }}>
            <p>No account is needed. Please leave out passwords and personal information. For a security concern, <a href="https://github.com/sdsc-hpc-training-dev/learning-hub-feedback/security/policy">use our private reporting instructions</a>.</p>
            {error ? <p className="feedback-error" role="alert">{error}</p> : null}
            {fields.map(({ name, label, limit, required, type }) => {
              // eslint-disable-next-line security/detect-object-injection -- Keys are from the fixed field list.
              const value = values[name];
              const props = {
                id: `report-${name}`,
                name,
                maxLength: limit,
                required,
                disabled: pending,
                value,
                "aria-describedby": `report-${name}-count`,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                  const value = event.target.value;
                  setValues((current) => ({ ...current, [name]: value }));
                },
              };
              return (
                <div className="bug-report-form__field" key={name}>
                  <label htmlFor={props.id}>{label} <span>({required ? "required" : "optional"})</span></label>
                  {type === "textarea" ? <textarea {...props} /> : <input type={type} {...props} />}
                  <p className="feedback-counter" id={`report-${name}-count`}>{value.length}/{limit}</p>
                </div>
              );
            })}
            <button className="button button--gold" type="submit" disabled={pending}>{pending ? "Saving..." : "Save report"}</button>
          </form>
        </div>
      </section>
    </>
  );
}
