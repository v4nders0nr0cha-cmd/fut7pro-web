export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";
const TAG_PREFIX = "teams";

function resolveBackendBase() {
  const candidate =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return candidate.replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  }

  const tenantId = searchParams.get("tenantId");

  const params = new URLSearchParams();
  if (tenantId) params.set("tenantId", tenantId);

  const backendUrl = `${resolveBackendBase()}/public/${encodeURIComponent(
    slug,
  )}/teams${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const response = await fetch(backendUrl, {
      headers: { "content-type": "application/json" },
      next: {
        revalidate: 600,
        tags: [`${TAG_PREFIX}:${slug}`],
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message =
        (payload && typeof payload.error === "string" && payload.error) ||
        `backend_error_${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        slug,
        results: [],
        fallback: true,
        error: error instanceof Error ? error.message : "unexpected_error",
      },
      { status: 200 },
    );
  }
}
