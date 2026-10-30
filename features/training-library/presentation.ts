import type { CatalogResource } from "@/lib/gateway/types";
import { decodeHTMLStrict } from "entities";
import { Parser } from "htmlparser2";

const HTML_TAGS = new Set(
  "a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr svg path".split(
    " ",
  ),
);
const HIDDEN_TAGS = new Set(["script", "style", "template", "noscript"]);
const SEPARATOR_TAGS = new Set(
  "a article aside blockquote br dd div dl dt figcaption figure footer h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table td th tr ul".split(
    " ",
  ),
);

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

function decodeHtmlEntities(value: string) {
  let decoded = value;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decodeHTMLStrict(decoded);
    if (next === decoded) return decoded;
    decoded = next;
  }
  return decoded;
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

function removeCreativeCommonsLicenseBadges(value: string) {
  return value.replace(
    /<a\b[^<]{0,1000}creativecommons\.org\/licenses\/[\s\S]{0,1000}?<\/a\s*>?/gi,
    " ",
  );
}

function stripHtml(value: string) {
  // Older snapshots removed '>' before HTML cleanup, breaking empty README anchors.
  const repaired = value
    .replace(/<a\s+(?:name|id)\s*=\s*(?:"[^"]*"|'[^']*')\s*(?=<\/a\b)/gi, " ")
    .replace(/<\/a(?=\s|$)(?!\s*>)/gi, " ")
    .replace(/<((?:https?:\/\/)[^>]+)>/g, "$1");
  const text: string[] = [];
  let hiddenDepth = 0;
  const parser = new Parser({
    onopentag(name, attributes) {
      if (hiddenDepth || HIDDEN_TAGS.has(name)) {
        hiddenDepth += 1;
      } else if (!HTML_TAGS.has(name) && Object.keys(attributes).length === 0) {
        text.push(repaired.slice(parser.startIndex, parser.endIndex + 1));
      } else if (SEPARATOR_TAGS.has(name)) {
        text.push(" ");
      }
    },
    ontext(value) {
      if (!hiddenDepth) text.push(value);
    },
    onclosetag(name, implied) {
      if (hiddenDepth) hiddenDepth -= 1;
      else if (!HTML_TAGS.has(name) && !implied) {
        text.push(repaired.slice(parser.startIndex, parser.endIndex + 1));
      } else if (SEPARATOR_TAGS.has(name)) text.push(" ");
    },
  });
  parser.end(repaired);
  return text.join("");
}

export function catalogPlainText(value: string | null | undefined) {
  if (!value) return "";

  const plain = stripHtml(
    removeCreativeCommonsLicenseBadges(decodeHtmlEntities(value)),
  );
  const withoutImages = replaceMarkdownTokens(plain, "![", false);
  const withoutLinks = replaceMarkdownTokens(withoutImages, "[", true);

  return withoutLinks
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/(^|\s)(?:[-+*]|\d+[.)])\s+/g, "$1")
    .replace(/[`*~|]+/g, " ")
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
