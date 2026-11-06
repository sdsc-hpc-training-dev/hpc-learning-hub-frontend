"use client";

export class RequestError extends Error {
  constructor(public status: number) {
    super("The request could not be completed. Please try again.");
  }
}

export interface Account {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

type PrivatePath = "/auth/logout" | `/me/${string}`;
export type LearnerRequest = <T = void>(
  path: PrivatePath,
  init?: RequestInit,
) => Promise<T>;

const sessionHeader = "X-Learning-Hub-Session";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      headers,
      credentials: "same-origin",
      mode: "same-origin",
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new RequestError(0);
  }
  if (!response.ok) throw new RequestError(response.status);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function getCurrentSession(signal: AbortSignal) {
  const value = await request<Partial<
    Account & { sessionContext: string }
  > | null>("/me", { signal });
  if (
    typeof value?.sessionContext !== "string" ||
    !uuid.test(value.sessionContext) ||
    typeof value.id !== "string" ||
    typeof value.username !== "string" ||
    (value.email !== null && typeof value.email !== "string") ||
    typeof value.role !== "string"
  ) {
    throw new RequestError(502);
  }
  const { id, username, email, role, sessionContext } = value;
  return { account: { id, username, email, role }, sessionContext };
}

export function bindLearnerRequest(
  sessionContext: string,
  signal: AbortSignal,
  invalidate: () => void,
): LearnerRequest {
  const ensureActive = () => {
    if (signal.aborted) throw new RequestError(401);
  };
  return async <T>(path: PrivatePath, init: RequestInit = {}): Promise<T> => {
    ensureActive();
    if (!uuid.test(sessionContext)) throw new RequestError(401);
    const headers = new Headers(init.headers);
    headers.set(sessionHeader, sessionContext);
    try {
      const result = await request<T>(path, { ...init, headers, signal });
      ensureActive();
      return result;
    } catch (error) {
      if (
        !signal.aborted &&
        error instanceof RequestError &&
        (error.status === 401 || error.status === 409)
      ) {
        invalidate();
      }
      throw error;
    }
  };
}
