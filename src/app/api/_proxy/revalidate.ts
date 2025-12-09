const REVALIDATE_TOKEN = process.env.PUBLIC_REVALIDATE_TOKEN || "";

function getBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;

  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl.replace(/\/$/, "") : `https://${envUrl}`;
  }

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

export function buildTorneioPaths(slug?: string | null, torneioSlug?: string | null) {
  if (!slug) return [];
  const base = `/${slug}/grandes-torneios`;
  const paths = [base];
  if (torneioSlug) {
    paths.push(`${base}/${torneioSlug}`);
  }
  return paths;
}

export function buildSorteioPaths(slug?: string | null) {
  if (!slug) return [];
  return [`/${slug}/partidas`, `/${slug}/partidas/times-do-dia`];
}

export async function triggerPublicRevalidate(slug?: string | null, paths: string[] = []) {
  if (!slug) return;

  const target = `${getBaseUrl()}/api/revalidate/public`;
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": REVALIDATE_TOKEN,
      },
      body: JSON.stringify({ slug, paths }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Revalidate publico falhou", { status: res.status, body, target, slug, paths });
    }
  } catch (error) {
    console.error("Falha ao disparar revalidate publico", error);
  }
}
