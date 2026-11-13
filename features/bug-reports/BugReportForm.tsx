"use client";

import Link from "next/link";
import { type SubmitEvent, useEffect, useRef, useState } from "react";
import { feedbackIssuesUrl } from "@/features/feedback/links";

const fields = [
  { name: "title", label: "Give the problem a short title", limit: 100, required: true, rows: 0 },
  { name: "description", label: "What happened?", limit: 1000, required: true, rows: 5 },
  { name: "pageUrl", label: "Which page were you on?", limit: 500, required: false, rows: 0 },
  { name: "steps", label: "What did you do before it happened?", limit: 1000, required: false, rows: 4 },
] as const;

const initialValues = { title: "", description: "", pageUrl: "", steps: "" };
type ReportValues = typeof initialValues;

function failure(status: number) {
  if (status === 429) return "Too many reports right now. Please try again shortly.";
  if (status === 413) return "This report is too large. Shorten it and try again.";
  if (status >= 400 && status < 500) return "Enter a title and description, and check that any page URL starts with http:// or https://.";
  return "We couldn't save your report. Your answers are still here. Please try again.";
}

function ReportConfirmation({ values, onReset }: Readonly<{ values: ReportValues; onReset: () => void }>) {
  const heading = useRef<HTMLHeadingElement>(null);
  const page = URL.parse(values.pageUrl);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return (
    <section className="section report-confirmation" aria-labelledby="report-thanks">
      <div className="section-shell">
        <p className="eyebrow" role="status">Report received</p>
        <h1 id="report-thanks" tabIndex={-1} ref={heading}>Thank you for helping improve the Hub.</h1>
        <p className="feedback-invitation">
          Ready to discover something new? Explore a tutorial, follow a learning path, or find your next workshop.
        </p>
        <div className="feedback-actions">
          <Link href="/materials" className="button button--gold">Explore the Training Library</Link>
          <Link href="/learning-paths" className="button button--secondary">Find a learning path</Link>
        </div>
        <details className="report-receipt">
          <summary>Your saved report</summary>
          <dl>
            <div><dt>Title</dt><dd>{values.title.trim()}</dd></div>
            <div><dt>What happened</dt><dd>{values.description.trim()}</dd></div>
            <div><dt>Page</dt><dd>{page ? `${page.origin}${page.pathname}` : "Not provided"}</dd></div>
            <div><dt>Steps to reproduce</dt><dd>{values.steps.trim() || "Not provided"}</dd></div>
          </dl>
        </details>
        <button className="button button--secondary" type="button" onClick={onReset}>Create another report</button>
        <nav className="report-explore" aria-label="Keep exploring the Hub">
          <h2>Where will you go next?</h2>
          <ul className="feedback-destinations">
            <li><Link className="feedback-destination" href="/programs"><strong className="text-link">Programs &amp; Series &rarr;</strong><span>Explore SDSC&apos;s workshops and ongoing training series.</span></Link></li>
            <li><Link className="feedback-destination" href="/events"><strong className="text-link">Events &amp; Recordings &rarr;</strong><span>Find upcoming events and recordings from past sessions.</span></Link></li>
          </ul>
        </nav>
      </div>
    </section>
  );
}

function ReportAlternatives() {
  return (
    <aside className="report-alternatives" aria-labelledby="report-options-heading">
      <h2 id="report-options-heading">Other ways to help</h2>
      <h3>Already use GitHub?</h3>
      <p>Our public issue tracker supports screenshots, detailed bug reports, and feature requests.</p>
      <a className="text-link" href={feedbackIssuesUrl} target="_blank" rel="noopener noreferrer">
        Report on GitHub <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">&rarr;</span>
      </a>
      <h3>A security concern?</h3>
      <p>Keep sensitive details out of public reports.</p>
      <a className="text-link" href="https://github.com/sdsc-hpc-training-dev/learning-hub-feedback/security/policy" target="_blank" rel="noopener noreferrer">
        Read our private reporting instructions <span className="sr-only">(opens in a new tab)</span><span aria-hidden="true">&rarr;</span>
      </a>
    </aside>
  );
}

// eslint-disable-next-line max-lines-per-function -- Keep the form states and accessible labels together.
export default function BugReportForm() {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const busy = useRef(false);
  const intro = useRef<HTMLHeadingElement>(null);
  const returningToForm = useRef(false);
  useEffect(() => {
    if (!complete && returningToForm.current) {
      intro.current?.focus();
      returningToForm.current = false;
    }
  }, [complete]);

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

  if (complete) {
    return <ReportConfirmation values={values} onReset={() => {
      returningToForm.current = true;
      setValues(initialValues);
      setComplete(false);
    }} />;
  }

  return (
    <>
      <section className="page-hero" aria-labelledby="report-heading">
        <div className="page-hero__shell">
          <span className="eyebrow">Report a bug</span>
          <h1 id="report-heading" ref={intro} tabIndex={-1}>Something not working?</h1>
          <p>Describe what happened. No GitHub account or technical background needed.</p>
        </div>
      </section>
      <section className="section">
        <div className="section-shell report-layout">
          <form className="bug-report-form" aria-busy={pending} onSubmit={(event) => { void submit(event); }}>
            {fields.map(({ name, label, limit, required, rows }) => {
              // eslint-disable-next-line security/detect-object-injection -- Keys are from the fixed field list.
              const value = values[name];
              const props = {
                id: `report-${name}`,
                name,
                maxLength: limit,
                required,
                disabled: pending,
                value,
                "aria-describedby": name === "pageUrl" ? "report-page-note report-pageUrl-count" : `report-${name}-count`,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                  const value = event.target.value;
                  setValues((current) => ({ ...current, [name]: value }));
                },
              };
              return (
                <div className="bug-report-form__field" key={name}>
                  <label htmlFor={props.id}>{label} ({required ? "required" : "optional"})</label>
                  {rows ? <textarea rows={rows} {...props} /> : <input {...props} type={name === "pageUrl" ? "url" : "text"} placeholder={name === "pageUrl" ? "https://learning-hub.sdsc.edu/..." : undefined} />}
                  {name === "pageUrl" ? <p id="report-page-note" className="report-help">Paste a public page address, if you have one.</p> : null}
                  <p className="report-count" id={`report-${name}-count`}>{value.length}/{limit}</p>
                </div>
              );
            })}
            {error ? <p className="feedback-error" role="alert">{error}</p> : null}
            <p className="report-help">Please leave out passwords, personal information, and security vulnerabilities.</p>
            <button className="button button--gold" type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</button>
          </form>
          <ReportAlternatives />
        </div>
      </section>
    </>
  );
}
