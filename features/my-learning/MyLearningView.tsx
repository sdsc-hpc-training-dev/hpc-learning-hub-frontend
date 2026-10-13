"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/auth/SessionProvider";
import type { CatalogMaterial } from "@/lib/gateway/types";
import MaterialCard from "@/features/training-library/MaterialCard";
import {
  deletePersonalPath,
  getBookmarks,
  getMaterialForLearner,
  getPersonalPaths,
  type PersonalLearningPath,
} from "./api";
import PersonalPathEditor from "./PersonalPathEditor";

type Tab = "bookmarks" | "paths";

function getPathItems(path: PersonalLearningPath, materials: Map<string, CatalogMaterial>) {
  return [...path.items]
    .sort((left, right) => left.position - right.position)
    .map((item) => {
      const materialId = item.materialId ?? item.material?.id ?? "";
      return {
        id: materialId,
        title: materials.get(materialId)?.title ?? item.material?.title ?? "Training material",
      };
    });
}

// This page coordinates the learner's saved collections and path editor.
// eslint-disable-next-line complexity, max-lines-per-function, sonarjs/cognitive-complexity
export default function MyLearningView() {
  const { account, loading: sessionLoading, sessionError, bookmarkedIds } = useSession();
  const [tab, setTab] = useState<Tab>("bookmarks");
  const [bookmarks, setBookmarks] = useState<CatalogMaterial[]>([]);
  const [paths, setPaths] = useState<PersonalLearningPath[]>([]);
  const [materialMap, setMaterialMap] = useState<Map<string, CatalogMaterial>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingPath, setEditingPath] = useState<PersonalLearningPath | null>(null);
  const [creatingPath, setCreatingPath] = useState(false);

  const refreshData = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError("");
    try {
      const [saved, personalPaths] = await Promise.all([getBookmarks(), getPersonalPaths()]);
      const ids = new Set<string>(saved.map((bookmark) => bookmark.materialId));
      personalPaths.forEach((path) => {
        path.items.forEach((item) => {
          const id = item.materialId ?? item.material?.id;
          if (id) ids.add(id);
        });
      });
      const results = await Promise.allSettled([...ids].map((id) => getMaterialForLearner(id)));
      const nextMap = new Map<string, CatalogMaterial>();
      results.forEach((result) => {
        if (result.status === "fulfilled") nextMap.set(result.value.id, result.value);
      });
      setMaterialMap(nextMap);
      setBookmarks(saved.map((bookmark) => nextMap.get(bookmark.materialId)).filter((item): item is CatalogMaterial => Boolean(item)));
      setPaths(personalPaths);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "My Learning could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (sessionLoading) return;
    if (account) void refreshData();
    else {
      setBookmarks([]);
      setPaths([]);
      setMaterialMap(new Map());
    }
  }, [account, sessionLoading, refreshData]);

  useEffect(() => {
    setBookmarks((current) => current.filter((material) => bookmarkedIds.has(material.id)));
  }, [bookmarkedIds]);

  async function handleDeletePath(path: PersonalLearningPath) {
    if (!window.confirm(`Delete “${path.title}”? This will remove the path and its ordered items.`)) return;
    setError("");
    try {
      await deletePersonalPath(path.id);
      await refreshData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The path could not be deleted.");
    }
  }

  if (sessionLoading) {
    return <div className="my-learning-state" role="status">Checking your account…</div>;
  }

  if (sessionError) {
    return <div className="my-learning-error my-learning-state" role="alert">Your account status is unavailable. Please refresh and try again. {sessionError}</div>;
  }

  if (!account) {
    return (
      <>
        <section className="page-hero">
          <div className="page-hero__shell">
            <span className="eyebrow">Your learner workspace</span>
            <h1>My Learning</h1>
            <p>Sign in to return to saved materials and personal learning paths.</p>
          </div>
        </section>
        <section className="section">
          <div className="section-shell my-learning-signin">
            <div><h2>Your training stays public</h2><p>A free account adds bookmarks and personal paths when you want them.</p></div>
            <div className="account-panel__actions">
              <Link className="button button--gold" href={`/account?next=${encodeURIComponent("/my-learning")}`}>Sign in</Link>
              <Link className="button button--secondary" href={`/account?mode=create&next=${encodeURIComponent("/my-learning")}`}>Create account</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  let bookmarkContent = null;
  if (!loading && tab === "bookmarks") {
    if (bookmarks.length > 0) {
      bookmarkContent = <div className="catalog-results">{bookmarks.map((material) => <MaterialCard key={material.id} material={material} />)}</div>;
    } else {
      bookmarkContent = (
        <div className="empty-state my-learning-empty">
          <span className="eyebrow">A place to pick up later</span>
          <h2>Your bookmarks will appear here</h2>
          <p>Save a training material from its card or detail page to keep it close.</p>
          <Link className="button button--gold" href="/materials">Explore the Training Library</Link>
        </div>
      );
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__shell my-learning-hero">
          <div>
            <span className="eyebrow">Your learner workspace</span>
            <h1>My Learning</h1>
            <p>Welcome back, {account.username}. Return to bookmarked training and organize your next steps.</p>
          </div>
          <Link className="button button--gold" href="/materials">Find more training</Link>
        </div>
      </section>
      <section className="section">
        <div className="section-shell">
          <div className="my-learning-tabs" role="tablist" aria-label="My Learning sections">
            <button id="bookmarks-tab" role="tab" aria-selected={tab === "bookmarks"} aria-controls="my-learning-panel" type="button" onClick={() => { setTab("bookmarks"); setCreatingPath(false); setEditingPath(null); }}>Bookmarks <span>{bookmarkedIds.size}</span></button>
            <button id="paths-tab" role="tab" aria-selected={tab === "paths"} aria-controls="my-learning-panel" type="button" onClick={() => { setTab("paths"); setCreatingPath(false); setEditingPath(null); }}>My paths <span>{paths.length}</span></button>
          </div>
          <div id="my-learning-panel" role="tabpanel" aria-labelledby={tab === "bookmarks" ? "bookmarks-tab" : "paths-tab"}>
          <div className="my-learning-toolbar">
            <p>{tab === "bookmarks" ? "Your saved training materials, ready when you are." : "Arrange bookmarked materials into a learning sequence that works for you."}</p>
            {tab === "paths" && !creatingPath && !editingPath ? <button className="button button--gold" type="button" onClick={() => { setCreatingPath(true); }}>Create a path</button> : null}
          </div>
          {error ? <div className="my-learning-error" role="alert">{error}</div> : null}
          {loading ? <div className="my-learning-state" role="status">Loading your learning…</div> : null}
          {bookmarkContent}
          {!loading && tab === "paths" ? (
            <div className="personal-paths">
              {creatingPath ? <PersonalPathEditor materials={bookmarks} onSaved={refreshData} onCancel={() => { setCreatingPath(false); }} /> : null}
              {editingPath ? <PersonalPathEditor path={editingPath} materials={bookmarks} onSaved={refreshData} onCancel={() => { setEditingPath(null); }} /> : null}
              {!creatingPath && !editingPath && paths.length === 0 ? (
                <div className="empty-state my-learning-empty">
                  <span className="eyebrow">Your own sequence</span>
                  <h2>No personal paths yet</h2>
                  <p>Save a few materials, then put them in the order you want to learn.</p>
                  <Link className="button button--gold" href="/materials">Browse training</Link>
                </div>
              ) : null}
              {!creatingPath && !editingPath ? paths.map((path) => (
                <article className="personal-path-card" key={path.id}>
                  <div className="personal-path-card__heading">
                    <div><span className="eyebrow">{path.items.length} {path.items.length === 1 ? "step" : "steps"}</span><h2>{path.title}</h2></div>
                    <div className="personal-path-card__actions">
                      <button className="button button--secondary" type="button" onClick={() => { setEditingPath(path); }}>Edit path</button>
                      <button className="account-text-button account-text-button--danger" type="button" onClick={() => { void handleDeletePath(path); }}>Delete</button>
                    </div>
                  </div>
                  {path.description ? <p>{path.description}</p> : null}
                  {path.items.length ? (
                    <ol className="personal-path-steps">
                      {getPathItems(path, materialMap).map((item, index) => (
                        <li key={`${path.id}-${item.id}`}><span aria-hidden="true">{index + 1}</span><Link href={item.id ? `/materials/${encodeURIComponent(item.id)}` : "/materials"}>{item.title}</Link></li>
                      ))}
                    </ol>
                  ) : <p className="form-hint">This path is empty. Edit it to add bookmarked materials.</p>}
                </article>
              )) : null}
            </div>
          ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
