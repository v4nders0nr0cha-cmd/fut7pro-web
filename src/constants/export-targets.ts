export type ExportTargetId = "financeiro" | "rankings" | "patrocinadores";

export interface ExportTargetMeta {
  id: ExportTargetId;
  label: string;
  description: string;
  path: string;
  defaultParams?: Record<string, string>;
}

export const EXPORT_TARGETS: ExportTargetMeta[] = [
  {
    id: "financeiro",
    label: "Exportacao Financeira",
    description: "Gera planilhas com receitas, despesas e prestacoes de contas.",
    path: "/api/admin/financeiro/export",
    defaultParams: { format: "csv" },
  },
  {
    id: "rankings",
    label: "Exportacao de Rankings",
    description: "Relatorios de desempenho (geral, artilharia, assistencias).",
    path: "/api/admin/rankings/export",
    defaultParams: {
      type: "geral",
      format: "csv",
      limit: "50",
    },
  },
  {
    id: "patrocinadores",
    label: "Exportacao de Patrocinadores",
    description: "Lista ativa com tiers, vigencias e contatos.",
    path: "/api/admin/patrocinadores/export",
    defaultParams: { format: "csv" },
  },
];

export function buildExportPath(target: ExportTargetMeta, tenantSlug?: string | null) {
  const params = new URLSearchParams(target.defaultParams ?? {});
  if (tenantSlug && tenantSlug.trim().length > 0) {
    params.set("slug", tenantSlug.trim());
  }
  const query = params.toString();
  return query.length > 0 ? `${target.path}?${query}` : target.path;
}

export function findExportTarget(targetId: string | null | undefined) {
  if (!targetId) {
    return null;
  }
  const normalized = targetId.toLowerCase() as ExportTargetId;
  return EXPORT_TARGETS.find((target) => target.id === normalized) ?? null;
}
