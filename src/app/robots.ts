import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/admin/login",
          "/superadmin",
          "/superadmin/login",
          "/login",
          "/entrar",
          "/register",
          "/esqueci-senha",
          "/confirmar-email",
          "/aguardando-aprovacao",
          "/*/login",
          "/*/entrar",
          "/*/register",
          "/*/esqueci-senha",
          "/*/confirmar-email",
          "/*/aguardando-aprovacao",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
