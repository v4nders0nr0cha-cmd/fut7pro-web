import type { MetadataRoute } from "next";

export default function robots({ params }: { params: { slug: string } }): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const { slug } = params;
  const host = `${base}/${slug}`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/superadmin", "/api"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
  };
}

