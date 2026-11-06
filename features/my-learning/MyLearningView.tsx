"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import { deletePath, getPaths, type PersonalPath } from "./api";
import PersonalPathEditor from "./PersonalPathEditor";
import SaveMaterialButton from "./SaveMaterialButton";

// eslint-disable-next-line complexity, max-lines-per-function, sonarjs/cognitive-complexity
export default function MyLearningView() {
  const { status, bookmarks, reloadBookmarks } = useSession();
  const [paths, setPaths] = useState<PersonalPath[]>([]);
  const [editing, setEditing] = useState<PersonalPath | "new" | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [, result] = await Promise.all([reloadBookmarks(true), getPaths()]);
      setPaths(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [reloadBookmarks]);
  useEffect(() => {
    if (status === "signed-in") void refresh();
    else setPaths([]);
  }, [status, refresh]);
  useEffect(() => {
    if (status !== "signed-in") return;
    const controller = new AbortController();
    void Promise.all(
      bookmarks.map(async ({ materialId }) => {
        try {
          const response = await fetch(
            `/api/v1/materials/${encodeURIComponent(materialId)}`,
            { signal: controller.signal, credentials: "same-origin" },
          );
          if (!response.ok) return [materialId, ""] as const;
          const material = (await response.json()) as { title?: string | null };
          return [materialId, material.title ?? ""] as const;
        } catch {
          return [materialId, ""] as const;
        }
      }),
    ).then((entries) => {
      if (!controller.signal.aborted) setTitles(Object.fromEntries(entries));
      return undefined;
    });
    return () => {
      controller.abort();
    };
  }, [bookmarks, status]);
  async function remove(path: PersonalPath) {
    if (!window.confirm(`Delete "${path.title}"?`)) return;
    try {
      await deletePath(path.id);
      await refresh();
    } catch {
      setError(true);
    }
  }
  return (
    <div className="section-shell account-page">
      <h1>My Learning</h1>
      {status === "checking" ? (
        <p role="status">Checking your account...</p>
      ) : null}
      {status === "disabled" ? <p>Accounts are not available.</p> : null}
      {status === "unavailable" ? (
        <p role="alert">
          Account status is unavailable. Please try again later.
        </p>
      ) : null}
      {status === "anonymous" || status === "expired" ? (
        <p>
          {status === "expired" ? "Your session expired. " : ""}
          <Link href="/account">Sign in to view My Learning</Link>.
        </p>
      ) : null}
      {status === "signed-in" ? (
        <>
          {loading ? <p role="status">Loading your learning...</p> : null}
          {error ? (
            <p role="alert">
              My Learning could not be loaded or updated. Please try again.
            </p>
          ) : null}
          <section aria-labelledby="saved-heading">
            <h2 id="saved-heading">Saved materials</h2>
            {!loading && bookmarks.length === 0 ? (
              <p>
                No saved materials yet.{" "}
                <Link href="/materials">Browse the Training Library</Link>.
              </p>
            ) : null}
            <ul>
              {bookmarks.map((item) => (
                <li key={item.materialId}>
                  <Link
                    href={`/materials/${encodeURIComponent(item.materialId)}`}
                  >
                    {titles[item.materialId] || `Material ${item.materialId}`}
                  </Link>{" "}
                  <SaveMaterialButton materialId={item.materialId} />
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="paths-heading">
            <h2 id="paths-heading">Personal learning paths</h2>
            {!editing ? (
              <button
                className="button button--gold"
                type="button"
                onClick={() => {
                  setEditing("new");
                }}
              >
                Create a path
              </button>
            ) : (
              <PersonalPathEditor
                key={editing === "new" ? "new" : editing.id}
                path={editing === "new" ? undefined : editing}
                bookmarks={bookmarks}
                titles={titles}
                onCancel={() => {
                  setEditing(null);
                }}
                onSaved={async () => {
                  setEditing(null);
                  await refresh();
                }}
              />
            )}
            {paths.map((path) => (
              <article className="account-path" key={path.id}>
                <h3>{path.title}</h3>
                {path.description ? <p>{path.description}</p> : null}
                <ol>
                  {[...path.items]
                    .sort((a, b) => a.position - b.position)
                    .map((item) => {
                      const id = item.materialId ?? item.material?.id ?? "";
                      return (
                        <li key={id}>
                          <Link href={`/materials/${encodeURIComponent(id)}`}>
                            {item.material?.title ?? `Material ${id}`}
                          </Link>
                        </li>
                      );
                    })}
                </ol>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(path);
                  }}
                >
                  Edit
                </button>{" "}
                <button
                  type="button"
                  onClick={() => {
                    void remove(path);
                  }}
                >
                  Delete
                </button>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}
