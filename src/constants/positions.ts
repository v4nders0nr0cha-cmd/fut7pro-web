export type PositionValue = "goleiro" | "zagueiro" | "meia" | "atacante";

export const POSITION_OPTIONS: Array<{ value: PositionValue; label: string }> = [
  { value: "goleiro", label: "Goleiro" },
  { value: "zagueiro", label: "Zagueiro" },
  { value: "meia", label: "Meia" },
  { value: "atacante", label: "Atacante" },
];

export const POSITION_LABEL: Record<PositionValue, string> = POSITION_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<PositionValue, string>
);

export function normalizePositionValue(value?: string | null): PositionValue | null {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase();

  if (cleaned.startsWith("gol")) return "goleiro";
  if (cleaned.startsWith("zag") || cleaned.startsWith("def")) return "zagueiro";
  if (cleaned.startsWith("mei") || cleaned.startsWith("mid")) return "meia";
  if (cleaned.startsWith("ata") || cleaned.startsWith("ava") || cleaned.startsWith("for"))
    return "atacante";

  return null;
}

export function positionLabel(value?: PositionValue | string | null) {
  const normalized = normalizePositionValue(value ?? null);
  if (!normalized) return "";
  return POSITION_LABEL[normalized] ?? normalized;
}
