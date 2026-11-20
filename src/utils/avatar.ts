export const DEFAULT_ATHLETE_AVATAR = "/images/avatar-placeholder.svg";
export const DEFAULT_ADMIN_AVATAR = DEFAULT_ATHLETE_AVATAR;

function normalizeAvatarUrl(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed) || /[\\\u0000-\u001f]/.test(trimmed))
    return null;
  if (/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("blob:")) return trimmed;
  try {
    const local = trimmed.startsWith("/") && !trimmed.startsWith("//");
    if (!local && !/^https?:\/\//i.test(trimmed)) return null;
    const url = new URL(trimmed, "https://app.fut7pro.com.br");
    if (url.username || url.password) return null;
    const internal = local || ["app.fut7pro.com.br", "api.fut7pro.com.br"].includes(url.hostname);
    // Referências antigas podem continuar nos dados; não representam uma foto enviada.
    if (
      internal &&
      (/^\/images\/jogadores\/jogador_padrao_\d+\.jpg$/i.test(url.pathname) ||
        url.pathname === "/images/avatar_padrao_admin.png")
    )
      return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function getAvatarSrc(
  avatarUrl?: string | null,
  fallback: string = DEFAULT_ATHLETE_AVATAR
): string {
  return normalizeAvatarUrl(avatarUrl) ?? normalizeAvatarUrl(fallback) ?? DEFAULT_ATHLETE_AVATAR;
}
