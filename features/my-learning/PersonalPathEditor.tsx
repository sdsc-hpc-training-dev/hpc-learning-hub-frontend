"use client";
import { useState, type SubmitEvent } from "react";
import { savePath, type Bookmark, type PersonalPath } from "./api";

// eslint-disable-next-line complexity, max-lines-per-function
export default function PersonalPathEditor({
  path,
  bookmarks,
  titles = {},
  onSaved,
  onCancel,
}: Readonly<{
  path?: PersonalPath;
  bookmarks: Bookmark[];
  titles?: Record<string, string>;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}>) {
  const [title, setTitle] = useState(path?.title ?? "");
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
  const titleMap = new Map(Object.entries(titles).filter(([, title]) => title));
  const unavailable = ids.some(
    (id) => !bookmarks.some((item) => item.materialId === id),
  );
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
          required
          maxLength={200}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
      </label>
      <label>
        Description{" "}
        <textarea
          maxLength={5000}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
        />
      </label>
      <fieldset>
        <legend>Materials in this path</legend>
        <ol>
          {ids.map((id, index) => (
            <li key={id}>
              {titleMap.get(id) ??
                path?.items.find(
                  (item) => (item.materialId ?? item.material?.id) === id,
                )?.material?.title ??
                `Material ${id}`}{" "}
              <button
                type="button"
                aria-label={`Move material ${id} up`}
                disabled={index === 0}
                onClick={() => {
                  move(index, -1);
                }}
              >
                Up
              </button>{" "}
              <button
                type="button"
                aria-label={`Move material ${id} down`}
                disabled={index === ids.length - 1}
                onClick={() => {
                  move(index, 1);
                }}
              >
                Down
              </button>{" "}
              <button
                type="button"
                aria-label={`Remove material ${id}`}
                onClick={() => {
                  setItemsChanged(true);
                  setIds(ids.filter((value) => value !== id));
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
        {bookmarks
          .filter((item) => !ids.includes(item.materialId))
          .map((item) => (
            <label key={item.materialId}>
              <input
                type="checkbox"
                checked={false}
                onChange={() => {
                  setItemsChanged(true);
                  setIds([...ids, item.materialId]);
                }}
              />{" "}
              {titleMap.get(item.materialId) ?? `Material ${item.materialId}`}
            </label>
          ))}
      </fieldset>
      {unavailable && itemsChanged ? (
        <p>
          Remove materials that are no longer bookmarked before changing the
          order.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !title.trim() || (itemsChanged && unavailable)}
      >
        Save path
      </button>{" "}
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
