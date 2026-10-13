"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import type { CatalogMaterial } from "@/lib/gateway/types";
import {
  createPersonalPath,
  updatePersonalPath,
  type PersonalLearningPath,
} from "./api";

function pathMaterialIds(path: PersonalLearningPath) {
  return [...path.items]
    .sort((left, right) => left.position - right.position)
    .map((item) => item.materialId ?? item.material?.id ?? "")
    .filter(Boolean);
}

// The editor owns form state, ordered item selection and save lifecycle.
// eslint-disable-next-line complexity, max-lines-per-function
export default function PersonalPathEditor({
  materials,
  path,
  onSaved,
  onCancel,
}: Readonly<{
  materials: CatalogMaterial[];
  path?: PersonalLearningPath;
  onSaved: () => Promise<void>;
  onCancel?: () => void;
}>) {
  const [title, setTitle] = useState(path?.title ?? "");
  const [description, setDescription] = useState(path?.description ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(path ? pathMaterialIds(path) : []);
  const [itemsChanged, setItemsChanged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(path?.title ?? "");
    setDescription(path?.description ?? "");
    setSelectedIds(path ? pathMaterialIds(path) : []);
    setItemsChanged(false);
    setError("");
  }, [path]);

  function toggleMaterial(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((itemId) => itemId !== id);
      return [...current, id];
    });
    setItemsChanged(true);
  }

  function moveItem(index: number, direction: -1 | 1) {
    setSelectedIds((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      // eslint-disable-next-line security/detect-object-injection
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setItemsChanged(true);
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const itemPayload = selectedIds.map((materialId, position) => ({ materialId, position }));
      if (path) {
        const input: { title?: string; description?: string | null; items?: typeof itemPayload } = {
          title: title.trim(),
          description: description.trim() || null,
        };
        if (itemsChanged) input.items = itemPayload;
        await updatePersonalPath(path.id, input);
      } else {
        await createPersonalPath({
          title: title.trim(),
          description: description.trim() || undefined,
          items: itemPayload,
        });
      }
      await onSaved();
      onCancel?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your learning path could not be saved.");
    } finally {
      setPending(false);
    }
  }

  const selectedMaterials = selectedIds.map((id) => ({
    id,
    material: materials.find((candidate) => candidate.id === id),
  }));
  const unavailableItems = selectedIds.filter((id) => !materials.some((material) => material.id === id));

  return (
    <form className="path-editor" onSubmit={(event) => { void submit(event); }}>
      <div className="path-editor__heading">
        <div>
          <span className="eyebrow">{path ? "Edit your path" : "Build a sequence"}</span>
          <h2>{path ? "Update learning path" : "Create a personal learning path"}</h2>
        </div>
        {onCancel ? <button className="account-text-button" type="button" onClick={onCancel}>Cancel</button> : null}
      </div>
      {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
      <label htmlFor={`path-title-${path?.id ?? "new"}`}>Path title</label>
      <input id={`path-title-${path?.id ?? "new"}`} value={title} onChange={(event) => { setTitle(event.target.value); }} maxLength={200} required />
      <label htmlFor={`path-description-${path?.id ?? "new"}`}>Description <span>(optional)</span></label>
      <textarea id={`path-description-${path?.id ?? "new"}`} value={description} onChange={(event) => { setDescription(event.target.value); }} maxLength={5000} rows={3} />

      <fieldset className="path-editor__materials">
        <legend>Choose bookmarked materials and arrange the order</legend>
        {materials.length ? (
          <ol className="path-order-list">
            {selectedMaterials.map(({ id, material }, index) => {
              return (
                <li key={id}>
                  <label><input type="checkbox" checked onChange={() => { toggleMaterial(id); }} /> <span>{material?.title ?? path?.items.find((item) => (item.materialId ?? item.material?.id) === id)?.material?.title ?? "Saved material"}</span></label>
                  <div>
                    <button type="button" aria-label={`Move item ${String(index + 1)} up`} disabled={index === 0} onClick={() => { moveItem(index, -1); }}>↑</button>
                    <button type="button" aria-label={`Move item ${String(index + 1)} down`} disabled={index === selectedIds.length - 1} onClick={() => { moveItem(index, 1); }}>↓</button>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : <p className="form-hint">Save materials from the Training Library before adding them to a path.</p>}
        <div className="path-editor__available">
          {materials.filter((material) => !selectedIds.includes(material.id)).map((material) => (
            <label key={material.id}><input type="checkbox" checked={false} onChange={() => { toggleMaterial(material.id); }} /> {material.title}</label>
          ))}
        </div>
        {unavailableItems.length ? (
          <p className="form-hint">Some existing path items are no longer bookmarked. Remove those items before changing the ordered list; you can still update the title and description.</p>
        ) : null}
      </fieldset>
      <div className="path-editor__actions">
        <button className="button button--gold" type="submit" disabled={pending || (Boolean(path) && itemsChanged && unavailableItems.length > 0)}>{path ? "Save changes" : "Create path"}</button>
      </div>
    </form>
  );
}
