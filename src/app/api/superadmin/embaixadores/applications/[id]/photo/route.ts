import { NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { buildHeaders, requireSuperAdminUser } from "../../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await requireSuperAdminUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const id = String(params.id || "").trim();
  if (!id) return new NextResponse(null, { status: 404 });
  try {
    const upstream = await fetch(
      `${getApiBase()}/superadmin/influencers/applications/${encodeURIComponent(id)}/photo`,
      {
        headers: buildHeaders(user),
        cache: "no-store",
      }
    );
    if (!upstream.ok)
      return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 });
    const type = (upstream.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp"].includes(type))
      return new NextResponse(null, { status: 502 });
    return new NextResponse(upstream.body, {
      headers: { "Content-Type": type, "Cache-Control": "private, no-store" },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
