"use client";

import Link from "next/link";
import { useSession } from "@/features/auth/SessionProvider";

export default function PersonalPathsLink() {
  if (useSession().status !== "signed-in") return null;

  return (
    <p className="personal-paths-link">
      Prefer your own?{" "}
      <Link className="text-link" href="/my-learning#personal-paths">
        Check your learning paths
      </Link>
    </p>
  );
}
