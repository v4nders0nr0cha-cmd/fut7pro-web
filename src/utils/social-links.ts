import type { SocialLinksConfig } from "@/types/social-links";

const DEFAULT_SOCIAL_LINKS: Required<SocialLinksConfig> = {
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  websiteUrl: "",
  whatsappGroupUrl: "",
};

const resolveText = (value: unknown, max: number) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.slice(0, max);
};

export function normalizeSocialUrl(raw?: string | null) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const looksLikeUrl =
    trimmed.includes(".") ||
    trimmed.startsWith("wa.me/") ||
    trimmed.startsWith("chat.whatsapp.com/");

  return looksLikeUrl ? `https://${trimmed}` : trimmed;
}

export function resolveSocialLinksConfig(
  raw?: SocialLinksConfig | null
): Required<SocialLinksConfig> {
  const facebookUrl = resolveText(raw?.facebookUrl, 180);
  const instagramUrl = resolveText(raw?.instagramUrl, 180);
  const youtubeUrl = resolveText(raw?.youtubeUrl, 180);
  const websiteUrl = resolveText(raw?.websiteUrl, 180);
  const whatsappGroupUrl = resolveText(raw?.whatsappGroupUrl, 180);

  return {
    facebookUrl: normalizeSocialUrl(facebookUrl) || DEFAULT_SOCIAL_LINKS.facebookUrl,
    instagramUrl: normalizeSocialUrl(instagramUrl) || DEFAULT_SOCIAL_LINKS.instagramUrl,
    youtubeUrl: normalizeSocialUrl(youtubeUrl) || DEFAULT_SOCIAL_LINKS.youtubeUrl,
    websiteUrl: normalizeSocialUrl(websiteUrl) || DEFAULT_SOCIAL_LINKS.websiteUrl,
    whatsappGroupUrl: normalizeSocialUrl(whatsappGroupUrl) || DEFAULT_SOCIAL_LINKS.whatsappGroupUrl,
  };
}
