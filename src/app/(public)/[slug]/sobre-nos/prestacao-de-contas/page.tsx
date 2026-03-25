import Page from "@/app/(public)/sobre-nos/prestacao-de-contas/page";
import { notFound } from "next/navigation";
import { getApiBase } from "@/lib/get-api-base";

type PublicFinanceProbe = {
  code?: string;
  publicState?: string;
};

async function shouldReturnNotFound(slug: string): Promise<boolean> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return true;

  const base = getApiBase().replace(/\/+$/, "");
  const url = `${base}/public/${encodeURIComponent(normalized)}/financeiro`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "x-tenant-slug": normalized },
    });

    if (response.status === 404) {
      return true;
    }

    const payload = (await response.json().catch(() => null)) as PublicFinanceProbe | null;
    const code = String(payload?.code || "")
      .trim()
      .toUpperCase();
    const publicState = String(payload?.publicState || "")
      .trim()
      .toUpperCase();

    return code === "RACHA_NOT_FOUND" || publicState === "SLUG_NOT_FOUND";
  } catch {
    return false;
  }
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  if (await shouldReturnNotFound(params.slug)) {
    notFound();
  }

  return <Page />;
}
