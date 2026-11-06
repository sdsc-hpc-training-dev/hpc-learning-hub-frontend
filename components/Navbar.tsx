"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/features/auth/SessionProvider";

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
  if (pathname === "/programs" || pathname.startsWith("/programs/"))
    return "programs";
  if (pathname.includes("training") || pathname.includes("materials"))
    return "catalog";
  if (pathname.startsWith("/learning-paths")) return "learning";
  if (pathname.includes("events")) return "events";
  if (pathname.includes("programs")) return "programs";
  return "home";
}

// eslint-disable-next-line max-lines-per-function
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = getCurrentPage(pathname);
  const { status } = useSession();

  const closeMenus = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-shell">
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
          <span>HPC Learning Hub</span>
        </Link>
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
              aria-current={currentPage === key ? "page" : undefined}
              onClick={closeMenus}
            >
              {label}
            </Link>
          ))}
          {status !== "disabled" && status !== "checking" ? (
            <div className="nav-account-actions">
              {status === "signed-in" ? (
                <Link
                  href="/my-learning"
                  onClick={closeMenus}
                  aria-current={
                    pathname === "/my-learning" ? "page" : undefined
                  }
                >
                  My Learning
                </Link>
              ) : null}
              <Link href="/account" onClick={closeMenus}>
                {status === "signed-in" ? "Account" : "Sign in"}
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
