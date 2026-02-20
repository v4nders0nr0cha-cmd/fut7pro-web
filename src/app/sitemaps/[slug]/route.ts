import { getApiBase } from "@/lib/get-api-base";
import {
  isValidTenantSlug,
  renderSitemapUrlSetXml,
  resolveAppBaseUrl,
  resolveTenantSitemapEntries,
} from "@/lib/seo/sitemap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, context: RouteContext) {
  const slug = isValidTenantSlug(context.params.slug);

  if (!slug) {
    return new Response("Sitemap de tenant invalido.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const baseUrl = resolveAppBaseUrl();
  const apiBase = getApiBase();
  const entries = await resolveTenantSitemapEntries(baseUrl, apiBase, slug);
  const xml = renderSitemapUrlSetXml(entries);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
