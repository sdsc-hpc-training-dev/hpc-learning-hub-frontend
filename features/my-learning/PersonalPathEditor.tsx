"use client";
import { useEffect, useId, useRef, useState, type SubmitEvent } from "react";
import type { LearnerRequest } from "@/features/auth/api";
import { savePath, type Bookmark, type PersonalPath } from "./api";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import PathMaterialPicker from "./PathMaterialPicker";

const titleLimit = 200;
const descriptionLimit = 5000;

// eslint-disable-next-line complexity, max-lines-per-function
export default function PersonalPathEditor({
  path,
  bookmarks,
  privateRequest,
  titles = {},
  onSaved,
  onCancel,
}: Readonly<{
  path?: PersonalPath;
  bookmarks: Bookmark[];
  privateRequest: LearnerRequest;
  titles?: Record<string, string>;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}>) {
  const formId = useId();
  const [title, setTitle] = useState(path?.title ?? "");
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    titleInput.current?.focus();
  }, []);
  const [description, setDescription] = useState(path?.description ?? "");
  const [ids, setIds] = useState(() =>
    path
      ? [...path.items]
          .sort((a, b) => a.position - b.position)
          .map((item) => item.materialId ?? item.material?.id ?? "")
          .filter(Boolean)
      : [],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [itemsChanged, setItemsChanged] = useState(false);
  const [pickedTitles, setPickedTitles] = useState<Map<string, string>>(
    () => new Map(),
  );
  const titleMap = new Map([
    ...Object.entries(titles).filter(([, title]) => title),
    ...pickedTitles,
  ]);
  function move(index: number, direction: number) {
    setItemsChanged(true);
    setIds((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) {
        return current;
      }
      // eslint-disable-next-line security/detect-object-injection
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(false);
    try {
      await savePath(
        privateRequest,
        {
          title: title.trim(),
          description: description.trim() || null,
          ...(!path || itemsChanged
            ? {
                items: ids.map((materialId, position) => ({
                  materialId,
                  position,
                })),
              }
            : {}),
        },
        path?.id,
      );
      await onSaved();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      className="account-editor"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <h3>{path ? "Edit path" : "Create path"}</h3>
      {error ? (
        <p role="alert">The path could not be saved. Please try again.</p>
      ) : null}
      <label>
        Title{" "}
        <input
          ref={titleInput}
          required
          maxLength={titleLimit}
          aria-describedby={`${formId}-title-count`}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
      </label>
      <p className="learner-field-count" id={`${formId}-title-count`}>
        {title.length} / {titleLimit} characters
      </p>
      <label>
        Description{" "}
        <textarea
          maxLength={descriptionLimit}
          aria-describedby={`${formId}-description-count`}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
        />
      </label>
      <p className="learner-field-count" id={`${formId}-description-count`}>
        {description.length} / {descriptionLimit.toLocaleString("en-US")}{" "}
        characters
      </p>
      <fieldset>
        <legend>Materials in this path</legend>
        {!ids.length ? <p>No materials added yet.</p> : null}
        <ol className="path-editor-items">
          {ids.map((id, index) => {
            const label =
              titleMap.get(id) ??
              path?.items.find(
                (item) => (item.materialId ?? item.material?.id) === id,
              )?.material?.title ??
              `Material ${id}`;
            return (
              <li key={id}>
                <span>{label}</span>
                <div className="path-editor-tools">
                  <button
                    type="button"
                    aria-label={`Move ${label} up`}
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => {
                      move(index, -1);
                    }}
                  >
                    <ArrowUp aria-hidden="true" size={18} />
                  </button>{" "}
                  <button
                    type="button"
                    aria-label={`Move ${label} down`}
                    title="Move down"
                    disabled={index === ids.length - 1}
                    onClick={() => {
                      move(index, 1);
                    }}
                  >
                    <ArrowDown aria-hidden="true" size={18} />
                  </button>{" "}
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    title="Remove material"
                    onClick={() => {
                      setItemsChanged(true);
                      setIds(ids.filter((value) => value !== id));
                    }}
                  >
                    <X aria-hidden="true" size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </fieldset>
      <PathMaterialPicker
        bookmarks={bookmarks}
        titles={titleMap}
        selected={ids}
        onAdd={({ id, title: materialTitle }) => {
          setItemsChanged(true);
          setPickedTitles((current) => new Map(current).set(id, materialTitle));
          setIds((current) =>
            current.includes(id) ? current : [...current, id],
          );
        }}
      />
      <div className="learner-actions">
        <button
          className="button button--gold"
          type="submit"
          disabled={
            pending || !title.trim() || ((!path || itemsChanged) && !ids.length)
          }
        >
          Save path
        </button>{" "}
        <button
          className="button button--secondary"
          type="button"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
