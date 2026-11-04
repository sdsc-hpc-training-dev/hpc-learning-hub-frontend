import { NextRequest, NextResponse } from "next/server";

const allowedFields = new Set([
  "rating",
  "foundWhatNeeded",
  "workedWell",
  "improvements",
]);
const MAX_BODY_BYTES = 8192;

function response(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readBoundedBody(request: NextRequest): Promise<string | null> {
  const stream = request.body as ReadableStream<Uint8Array>;
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let complete = false;
  while (!complete) {
    const { done, value } = await reader.read();
    complete = done;
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

// The relay rejects malformed requests before its intentionally constrained proxy call.
// eslint-disable-next-line complexity
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    const rawBody = await readBoundedBody(request);
    if (rawBody === null) return response({ message: "Feedback request is too large." }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return response({ message: "Invalid feedback request." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !allowedFields.has(key))) {
    return response({ message: "Invalid feedback request." }, 400);
  }
  const payload = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.has(key)));
  const gatewayUrl = process.env.GATEWAY_URL;
  if (!gatewayUrl) return response({ message: "Feedback is temporarily unavailable." }, 503);
  try {
    const gatewayResponse = await fetch(`${gatewayUrl.replace(/\/$/, "")}/api/v1/feedback`, {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (gatewayResponse.status === 201) return response({ accepted: true }, 201);
    return response({ message: "Feedback could not be accepted." }, gatewayResponse.status >= 400 && gatewayResponse.status < 600 ? gatewayResponse.status : 502);
  } catch {
    return response({ message: "Feedback is temporarily unavailable." }, 503);
  }
}
