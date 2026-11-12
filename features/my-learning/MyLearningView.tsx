"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import { deletePath, getPaths, type Bookmark, type PersonalPath } from "./api";
import PersonalPathEditor from "./PersonalPathEditor";
import SaveMaterialButton from "./SaveMaterialButton";
import LearnerProfilePanel from "./LearnerProfilePanel";
import { useLearnerProfile } from "./LearnerProfileProvider";
import DeletePathDialog from "./DeletePathDialog";

const bookmarkPageSize = 6;
const collectionCount = (count: number) =>
  count >= 10 ? "10+" : String(count);

export default function MyLearningView() {
  const session = useSession();
  return (
    <MyLearningContent
      key={session.account?.id ?? session.status}
      session={session}
    />
  );
}

// eslint-disable-next-line complexity, max-lines-per-function, sonarjs/cognitive-complexity
function MyLearningContent({
  session,
}: Readonly<{ session: ReturnType<typeof useSession> }>) {
  const { status, bookmarks, reloadBookmarks, privateRequest } = session;
  const preferredName = useLearnerProfile().profile?.displayName;
  const [paths, setPaths] = useState<PersonalPath[]>([]);
  const [editing, setEditing] = useState<PersonalPath | "new" | null>(null);
  const [deleting, setDeleting] = useState<PersonalPath | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(status === "signed-in");
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [keptBookmarks, setKeptBookmarks] = useState<
    Map<string, { bookmark: Bookmark; title?: string }>
  >(() => new Map());
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const materialTitles = new Map(
    Object.entries(titles).filter(([, title]) => title.trim().length > 0),
  );
  const pathsHeading = useRef<HTMLHeadingElement>(null);
  const bookmarkRows = [
    ...bookmarks,
    ...[...keptBookmarks.values()]
      .map(({ bookmark }) => bookmark)
      .filter(
        ({ materialId }) =>
          !bookmarks.some((item) => item.materialId === materialId),
      ),
  ].sort(
    (a, b) =>
      b.createdAt.localeCompare(a.createdAt) ||
      a.materialId.localeCompare(b.materialId),
  );
  const bookmarkPages = Math.max(
    1,
    Math.ceil(bookmarkRows.length / bookmarkPageSize),
  );
  const activeBookmarkPage = Math.min(bookmarkPage, bookmarkPages);
  const bookmarkStart = (activeBookmarkPage - 1) * bookmarkPageSize;
  function closeEditor() {
    setEditing(null);
    pathsHeading.current?.focus();
  }
  const refresh = useCallback(async () => {
    if (!privateRequest) return;
    setLoading(true);
    setError(false);
    try {
      const [, result] = await Promise.all([
        reloadBookmarks(true),
        getPaths(privateRequest),
      ]);
      setPaths(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [privateRequest, reloadBookmarks]);
  useEffect(() => {
    if (privateRequest) void refresh();
  }, [privateRequest, refresh]);
  useEffect(() => {
    const anchor = window.location.hash;
    if (
      privateRequest &&
      (anchor === "#personal-paths" || anchor === "#saved-materials")
    ) {
      const section = document.getElementById(anchor.slice(1));
      section?.focus({ preventScroll: true });
      section?.scrollIntoView();
    }
  }, [privateRequest]);
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
  return (
    <div className="section-shell account-page my-learning">
      <div className="my-learning-heading">
        <h1>My Learning</h1>
        {privateRequest ? (
          <Link className="text-link" href="#personal-paths">
            Go to my learning paths
          </Link>
        ) : null}
      </div>
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
      {privateRequest ? (
        <>
          <LearnerProfilePanel setupOnly />
          {loading ? <p role="status">Loading your learning...</p> : null}
          {error ? (
            <div className="learner-actions">
              <p role="alert">My Learning could not be loaded or updated.</p>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => {
                  void refresh();
                }}
              >
                Try again
              </button>
            </div>
          ) : null}
          <div className="learner-workspace">
            <section
              id="saved-materials"
              className="learner-saved"
              aria-labelledby="saved-heading"
              tabIndex={-1}
            >
              <h2 id="saved-heading">Saved materials</h2>
              <p>{collectionCount(bookmarks.length)} saved</p>
              {!loading && !error && bookmarkRows.length === 0 ? (
                <div className="learner-empty">
                  <p>No saved materials yet.</p>
                  <Link className="text-link" href="/materials">
                    Browse the Training Library
                  </Link>
                </div>
              ) : null}
              {bookmarkRows.length ? (
                <>
                  <ul className="learner-saved-list">
                    {bookmarkRows
                      .slice(bookmarkStart, bookmarkStart + bookmarkPageSize)
                      .map((item) => (
                        <li key={item.materialId}>
                          <Link
                            href={`/materials/${encodeURIComponent(item.materialId)}`}
                          >
                            {materialTitles.get(item.materialId) ??
                              keptBookmarks.get(item.materialId)?.title ??
                              `Material ${item.materialId}`}
                          </Link>{" "}
                          <SaveMaterialButton
                            materialId={item.materialId}
                            onRemoved={() => {
                              setKeptBookmarks((current) =>
                                new Map(current).set(item.materialId, {
                                  bookmark: item,
                                  title: materialTitles.get(item.materialId),
                                }),
                              );
                            }}
                          />
                        </li>
                      ))}
                  </ul>
                  {bookmarkPages > 1 ? (
                    <nav
                      className="learner-actions"
                      aria-label="Bookmark pages"
                    >
                      <button
                        className="button button--secondary"
                        type="button"
                        disabled={activeBookmarkPage === 1}
                        onClick={() => {
                          setBookmarkPage(activeBookmarkPage - 1);
                        }}
                      >
                        Previous
                      </button>
                      <span role="status">
                        Page {activeBookmarkPage} of {bookmarkPages}
                      </span>
                      <button
                        className="button button--secondary"
                        type="button"
                        disabled={activeBookmarkPage === bookmarkPages}
                        onClick={() => {
                          setBookmarkPage(activeBookmarkPage + 1);
                        }}
                      >
                        Next
                      </button>
                    </nav>
                  ) : null}
                  <Link className="text-link" href="/materials">
                    Find more materials to save
                  </Link>
                </>
              ) : null}
            </section>
            <section
              id="personal-paths"
              className="learner-paths"
              aria-labelledby="paths-heading"
              tabIndex={-1}
            >
              <div className="learner-section-heading">
                <h2 id="paths-heading" ref={pathsHeading} tabIndex={-1}>
                  Personal learning paths
                </h2>
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
                ) : null}
              </div>
              <p>{collectionCount(paths.length)} {paths.length === 1 ? "path" : "paths"}</p>
              <Link className="text-link" href="/learning-paths">
                Browse public learning paths
              </Link>
              {preferredName && paths.length > 0 ? (
                <p className="personal-paths-greeting">
                  {preferredName}, here are your saved learning paths.
                </p>
              ) : null}
              {!loading && !error && !editing && paths.length === 0 ? (
                <div className="learner-empty">
                  <p>No learning paths yet.</p>
                  <p>
                    Bring materials together around something you want to learn.
                  </p>
                </div>
              ) : null}
              {editing ? (
                <PersonalPathEditor
                  key={editing === "new" ? "new" : editing.id}
                  path={editing === "new" ? undefined : editing}
                  bookmarks={bookmarks}
                  privateRequest={privateRequest}
                  titles={titles}
                  onCancel={closeEditor}
                  onSaved={async () => {
                    closeEditor();
                    await refresh();
                  }}
                />
              ) : null}
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
                              {item.material?.title ??
                                materialTitles.get(id) ??
                                `Material ${id}`}
                            </Link>
                          </li>
                        );
                      })}
                  </ol>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => {
                      setEditing(path);
                    }}
                  >
                    Edit
                  </button>{" "}
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={(event) => {
                      deleteTrigger.current = event.currentTarget;
                      setDeleting(path);
                    }}
                  >
                    Delete
                  </button>
                </article>
              ))}
              {deleting ? (
                <DeletePathDialog
                  title={deleting.title}
                  onCancel={() => {
                    setDeleting(null);
                    window.requestAnimationFrame(() =>
                      deleteTrigger.current?.focus(),
                    );
                  }}
                  onDelete={async () => {
                    await deletePath(privateRequest, deleting.id);
                    if (editing !== "new" && editing?.id === deleting.id)
                      setEditing(null);
                    setDeleting(null);
                    window.requestAnimationFrame(() =>
                      pathsHeading.current?.focus(),
                    );
                    await refresh();
                  }}
                />
              ) : null}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
