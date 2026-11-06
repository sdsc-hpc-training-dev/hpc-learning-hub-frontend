"use client";

export class RequestError extends Error {
  constructor(public status: number) {
    super("The request could not be completed. Please try again.");
  }
}

export async function request<T = void>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new RequestError(0);
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/me")
      window.dispatchEvent(new Event("learner-session-expired"));
    throw new RequestError(response.status);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
