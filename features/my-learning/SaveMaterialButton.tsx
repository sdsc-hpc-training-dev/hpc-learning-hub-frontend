"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/features/auth/SessionProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function SaveMaterialButton({
  materialId,
  compact = false,
}: Readonly<{ materialId: string; compact?: boolean }>) {
  const { account, loading, bookmarkedIds, toggleBookmark } = useSession();
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const notify = useToast();
  const saved = bookmarkedIds.has(materialId);
  let buttonLabel = "Save";
  if (pending) buttonLabel = "Saving…";
  else if (saved) buttonLabel = "Saved";
  const accessibleLabel = saved ? "Remove saved material" : "Save material";

  async function handleClick() {
    if (!account) {
      const returnTo = typeof window === "undefined"
        ? pathname
        : `${window.location.pathname}${window.location.search}`;
      router.push(`/account?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    setPending(true);
    try {
      const nextSaved = await toggleBookmark(materialId);
      notify(nextSaved ? "Saved to My Learning." : "Removed from My Learning.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Your bookmark could not be updated.", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className={`save-button${saved ? " is-saved" : ""}${compact ? " save-button--compact" : ""}`}
      type="button"
      aria-pressed={saved}
      aria-label={accessibleLabel}
      disabled={loading || pending}
      onClick={() => { void handleClick(); }}
    >
      <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      <span>{buttonLabel}</span>
    </button>
  );
}
