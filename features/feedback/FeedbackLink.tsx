"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { feedbackLinkLabel } from "./links";
import { safeReturnTo } from "./return-to";

export default function FeedbackLink({
  label = feedbackLinkLabel,
  onNavigate,
}: Readonly<{ label?: string; onNavigate?: () => void }>) {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  const currentHref = query ? `${pathname}?${query}` : pathname;
  const returnTo =
    pathname === "/feedback"
      ? safeReturnTo(params.get("returnTo") ?? undefined)
      : safeReturnTo(currentHref);
  const href =
    returnTo === "/"
      ? "/feedback"
      : `/feedback?${new URLSearchParams({ returnTo })}`;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={pathname === "/feedback" ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
