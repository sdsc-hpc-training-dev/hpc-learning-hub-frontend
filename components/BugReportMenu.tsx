"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bug } from "lucide-react";
import {
  feedbackIssuesUrl,
  utilityBugReportLabel,
} from "@/features/feedback/links";

// eslint-disable-next-line max-lines-per-function -- Keep disclosure focus and dismissal with the trigger.
export default function BugReportMenu({
  onOpen,
}: Readonly<{ onOpen: () => void }>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open]);

  return (
    <div
      className="bug-report-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }}
    >
      <button
        className="site-utility__report"
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
      >
        {utilityBugReportLabel}
        <Bug
          className="site-utility__bug"
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
      <div
        className="bug-report-options"
        id={id}
        role="group"
        aria-label="Bug reporting options"
        hidden={!open}
      >
        <a
          href={feedbackIssuesUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setOpen(false);
            trigger.current?.focus();
          }}
        >
          <Image src="/brand/github.png" width={20} height={20} alt="" />
          <span>
            Report an issue or bug on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </span>
        </a>
        <p>Don't have a GitHub account?</p>
        <Link
          href="/feedback#improvements"
          onClick={() => {
            setOpen(false);
          }}
        >
          Tell us what went wrong
        </Link>
      </div>
    </div>
  );
}
