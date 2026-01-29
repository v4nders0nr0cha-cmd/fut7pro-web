const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.532659134175!2d-46.63633848502184!3d-23.58802138466644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59bfd39ab0f1%3A0x17727fd74a3f5b1e!2sCampo%20de%20Futebol%20Exemplo!5e0!3m2!1spt-BR!2sbr!4v1618950669409!5m2!1spt-BR!2sbr";

const normalizeQuery = (value: string) => decodeURIComponent(value.replace(/\+/g, " ")).trim();

const extractQueryFromMapsUrl = (value: string) => {
  try {
    const url = new URL(value);
    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q) return normalizeQuery(q);
    const match = url.pathname.match(/\/maps\/place\/([^/]+)/);
    if (match && match[1]) return normalizeQuery(match[1]);
  } catch {
    return null;
  }
  return null;
};

const extractEmbedSrc = (value: string) => {
  const match = value.match(/src="([^"]+)"/i);
  return match ? match[1] : null;
};

const isEmbedUrl = (value: string) =>
  value.includes("/maps/embed") || value.includes("output=embed");

export const buildMapsEmbedUrl = (value: string | undefined, fallbackQuery?: string) => {
  if (value) {
    const trimmed = value.trim();
    if (trimmed.length) {
      const embedFromHtml = trimmed.includes("<iframe") ? extractEmbedSrc(trimmed) : null;
      const candidate = embedFromHtml || trimmed;
      if (candidate && isEmbedUrl(candidate)) return candidate;
      if (candidate) {
        const query = extractQueryFromMapsUrl(candidate);
        if (query) {
          return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        }
        if (!candidate.startsWith("http") && !candidate.startsWith("www.")) {
          return `https://www.google.com/maps?q=${encodeURIComponent(candidate)}&output=embed`;
        }
      }
    }
  }
  if (fallbackQuery && fallbackQuery.trim().length) {
    return `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&output=embed`;
  }
  return DEFAULT_MAP_EMBED;
};
