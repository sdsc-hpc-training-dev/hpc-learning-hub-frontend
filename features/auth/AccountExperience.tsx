"use client";

import Link from "next/link";
import { useState } from "react";
import AccountPanel, { type AccountMode } from "./AccountPanel";

export default function AccountExperience({
  initialMode,
  returnTo,
}: Readonly<{ initialMode: AccountMode; returnTo?: string }>) {
  const [mode, setMode] = useState<AccountMode>(initialMode);
  const isCreate = mode === "create";

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-intro">
          <Link className="auth-back" href="/">← Continue browsing without an account</Link>
          <span className="eyebrow">Optional learner account</span>
          <h1>{isCreate ? "Create continuity, not a barrier." : "Keep your learning together."}</h1>
          <p>{isCreate
            ? "An account is optional. It adds personal bookmarks and progress while the public catalog stays open to everyone."
            : "SDSC training remains public. Sign in only when you want bookmarks, progress, and continuity."}</p>
          <div className="auth-benefits" aria-label="Account benefits">
            <div><span aria-hidden="true">☆</span><p><strong>Save training</strong><br />Keep useful materials in one place.</p></div>
            <div><span aria-hidden="true">▶</span><p><strong>Continue learning</strong><br />Return to paths and completed steps.</p></div>
            <div><span aria-hidden="true">A</span><p><strong>Revisit AIDA</strong><br />Find recommendations from recent questions.</p></div>
          </div>
          <p className="auth-intro__note"><strong>Account benefits:</strong> no account is needed to browse the public training catalog. Sign in to keep your bookmarks and learning progress together.</p>
        </aside>
        <AccountPanel initialMode={initialMode} returnTo={returnTo} onModeChange={setMode} />
      </div>
    </main>
  );
}
