import { NextRequest, NextResponse } from "next/server";
import { readBoundedBody } from "@/lib/http/read-bounded-body";

const allowedFields = new Set(["title", "description", "pageUrl", "steps"]);

function reply(status: number) {
  return NextResponse.json(
    status === 201 ? { accepted: true } : { message: "Report could not be saved." },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isReport(body: unknown): body is Record<string, unknown> {
  return !!body && typeof body === "object" && !Array.isArray(body) &&
    Object.keys(body).every((key) => allowedFields.has(key));
}

export async function POST(request: NextRequest) {
  // Train routes public writes directly to the rate-limited Gateway.
  if (process.env.BUG_REPORT_LOCAL_RELAY !== "true") return reply(404);
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    return reply(415);
  }
  let body: unknown;
  try {
    const raw = await readBoundedBody(request.body, 8192);
    if (raw === null) return reply(413);
    body = JSON.parse(raw);
  } catch {
    return reply(400);
  }
  if (!isReport(body)) return reply(400);

  const gateway = process.env.GATEWAY_URL;
  if (!gateway) return reply(503);
  try {
    const result = await fetch(new URL("/api/v1/bug-reports", gateway), {
      method: "POST",
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return reply([201, 400, 413, 415, 429].includes(result.status) ? result.status : 503);
  } catch {
    return reply(503);
  }
}
