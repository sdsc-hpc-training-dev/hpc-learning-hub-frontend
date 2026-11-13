"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bug } from "lucide-react";
import { usePathname } from "next/navigation";
import FeedbackLink from "@/features/feedback/FeedbackLink";
import {
  feedbackIssuesUrl,
  utilityBugReportLabel,
  utilityFeedbackLabel,
} from "@/features/feedback/links";

interface NavLink {
  key: string;
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { key: "home", href: "/", label: "Start Here" },
  { key: "catalog", href: "/materials", label: "Training Library" },
  { key: "learning", href: "/learning-paths", label: "Learning Paths" },
  { key: "events", href: "/events", label: "Events" },
  { key: "programs", href: "/programs", label: "Programs & Series" },
];

function isCurrent(pathname: string, href: string): "page" | undefined {
  return pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
    ? "page"
    : undefined;
}

// eslint-disable-next-line max-lines-per-function
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenus = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-utility">
        <nav className="site-utility__shell" aria-label="About and feedback">
          <Link
            href="/about"
            aria-current={isCurrent(pathname, "/about")}
            onClick={closeMenus}
          >
            About Us
          </Link>
          <Suspense
            fallback={<Link href="/feedback">{utilityFeedbackLabel}</Link>}
          >
            <FeedbackLink
              label={utilityFeedbackLabel}
              onNavigate={closeMenus}
            />
          </Suspense>
          <a
            className="site-utility__report"
            href={feedbackIssuesUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Something not working? Report a bug or request a feature on GitHub."
            onClick={closeMenus}
          >
            {utilityBugReportLabel}
            <Bug
              className="site-utility__bug"
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
              focusable="false"
            />
            <span className="sr-only"> on GitHub (opens in a new tab)</span>
          </a>
        </nav>
      </div>
      <div className="header-shell">
        <div className="site-brand-lockup" aria-label="SDSC and UC San Diego">
          <a
            className="site-school-brand"
            href="https://hsdsc.ucsd.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/brand/hsdsc-blue-gold.png"
              alt="UC San Diego Halicioglu School of Data Science and Computing"
              width={657}
              height={205}
              priority
              unoptimized
            />
          </a>
          <Link
            className="site-brand"
            href="/"
            aria-label="HPC Learning Hub home"
          >
            <Image
              src="/SDSC-logo.svg"
              alt="San Diego Supercomputer Center"
              width={170}
              height={48}
              priority
            />
          </Link>
          <Link href="/" className="site-name">
            HPC Learning Hub
          </Link>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        >
          Menu
        </button>
        <nav
          className={`primary-nav ${menuOpen ? "is-open" : ""}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map(({ key, href, label }) => (
            <Link
              key={key}
              href={href}
              aria-current={isCurrent(pathname, href)}
              onClick={closeMenus}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
