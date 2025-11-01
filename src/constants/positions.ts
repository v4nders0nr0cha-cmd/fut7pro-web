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

export function positionLabel(value?: PositionValue | null) {
  if (!value) return "";
  return POSITION_LABEL[value] ?? value;
}
