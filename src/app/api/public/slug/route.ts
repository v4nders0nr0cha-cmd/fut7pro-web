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
    return Response.json({ available: false, reason: "invalid" });
  }

  if (!SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
    return Response.json({ available: false, reason: "invalid" });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(
      `${baseUrl}/public/slug-disponibilidade?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store", signal: controller.signal }
    );
    if (res.status === 429) {
      return Response.json({ available: null, reason: "rate_limited" });
    }
    if (!res.ok) {
      return Response.json({ available: null, reason: "temporary_error" });
    }
    const data = await res.json().catch(() => null);
    if (!data || typeof data.available !== "boolean") {
      return Response.json({ available: null, reason: "temporary_error" });
    }
    return Response.json({ available: data.available });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json({ available: null, reason: "temporary_error" });
    }
    return Response.json({ available: null, reason: "temporary_error" });
  } finally {
    clearTimeout(timeout);
  }
}
