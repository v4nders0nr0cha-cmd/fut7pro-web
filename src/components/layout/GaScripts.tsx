"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

type Props = {
  gaId?: string;
};

export function GaScripts({ gaId }: Props) {
  const pathname = usePathname();

  if (!gaId) return null;

  // Evita coletar dados em áreas autenticadas do painel
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/superadmin")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
