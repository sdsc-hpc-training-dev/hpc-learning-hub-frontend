export class GatewayRequestError extends Error {
	constructor(message: string, readonly status?: number) {
		super(message);
		this.name = "GatewayRequestError";
	}
}

function gatewayBaseUrl() {
	return process.env.GATEWAY_URL ?? process.env.NEXT_PUBLIC_GATEWAY_URL ?? "";
}

export async function gatewayFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const baseUrl = gatewayBaseUrl();
	if (!baseUrl) {
		throw new GatewayRequestError("Gateway URL is not configured");
	}

	const headers = new Headers(init?.headers);
	headers.set("Accept", "application/json");
	const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
		...init,
		cache: "no-store",
		headers,
	});

	if (!response.ok) {
		throw new GatewayRequestError(`Gateway request failed with status ${String(response.status)}`, response.status);
	}

	return (await response.json()) as T;
}
