import { createHash } from "node:crypto";

/** @param {string} route */
export function routeReportFilename(route) {
  if (route === "/") return "index.json";

  const pathname = route.split(/[?#]/, 1)[0];
  const prefix = pathname
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .slice(0, 80);
  // Include the full route so filters and similarly sanitized paths stay distinct.
  const hash = createHash("sha256").update(route).digest("hex").slice(0, 16);
  return `${prefix.length ? prefix : "index"}-${hash}.json`;
}
