import type { Patrocinador, PatrocinadorStatus } from "@/types/patrocinador";

export function computeSponsorStatus(
  periodStart?: string | null,
  periodEnd?: string | null
): PatrocinadorStatus {
  const now = new Date();
  const start = periodStart ? new Date(periodStart) : null;
  const end = periodEnd ? new Date(periodEnd) : null;

  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return "expirado";
  }
  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return "em_breve";
  }
  return "ativo";
}

export function normalizeSponsor(raw: any): Patrocinador {
  const periodStart = raw?.periodStart ?? raw?.period_start ?? null;
  const periodEnd = raw?.periodEnd ?? raw?.period_end ?? null;
  const tier = (raw?.tier ?? raw?.nivel ?? "BASIC") as Patrocinador["tier"];
  const displayOrder = Number(raw?.displayOrder ?? raw?.display_order ?? raw?.prioridade ?? 1) || 1;
  const showOnFooter = Boolean(raw?.showOnFooter ?? raw?.show_on_footer);

  const value =
    typeof raw?.value === "number"
      ? raw.value
      : raw?.value
        ? Number(raw.value)
        : raw?.valor
          ? Number(raw.valor)
          : null;

  return {
    id: String(raw?.id ?? ""),
    tenantId: raw?.tenantId ?? raw?.tenant_id ?? undefined,
    name: String(raw?.name ?? raw?.nome ?? ""),
    logoUrl: String(raw?.logoUrl ?? raw?.logo_url ?? raw?.logo ?? ""),
    link: raw?.link ?? null,
    ramo: raw?.ramo ?? null,
    about: raw?.about ?? null,
    coupon: raw?.coupon ?? null,
    benefit: raw?.benefit ?? null,
    value: typeof value === "number" && !Number.isNaN(value) ? value : null,
    periodStart,
    periodEnd,
    displayOrder,
    tier,
    showOnFooter,
    status:
      (raw?.status as PatrocinadorStatus | undefined) ??
      computeSponsorStatus(periodStart ?? undefined, periodEnd ?? undefined),
    createdAt: raw?.createdAt ?? raw?.criadoEm ?? undefined,
    updatedAt: raw?.updatedAt ?? raw?.atualizadoEm ?? undefined,
  };
}
