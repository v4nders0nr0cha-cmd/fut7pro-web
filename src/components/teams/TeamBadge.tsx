import Image from "next/image";

export const LEGACY_DEFAULT_TEAM_LOGO = "/images/times/time_padrao_01.png";

export function visibleTeamLogo(logo?: string | null): string | null {
  const value = logo?.trim();
  return value &&
    value !== LEGACY_DEFAULT_TEAM_LOGO &&
    ((value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value))
    ? value
    : null;
}

export function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "T";
  if (parts.length === 1)
    return Array.from(parts[0]).slice(0, 2).join("").toLocaleUpperCase("pt-BR");
  return (Array.from(parts[0])[0] + Array.from(parts[parts.length - 1])[0]).toLocaleUpperCase(
    "pt-BR"
  );
}

type TeamBadgeProps = {
  name: string;
  color?: string | null;
  logo?: string | null;
  size?: number;
  className?: string;
};

export function TeamBadge({ name, color, logo, size = 40, className = "" }: TeamBadgeProps) {
  const image = visibleTeamLogo(logo);
  if (image) {
    return (
      <Image
        src={image}
        alt={`Logo do time ${name}`}
        width={size}
        height={size}
        className={`shrink-0 object-contain ${className}`}
      />
    );
  }
  const safeColor = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#71717a";
  const [red, green, blue] = [1, 3, 5].map((at) => parseInt(safeColor.slice(at, at + 2), 16) / 255);
  const linear = [red, green, blue].map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  const textColor = luminance > 0.179 ? "#111827" : "#ffffff";
  return (
    <span
      role="img"
      aria-label={`Time ${name}, sem logo enviada`}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-zinc-900 font-black leading-none ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: safeColor,
        backgroundColor: safeColor,
        color: textColor,
        fontSize: Math.max(10, Math.round(size * 0.31)),
      }}
    >
      {teamInitials(name)}
    </span>
  );
}
