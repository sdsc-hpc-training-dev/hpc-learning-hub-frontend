"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const pathname = usePathname();

  // Determine current page for active styling
  const getCurrentPage = () => {
    if (pathname === "/") return "home";
    if (pathname.includes("training")) return "catalog";
    if (pathname.includes("learning")) return "learning";
    if (pathname.includes("events")) return "events";
    if (pathname.includes("programs")) return "programs";
    return "";
  };

  const currentPage = getCurrentPage();

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleAccountClick = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-shell">
        <Link className="site-brand" href="/" aria-label="HPC Learning Hub home">
          <img
            src="/SDSC-logo.svg"
            alt="San Diego Supercomputer Center"
            width={170}
            height="auto"
          />
          <span>HPC Learning Hub</span>
        </Link>

        <button
          className="mobile-aida"
          type="button"
          aria-label="Open Ask AIDA"
          title="Ask AIDA"
        >
          <span aria-hidden="true">A</span>
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={handleMenuClick}
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

          <button
            className="nav-aida"
            type="button"
            title="Ask AIDA"
            onClick={closeMenus}
          >
            Ask AIDA
          </button>

          <div className="nav-account-actions">
            <Link className="nav-signin" href="/account">
              Sign in
            </Link>
            <Link className="nav-create-account" href="/account?mode=create">
              Create account
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
