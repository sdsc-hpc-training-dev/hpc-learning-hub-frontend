import type { CatalogResource } from "@/lib/gateway/types";

const HTML_ENTITIES = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["nbsp", " "],
  ["quot", '"'],
]);

const RESOURCE_TYPE_LABELS = new Map([
  ["audio", "Audio"],
  ["code", "Code"],
  ["dataset", "Dataset"],
  ["notebook", "Notebook"],
  ["pdf", "PDF"],
  ["recording", "Recording"],
  ["repository", "Source repository"],
  ["repository_session", "Repository materials"],
  ["slides", "Slides"],
  ["transcript", "Transcript"],
  ["video", "Video"],
  ["webpage", "Web resource"],
]);

function decodedCodePoint(value: string, radix: number) {
  const codePoint = Number.parseInt(value, radix);
  return Number.isSafeInteger(codePoint) && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : null;
}

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, token: string) => {
      const normalized = token.toLowerCase();
      if (normalized.startsWith("#x")) {
        return decodedCodePoint(normalized.slice(2), 16) ?? entity;
      }
      if (normalized.startsWith("#")) {
        return decodedCodePoint(normalized.slice(1), 10) ?? entity;
      }
      return HTML_ENTITIES.get(normalized) ?? entity;
    },
  );
}

function replaceMarkdownTokens(
  value: string,
  opening: "[" | "![",
  keepLabel: boolean,
) {
  let cursor = 0;
  let output = "";

  while (cursor < value.length) {
    const start = value.indexOf(opening, cursor);
    if (start < 0) return output + value.slice(cursor);

    const labelStart = start + opening.length;
    const labelEnd = value.indexOf("](", labelStart);
    const targetEnd = labelEnd < 0 ? -1 : value.indexOf(")", labelEnd + 2);
    if (labelEnd < 0 || targetEnd < 0) return output + value.slice(cursor);

    output += value.slice(cursor, start);
    output += keepLabel ? value.slice(labelStart, labelEnd) : " ";
    cursor = targetEnd + 1;
  }

  return output;
}

function removeHtmlBlock(value: string, tag: "script" | "style") {
  const lowerValue = value.toLowerCase();
  const opening = `<${tag}`;
  const closing = `</${tag}>`;
  let cursor = 0;
  let output = "";

  while (cursor < value.length) {
    const start = lowerValue.indexOf(opening, cursor);
    if (start < 0) return output + value.slice(cursor);

    const openingEnd = lowerValue.indexOf(">", start + opening.length);
    const end =
      openingEnd < 0 ? -1 : lowerValue.indexOf(closing, openingEnd + 1);
    if (openingEnd < 0 || end < 0) return output + value.slice(cursor);

    output += `${value.slice(cursor, start)} `;
    cursor = end + closing.length;
  }

  return output;
}

function stripHtml(value: string) {
  const withoutBlocks = removeHtmlBlock(
    removeHtmlBlock(value, "style"),
    "script",
  );
  let cursor = 0;
  let output = "";

  while (cursor < withoutBlocks.length) {
    const start = withoutBlocks.indexOf("<", cursor);
    if (start < 0) return output + withoutBlocks.slice(cursor);

    const end = withoutBlocks.indexOf(">", start + 1);
    if (end < 0) return output + withoutBlocks.slice(cursor);

    const content = withoutBlocks.slice(start + 1, end).trim();
    output += withoutBlocks.slice(cursor, start);
    output +=
      content.startsWith("http://") || content.startsWith("https://")
        ? content
        : " ";
    cursor = end + 1;
  }

  return output;
}

export function catalogPlainText(value: string | null | undefined) {
  if (!value) return "";

  const withoutImages = replaceMarkdownTokens(value, "![", false);
  const withoutLinks = replaceMarkdownTokens(withoutImages, "[", true);

  return stripHtml(decodeHtmlEntities(withoutLinks))
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/(^|\s)(?:[-+*]|\d+[.)])\s+/g, "$1")
    .replace(/[`*_~|>]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function publicResourceTypeLabel(type: string) {
  const normalized = type.trim().toLowerCase();
  if (!normalized || normalized === "catalog_metadata") return null;

  return (
    RESOURCE_TYPE_LABELS.get(normalized) ??
    normalized
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function resourcePresentationLabel(resource: CatalogResource) {
  const title = catalogPlainText(resource.title).toLocaleLowerCase();
  const url = resource.url?.toLocaleLowerCase() ?? "";

  if (
    title.includes("recording") ||
    url.includes("youtube.com/") ||
    url.includes("youtu.be/")
  ) {
    return "Recording";
  }
  if (url.includes("github.com/") || url.includes("gitlab.com/")) {
    return "Source repository";
  }
  return publicResourceTypeLabel(resource.type);
}

export function resourceTypeSummary(resources: CatalogResource[]) {
  const labels: string[] = [];
  const publicResources = resources.filter((resource) => resource.url?.trim());
  const hasRepositorySession = publicResources.some(
    (resource) => resource.type.trim().toLowerCase() === "repository_session",
  );

  if (hasRepositorySession) {
    labels.push("Repository materials");
  }

  for (const resource of publicResources) {
    if (
      hasRepositorySession &&
      ["repository", "repository_session"].includes(
        resource.type.trim().toLowerCase(),
      )
    ) {
      continue;
    }
    const label = resourcePresentationLabel(resource);
    if (label && !labels.includes(label)) labels.push(label);
  }

  return labels.join(" + ") || "Catalog entry";
}
