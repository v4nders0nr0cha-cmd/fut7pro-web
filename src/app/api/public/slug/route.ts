import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

const SLUG_REGEX = /^[a-z0-9-]{3,30}$/;
const RESERVED_SLUGS = new Set([
  "admin",
  "superadmin",
  "superadmin-auth",
  "api",
  "auth",
  "login",
  "cadastrar-racha",
  "public",
  "images",
  "img",
  "static",
  "assets",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "_next",
  "health",
  "revalidate",
  "app",
  "www",
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const value = req.nextUrl.searchParams.get("value") || "";
  const slug = value.trim().toLowerCase();

  if (!slug) {
    return Response.json({ available: false });
  }

  if (!SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
    return Response.json({ available: false });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");

  try {
    const res = await fetch(
      `${baseUrl}/public/slug-disponibilidade?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return Response.json({ available: false });
    }
    const data = await res.json().catch(() => null);
    if (!data || typeof data.available !== "boolean") {
      return Response.json({ available: false });
    }
    return Response.json({ available: data.available });
  } catch {
    return Response.json({ available: false });
  }
}
