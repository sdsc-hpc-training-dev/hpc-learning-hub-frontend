"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { safeReturnTo } from "./return-to";

export default function FooterFeedbackLink() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const returnTo = safeReturnTo(query ? `${pathname}?${query}` : pathname);
  const href = returnTo === "/" ? "/feedback" : `/feedback?${new URLSearchParams({ returnTo })}`;

  return <Link href={href}>Give feedback</Link>;
}
