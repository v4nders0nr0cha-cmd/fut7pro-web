export function bonusFisico(fisico?: number | null) {
  if (fisico === 1) return -0.5;
  if (fisico === 3) return 0.5;
  return 0;
}

export function calcularNivelFinal(habilidade?: number | null, fisico?: number | null) {
  if (typeof habilidade !== "number" || Number.isNaN(habilidade)) return null;
  const bruto = habilidade + bonusFisico(fisico ?? null);
  const clamped = Math.min(5, Math.max(1, bruto));
  return Math.round(clamped * 2) / 2;
}

export function formatNivel(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return value.toFixed(1);
}
