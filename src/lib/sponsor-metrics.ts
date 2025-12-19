type SponsorMetricType = "click" | "impression";

type SponsorMetricInput = {
  slug: string;
  sponsorId: string;
  type: SponsorMetricType;
  targetUrl?: string | null;
  currentUrl?: string | null;
};

export async function recordSponsorMetric({
  slug,
  sponsorId,
  type,
  targetUrl,
  currentUrl,
}: SponsorMetricInput) {
  if (!slug || !sponsorId) return;

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
