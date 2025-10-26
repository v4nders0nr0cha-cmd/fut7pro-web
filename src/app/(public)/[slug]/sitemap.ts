import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function sitemap({ params }: { params: { slug: string } }): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const { slug } = params;
  const root = `${base}/${slug}`;
  const lastModified = new Date();

  return [
    { url: root, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${root}/partidas`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${root}/estatisticas`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${root}/atletas`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${root}/patrocinadores`, lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];
}

