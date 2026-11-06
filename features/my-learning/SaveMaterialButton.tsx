"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import { addBookmark, removeBookmark } from "./api";

export default function SaveMaterialButton({
  materialId,
}: Readonly<{ materialId: string }>) {
  const {
    status,
    bookmarks,
    bookmarksAvailable,
    reloadBookmarks,
    privateRequest,
  } = useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  if (status === "disabled" || status === "checking") return null;
  if (!privateRequest) return <Link href="/account">Sign in to save</Link>;
  const saved = bookmarks.some((item) => item.materialId === materialId);
  async function toggle(request: NonNullable<typeof privateRequest>) {
    setPending(true);
    setError(false);
    try {
      await (saved
        ? removeBookmark(request, materialId)
        : addBookmark(request, materialId));
      await reloadBookmarks();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <span>
      <button
        className="button button--secondary"
        type="button"
        aria-pressed={saved}
        disabled={pending || !bookmarksAvailable}
        onClick={() => {
          void toggle(privateRequest);
        }}
      >
        {saved ? "Remove saved material" : "Save material"}
      </button>
      {!bookmarksAvailable ? (
        <span role="status"> Bookmarks are loading or unavailable.</span>
      ) : null}
      {error ? <span role="alert"> Could not update bookmark.</span> : null}
    </span>
  );
}
