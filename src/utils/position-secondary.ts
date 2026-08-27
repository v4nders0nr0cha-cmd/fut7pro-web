export type CanonicalPosition = "goleiro" | "zagueiro" | "meia" | "atacante";
export type DisplayPosition = "Goleiro" | "Zagueiro" | "Meia" | "Atacante";

const LINE_CANONICAL: CanonicalPosition[] = ["zagueiro", "meia", "atacante"];
const LINE_DISPLAY: DisplayPosition[] = ["Zagueiro", "Meia", "Atacante"];
const DISPLAY_BY_CANONICAL: Record<CanonicalPosition, DisplayPosition> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

function normalizeCanonicalPosition(posicao?: string | null): CanonicalPosition | "" {
  const normalized = String(posicao ?? "")
    .toLowerCase()
    .trim();
  if (normalized === "gol" || normalized === "goleiro") return "goleiro";
  if (normalized === "zag" || normalized === "zagueiro") return "zagueiro";
  if (normalized === "mei" || normalized === "meia") return "meia";
  if (normalized === "ata" || normalized === "atacante") return "atacante";
  return "";
}

function normalizeDisplayPosition(posicao?: string | null): DisplayPosition | "" {
  const canonical = normalizeCanonicalPosition(posicao);
  return canonical ? DISPLAY_BY_CANONICAL[canonical] : "";
}

export function isGoalkeeperPosition(posicao?: string | null) {
  return normalizeCanonicalPosition(posicao) === "goleiro";
}

export function isLinePosition(posicao?: string | null) {
  const normalized = normalizeCanonicalPosition(posicao);
  return normalized === "zagueiro" || normalized === "meia" || normalized === "atacante";
}

export function getValidSecondaryCanonicalOptions(posicao?: string | null) {
  const normalized = normalizeCanonicalPosition(posicao);
  if (!isLinePosition(normalized)) return [];
  return LINE_CANONICAL.filter((item) => item !== normalized);
}

export function getValidSecondaryDisplayOptions(posicao?: string | null) {
  if (!posicao || isGoalkeeperPosition(posicao)) return [];
  const normalized = normalizeDisplayPosition(posicao);
  return normalized ? LINE_DISPLAY.filter((item) => item !== normalized) : [];
}

export function normalizeSecondaryCanonical(posicao?: string | null, secundaria?: string | null) {
  const normalized = normalizeCanonicalPosition(secundaria);
  return getValidSecondaryCanonicalOptions(posicao).includes(normalized as CanonicalPosition)
    ? (normalized as CanonicalPosition)
    : "";
}

export function isSecondaryRequired(posicao?: string | null) {
  return isLinePosition(posicao);
}
