import type { ReactNode } from "react";
import type { Metadata } from "next";

function normalizeBaseUrl(raw?: string | null) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed.replace(/\/$/, "");
  return `https://${trimmed.replace(/\/$/, "")}`;
}

function resolveBaseUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  ]
    .map(normalizeBaseUrl)
    .filter(Boolean) as string[];

  if (candidates.length > 0) return candidates[0];

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

export async function generateMetadata(): Promise<Metadata> {
  let brand = "Fut7Pro";
  const baseUrl = resolveBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/api/superadmin/config`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      brand = data?.empresa || brand;
    }
  } catch {
    // keep fallback brand
  }

  return {
    title: `Login SuperAdmin | ${brand}`,
    description: `Acesso restrito ao painel global do ${brand}.`,
    robots: "noindex,nofollow",
  };
}

export default function SuperAdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
