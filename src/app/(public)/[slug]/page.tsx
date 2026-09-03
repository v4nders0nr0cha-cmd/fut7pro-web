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

function toDateParam(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export default async function RachaPublicPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug?.trim().toLowerCase() || "";
  const base = getApiBase().replace(/\/+$/, "");

  const initialDestaqueData = slug
    ? await fetchPublicJson<PublicDestaquesDoDiaResponse>(
        `${base}/public/${encodeURIComponent(slug)}/destaques-do-dia`
      )
    : undefined;
  const destaqueDate = toDateParam(initialDestaqueData?.destaque?.date);
  const initialMatchesData =
    slug && destaqueDate
      ? await fetchPublicJson<PublicMatchesResponse>(
          `${base}/public/${encodeURIComponent(slug)}/matches?date=${encodeURIComponent(
            destaqueDate
          )}`
        )
      : undefined;

  return (
    <Home
      initialSlug={slug}
      initialMatchesData={initialMatchesData}
      initialDestaqueData={initialDestaqueData}
    />
  );
}
