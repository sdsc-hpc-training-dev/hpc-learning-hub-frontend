"use client";

import Link from "next/link";
import { useSession } from "@/features/auth/SessionProvider";

export default function ProfileLink() {
  if (useSession().status !== "signed-in") return null;
  return <Link href="/account">Your profile</Link>;
}
