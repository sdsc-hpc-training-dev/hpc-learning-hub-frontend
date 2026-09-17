export class GatewayRequestError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "GatewayRequestError";
    this.status = status;
  }
}

function gatewayBaseUrl() {
  return process.env.GATEWAY_URL ?? process.env.NEXT_PUBLIC_GATEWAY_URL ?? "";
}

export async function gatewayFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = gatewayBaseUrl();
  if (!baseUrl) {
    throw new GatewayRequestError("Gateway URL is not configured");
  }

  const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new GatewayRequestError(errorText || "Gateway request failed", response.status);
  }

  return (await response.json()) as T;
}
