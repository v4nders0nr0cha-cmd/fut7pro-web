import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/partidas/historico`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/estatisticas/classificacao-dos-times`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/os-campeoes`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/grandes-torneios`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/atletas`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/sobre-nos`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];

  const slugsEnv = process.env.SITEMAP_SLUGS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const fallbackSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || process.env.TEST_TENANT_SLUG;
  const slugs = slugsEnv.length > 0 ? slugsEnv : fallbackSlug ? [fallbackSlug] : [];

  const tenantEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${APP_URL}/${slug}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticEntries, ...tenantEntries];
}
