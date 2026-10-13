"use client";

export class BrowserGatewayError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BrowserGatewayError";
    this.status = status;
  }
}

function getUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
  if (!baseUrl) {
    throw new BrowserGatewayError(
      "The learning service is not configured. Please try again later.",
      500,
    );
  }
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const apiPath = endpoint.startsWith("/api/v1/")
    ? endpoint
    : `/api/v1${endpoint}`;
  return `${baseUrl.replace(/\/$/, "")}${apiPath}`;
}

function messageFromBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const record = body as { message?: unknown; error?: unknown };
  const value = record.message ?? record.error;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").join(" ");
  return null;
}

// eslint-disable-next-line complexity
export async function gatewayBrowserFetch<T = void>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(getUrl(path), {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new BrowserGatewayError(
      "We could not connect to the learning service. Check your connection and try again.",
      0,
    );
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text;
    try {
      message = messageFromBody(JSON.parse(text)) ?? text;
    } catch {
      // Keep a plain-text response when the Gateway does not return JSON.
    }
    throw new BrowserGatewayError(
      message || "The request could not be completed. Please try again.",
      response.status,
    );
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
