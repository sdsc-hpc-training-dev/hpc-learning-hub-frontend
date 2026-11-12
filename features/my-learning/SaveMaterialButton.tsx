"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import { addBookmark, removeBookmark } from "./api";

type Placement = "card" | "detail";

function BookmarkStar({
  saved,
  disabled,
  label,
  placement,
  error,
  onToggle,
}: Readonly<{
  saved: boolean;
  disabled: boolean;
  label: string;
  placement?: Placement;
  error: boolean;
  onToggle: () => void;
}>) {
  const [hintDismissed, setHintDismissed] = useState(false);
  return (
    <span
      className={
        placement
          ? `bookmark-control bookmark-control--${placement}`
          : "bookmark-control"
      }
      onPointerLeave={() => {
        setHintDismissed(false);
      }}
    >
      <button
        className="bookmark-star"
        type="button"
        aria-label={label}
        aria-pressed={saved}
        disabled={disabled}
        onBlur={() => {
          setHintDismissed(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setHintDismissed(true);
        }}
        onClick={onToggle}
      >
        <span className="bookmark-star__glyph" aria-hidden="true">
          {saved ? "\u2605" : "\u2606"}
        </span>
      </button>
      {!hintDismissed && !error ? (
        <span className="bookmark-hint" aria-hidden="true">
          {saved ? "Remove this bookmark" : "Bookmark this training material"}
        </span>
      ) : null}
      {error ? (
        <span className="bookmark-error" role="alert">
          Could not update bookmark.
        </span>
      ) : null}
    </span>
  );
}

export default function SaveMaterialButton({
  materialId,
  materialTitle,
  placement,
  onRemoved,
}: Readonly<{
  materialId: string;
  materialTitle?: string;
  placement?: Placement;
  onRemoved?: () => void;
}>) {
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
  if (!privateRequest)
    return placement === "detail" ? (
      <Link href="/account">Sign in to save</Link>
    ) : null;
  const saved = bookmarks.some((item) => item.materialId === materialId);
  async function toggle(request: NonNullable<typeof privateRequest>) {
    setPending(true);
    setError(false);
    try {
      await (saved
        ? removeBookmark(request, materialId)
        : addBookmark(request, materialId));
      if (saved) onRemoved?.();
      await reloadBookmarks();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <BookmarkStar
      label={materialTitle ? `Bookmark: ${materialTitle}` : "Bookmark material"}
      placement={placement}
      saved={saved}
      disabled={pending || !bookmarksAvailable}
      error={error}
      onToggle={() => {
        void toggle(privateRequest);
      }}
    />
  );
}
