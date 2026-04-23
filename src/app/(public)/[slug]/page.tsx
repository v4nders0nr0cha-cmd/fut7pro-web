import Home from "../page";
import { getApiBase } from "@/lib/get-api-base";
import type { PublicDestaquesDoDiaResponse } from "@/types/destaques";
import type { PublicMatchesResponse } from "@/types/partida";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchPublicJson<T>(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return undefined;
    }
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

export default async function RachaPublicPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug?.trim().toLowerCase() || "";
  const base = getApiBase().replace(/\/+$/, "");

  const [initialMatchesData, initialDestaqueData] = await Promise.all([
    slug
      ? fetchPublicJson<PublicMatchesResponse>(
          `${base}/public/${encodeURIComponent(slug)}/matches?scope=recent&limit=20`
        )
      : undefined,
    slug
      ? fetchPublicJson<PublicDestaquesDoDiaResponse>(
          `${base}/public/${encodeURIComponent(slug)}/destaques-do-dia`
        )
      : undefined,
  ]);

  return (
    <Home
      initialSlug={slug}
      initialMatchesData={initialMatchesData}
      initialDestaqueData={initialDestaqueData}
    />
  );
}
