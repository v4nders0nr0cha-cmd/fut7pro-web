export const DEFAULT_ATHLETE_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
export const DEFAULT_ADMIN_AVATAR = "/images/avatar_padrao_admin.png";

function normalizeAvatarUrl(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getAvatarSrc(
  avatarUrl?: string | null,
  fallback: string = DEFAULT_ATHLETE_AVATAR
): string {
  return normalizeAvatarUrl(avatarUrl) ?? fallback;
}
