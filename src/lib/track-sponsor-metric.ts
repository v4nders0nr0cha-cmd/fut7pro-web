type SponsorMetricType = "click" | "impression";

interface TrackSponsorMetricParams {
  slug: string | null | undefined;
  sponsorId: string;
  type: SponsorMetricType;
  targetUrl?: string | null;
  currentUrl?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
}

function extractUtmParams(targetUrl?: string | null) {
  if (!targetUrl) {
    return {};
  }
  try {
    const url = new URL(
      targetUrl,
      typeof window !== "undefined" ? window.location.href : undefined
    );
    return {
      utmSource: url.searchParams.get("utm_source") ?? undefined,
      utmMedium: url.searchParams.get("utm_medium") ?? undefined,
      utmCampaign: url.searchParams.get("utm_campaign") ?? undefined,
      utmTerm: url.searchParams.get("utm_term") ?? undefined,
      utmContent: url.searchParams.get("utm_content") ?? undefined,
    };
  } catch {
    return {};
  }
}

export function trackSponsorMetric({
  slug,
  sponsorId,
  type,
  targetUrl,
  currentUrl,
  source,
  metadata,
}: TrackSponsorMetricParams) {
  if (typeof window === "undefined") {
    return;
  }
  if (!slug) {
    return;
  }

  const baseMetadata: Record<string, unknown> = {
    ...(metadata ?? {}),
  };
  if (source && baseMetadata.source === undefined) {
    baseMetadata.source = source;
  }
  if (baseMetadata.timestamp === undefined) {
    baseMetadata.timestamp = new Date().toISOString();
  }
  if (baseMetadata.path === undefined) {
    baseMetadata.path = window.location.pathname;
  }
  const metadataPayload = Object.keys(baseMetadata).length > 0 ? baseMetadata : undefined;

  const payload = {
    slug,
    sponsorId,
    type,
    targetUrl: targetUrl ?? undefined,
    currentUrl: currentUrl ?? window.location.href,
    referer: document.referrer || undefined,
    metadata: metadataPayload,
    ...extractUtmParams(targetUrl),
  };

  const url = "/api/public/sponsor-metrics";
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    } catch {
      // fallback to fetch
    }
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // ignora erros de tracking
  });
}
