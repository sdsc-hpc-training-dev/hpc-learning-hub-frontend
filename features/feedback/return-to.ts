const allowedPaths = new Set(["/", "/materials", "/programs", "/events", "/learning-paths", "/about"]);

export function safeReturnTo(value?: string): string {
  // Reject URL parser normalization of control characters and backslashes.
  // eslint-disable-next-line no-control-regex
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/";
  try {
    const url = new URL(value, "https://learning-hub.invalid");
    if (url.origin !== "https://learning-hub.invalid" || !allowedPaths.has(url.pathname) || url.hash) return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}
