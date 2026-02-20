import { getApiBase } from "@/lib/get-api-base";
import {
  renderSitemapIndexXml,
  resolveAppBaseUrl,
  resolveSitemapTenantSlugs,
} from "@/lib/seo/sitemap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const baseUrl = resolveAppBaseUrl();
  const apiBase = getApiBase();
  const lastmod = new Date().toISOString();
  const tenantSlugs = await resolveSitemapTenantSlugs(apiBase);

  const indexEntries = tenantSlugs.map((slug) => ({
    loc: `${baseUrl}/sitemaps/${encodeURIComponent(slug)}.xml`,
    lastmod,
  }));

  const xml = renderSitemapIndexXml(indexEntries);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
