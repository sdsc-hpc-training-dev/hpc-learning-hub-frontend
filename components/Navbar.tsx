"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/features/auth/SessionProvider";
import { useToast } from "@/components/ui/ToastProvider";

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

function getCurrentPage(pathname: string): string {
  if (pathname.includes("my-learning") || pathname.includes("account")) return "";
  if (pathname.includes("training") || pathname.includes("materials")) return "catalog";
  if (pathname.includes("learning")) return "learning";
  if (pathname.includes("events")) return "events";
  if (pathname.includes("programs")) return "programs";
  return "home";
}

// eslint-disable-next-line max-lines-per-function
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { account, loading, signOut } = useSession();
  const notify = useToast();
  const currentPage = getCurrentPage(pathname);
  const closeMenus = () => { setMenuOpen(false); };
  let accountActions;
  if (loading) {
    accountActions = <span className="nav-session-loading" aria-label="Checking account" />;
  } else if (account) {
    accountActions = (
      <details className="account-menu">
        <summary aria-label={`Account menu for ${account.username}`}>
          <span className="account-avatar" aria-hidden="true">{account.username.slice(0, 1).toUpperCase()}</span>
          <span>{account.username}</span>
          <span className="account-menu__chevron" aria-hidden="true">⌄</span>
        </summary>
        <div className="account-menu__panel">
          <p className="account-menu__identity">Signed in as <strong>{account.email}</strong></p>
          <Link href="/my-learning" onClick={closeMenus}>My Learning</Link>
          <Link href="/account" onClick={closeMenus}>Account settings</Link>
          <button type="button" onClick={() => { void handleSignOut(); }}>Sign out</button>
        </div>
      </details>
    );
  } else {
    accountActions = (
      <>
        <Link className="nav-signin" href={`/account?next=${encodeURIComponent(pathname)}`} onClick={closeMenus}>
          Sign in
        </Link>
        <Link className="nav-button" href={`/account?mode=create&next=${encodeURIComponent(pathname)}`} onClick={closeMenus}>
          Create account
        </Link>
      </>
    );
  }

  async function handleSignOut() {
    try {
      await signOut();
      closeMenus();
      router.push("/");
      router.refresh();
    } catch {
      notify("We could not sign you out. Please try again.", "error");
    }
  }

  return (
    <header className="site-header">
      <div className="header-shell">
        <Link className="site-brand" href="/" aria-label="HPC Learning Hub home">
          <Image src="/SDSC-logo.svg" alt="San Diego Supercomputer Center" width={170} height={48} priority />
          <span>HPC Learning Hub</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => { setMenuOpen((open) => !open); }}
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
              aria-current={currentPage === key ? "page" : undefined}
              onClick={closeMenus}
            >
              {label}
            </Link>
          ))}
          <div className="nav-account-actions">
            {accountActions}
          </div>
        </nav>
      </div>
    </header>
  );
}
