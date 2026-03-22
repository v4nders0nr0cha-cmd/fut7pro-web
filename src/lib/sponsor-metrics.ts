type SponsorMetricType = "click" | "impression";

type SponsorMetricInput = {
  slug: string;
  sponsorId: string;
  type: SponsorMetricType;
  targetUrl?: string | null;
  currentUrl?: string | null;
};

const IMPRESSION_DEDUPE_MS = 5 * 60 * 1000;
const CLICK_DEDUPE_MS = 1500;
const metricCache = new Map<string, number>();

function normalizeUrl(url?: string | null) {
  if (!url) return "";
  return url.split("#")[0].trim();
}

function metricKey({ slug, sponsorId, type, targetUrl, currentUrl }: SponsorMetricInput): string {
  return [
    type,
    slug.trim().toLowerCase(),
    sponsorId.trim().toLowerCase(),
    normalizeUrl(targetUrl),
    normalizeUrl(currentUrl),
  ].join("|");
}

function shouldSkipMetric(key: string, type: SponsorMetricType) {
  const now = Date.now();
  const ttl = type === "impression" ? IMPRESSION_DEDUPE_MS : CLICK_DEDUPE_MS;
  const lastHit = metricCache.get(key);
  if (typeof lastHit === "number" && now - lastHit < ttl) {
    return true;
  }
  metricCache.set(key, now);
  return false;
}

export async function recordSponsorMetric({
  slug,
  sponsorId,
  type,
  targetUrl,
  currentUrl,
}: SponsorMetricInput) {
  if (!slug || !sponsorId) return;
  const key = metricKey({ slug, sponsorId, type, targetUrl, currentUrl });
  if (shouldSkipMetric(key, type)) return;

  try {
    await fetch(`/api/public/${slug}/sponsors/${sponsorId}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        targetUrl: targetUrl ?? undefined,
        currentUrl: currentUrl ?? undefined,
      }),
      keepalive: true,
    });
  } catch {
    // Intencional: metricas nao devem bloquear a UX
  }
}
