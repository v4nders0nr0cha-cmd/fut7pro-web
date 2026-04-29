"use client";

import Script from "next/script";
import { FUT7PRO_SOCIAL_SAME_AS } from "@/config/fut7pro-socials";

type Props = {
  siteName: string;
  siteUrl: string; // ex: "https://app.fut7pro.com.br"
  logoUrl?: string; // ex: "/logo.svg" (opcional)
  searchUrl?: string; // ex: "https://app.fut7pro.com.br/search?q={search_term_string}" (se houver busca pública)
};

export default function JsonLd({ siteName, siteUrl, logoUrl, searchUrl }: Props) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    ...(logoUrl ? { logo: new URL(logoUrl, siteUrl).toString() } : {}),
    sameAs: FUT7PRO_SOCIAL_SAME_AS,
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    ...(searchUrl
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: `${searchUrl}`,
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };

  return (
    <>
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
    </>
  );
}
