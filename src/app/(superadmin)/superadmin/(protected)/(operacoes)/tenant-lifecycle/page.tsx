"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Fut7DestructiveDialog, showFut7Toast } from "@/components/ui/feedback";

type LifecycleSummary = {
  total: number;
  trialAtivo: number;
  trialExpiradoSemConversao: number;
  abandonadosSemConversao: number;
  inadimplentesComHistorico: number;
  arquivados: number;
  exclusaoAgendada: number;
  excluidosNoMes: number;
};

type LifecycleRow = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  createdAt?: string;
  lastActivityAt?: string | null;
  trialEnd?: string | null;
  firstPaymentAt?: string | null;
  lastPaymentAt?: string | null;
  inactivityDays?: number | null;
  billingStatus: "ADIMPLENTE" | "INADIMPLENTE_COM_HISTORICO" | "SEM_CONVERSAO" | "ISENTO";
  conversionStatus: "NUNCA_PAGOU" | "JA_PAGOU_AO_MENOS_UMA_VEZ";
  lifecycleStatus:
    | "ATIVO"
    | "TRIAL_EXPIRADO"
    | "ABANDONADO"
    | "BLOQUEADO"
    | "ARQUIVADO"
    | "AGUARDANDO_EXCLUSAO"
    | "EXCLUIDO";
  lifecycleReason?: string;
  protectedFromAutoDeletion?: boolean;
  archivedAt?: string | null;
  scheduledDeletionAt?: string | null;
};

type LifecycleResponse = {
  summary: LifecycleSummary;
  rows: LifecycleRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  policies: {
    abandonedDays: number;
    autoArchiveDays: number;
    autoDeleteGraceDays: number;
  };
  generatedAt: string;
};

type LifecycleAction =
  | "PROTEGER"
  | "REMOVER_PROTECAO"
  | "ARQUIVAR"
  | "REATIVAR"
  | "AGENDAR_EXCLUSAO"
  | "CANCELAR_EXCLUSAO"
  | "EXCLUIR_AGORA";

const lifecycleLabels: Record<LifecycleRow["lifecycleStatus"], string> = {
  ATIVO: "Ativo",
  TRIAL_EXPIRADO: "Trial expirado",
  ABANDONADO: "Abandonado",
  BLOQUEADO: "Bloqueado",
  ARQUIVADO: "Arquivado",
  AGUARDANDO_EXCLUSAO: "Exclusao agendada",
  EXCLUIDO: "Excluido",
};

const lifecycleClasses: Record<LifecycleRow["lifecycleStatus"], string> = {
  ATIVO: "bg-emerald-900/60 text-emerald-200 border border-emerald-700/50",
  TRIAL_EXPIRADO: "bg-amber-900/60 text-amber-200 border border-amber-700/50",
  ABANDONADO: "bg-orange-900/60 text-orange-200 border border-orange-700/50",
  BLOQUEADO: "bg-red-900/60 text-red-200 border border-red-700/50",
  ARQUIVADO: "bg-zinc-800 text-zinc-200 border border-zinc-600/50",
  AGUARDANDO_EXCLUSAO: "bg-rose-900/60 text-rose-200 border border-rose-700/50",
  EXCLUIDO: "bg-zinc-900 text-zinc-400 border border-zinc-700/50",
};

const billingLabels: Record<LifecycleRow["billingStatus"], string> = {
  ADIMPLENTE: "Adimplente",
  INADIMPLENTE_COM_HISTORICO: "Inadimplente com historico",
  SEM_CONVERSAO: "Sem conversao",
  ISENTO: "Isento",
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || body?.error || "Falha ao carregar lifecycle");
  }
  return body as LifecycleResponse;
};

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return format(date, "dd/MM/yyyy");
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return format(date, "dd/MM/yyyy HH:mm");
}

export default function TenantLifecyclePage() {
  const [search, setSearch] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState("");
  const [billingStatus, setBillingStatus] = useState("");
  const [conversionStatus, setConversionStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isMutating, setIsMutating] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<LifecycleRow | null>(null);

  const PAGE_SIZE = 200;

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (search.trim()) params.set("search", search.trim());
    if (lifecycleStatus) params.set("lifecycleStatus", lifecycleStatus);
    if (billingStatus) params.set("billingStatus", billingStatus);
    if (conversionStatus) params.set("conversionStatus", conversionStatus);
    return params.toString();
  }, [billingStatus, conversionStatus, lifecycleStatus, page, search]);

  useEffect(() => {
    setPage(1);
  }, [billingStatus, conversionStatus, lifecycleStatus, search]);

  const { data, error, isLoading, mutate } = useSWR<LifecycleResponse>(
    `/api/superadmin/tenants/lifecycle?${query}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  async function runReconcile() {
    setIsMutating(true);
    try {
      const response = await fetch("/api/superadmin/tenants/lifecycle", {
        method: "POST",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.message || body?.error || "Falha ao reconciliar lifecycle");
      }
      await mutate();
    } catch (actionError) {
      showFut7Toast({
        tone: "error",
        title: "Falha ao reconciliar lifecycle",
        message:
          actionError instanceof Error ? actionError.message : "Tente novamente em instantes.",
      });
    } finally {
      setIsMutating(false);
    }
  }

  async function applyAction(tenantId: string, action: LifecycleAction, reason?: string) {
    setIsMutating(true);
    try {
      const response = await fetch(`/api/superadmin/tenants/${tenantId}/lifecycle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.message || body?.error || "Falha ao aplicar acao");
      }
      await mutate();
    } catch (actionError) {
      showFut7Toast({
        tone: "error",
        title: "Falha ao aplicar ação",
        message:
          actionError instanceof Error ? actionError.message : "Tente novamente em instantes.",
      });
    } finally {
      setIsMutating(false);
    }
  }

  async function confirmDeleteTenant() {
    if (!tenantToDelete) return;
    const target = tenantToDelete;
    setTenantToDelete(null);
    await applyAction(target.tenantId, "EXCLUIR_AGORA", "Exclusao manual imediata");
  }

  const totalPages = Math.max(data?.pagination.totalPages ?? 1, 1);
  const totalRows = data?.pagination.total ?? 0;
  const currentPage = Math.min(data?.pagination.page ?? page, totalPages);
  const showingFrom = totalRows > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingTo = totalRows > 0 ? Math.min(currentPage * PAGE_SIZE, totalRows) : 0;

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              Operacao de Ciclo de Vida dos Rachas
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Segmentacao de trial, sem conversao, inadimplencia com historico e limpeza automatica.
            </p>
          </div>
          <button
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isMutating}
            onClick={runReconcile}
          >
            Reconciliar agora
          </button>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Politica ativa: abandono em {data?.policies.abandonedDays ?? "--"} dias, arquivamento
          automatico em {data?.policies.autoArchiveDays ?? "--"} dias, exclusao apos{" "}
          {data?.policies.autoDeleteGraceDays ?? "--"} dias de fila.
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Trial Ativo"
          value={data?.summary.trialAtivo ?? 0}
          accent="text-blue-300"
        />
        <SummaryCard
          title="Trial Expirado"
          value={data?.summary.trialExpiradoSemConversao ?? 0}
          accent="text-amber-300"
        />
        <SummaryCard
          title="Abandonados"
          value={data?.summary.abandonadosSemConversao ?? 0}
          accent="text-orange-300"
        />
        <SummaryCard
          title="Inadimplente Hist."
          value={data?.summary.inadimplentesComHistorico ?? 0}
          accent="text-red-300"
        />
        <SummaryCard
          title="Arquivados"
          value={data?.summary.arquivados ?? 0}
          accent="text-zinc-300"
        />
        <SummaryCard
          title="Exclusao Agendada"
          value={data?.summary.exclusaoAgendada ?? 0}
          accent="text-rose-300"
        />
        <SummaryCard
          title="Excluidos no Mes"
          value={data?.summary.excluidosNoMes ?? 0}
          accent="text-fuchsia-300"
        />
        <SummaryCard title="Total" value={data?.summary.total ?? 0} accent="text-emerald-300" />
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 md:grid-cols-4">
        <input
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
          placeholder="Buscar por nome, slug ou presidente"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={lifecycleStatus}
          onChange={(event) => setLifecycleStatus(event.target.value)}
        >
          <option value="">Todos os ciclos</option>
          <option value="ATIVO">Ativo</option>
          <option value="TRIAL_EXPIRADO">Trial expirado</option>
          <option value="ABANDONADO">Abandonado</option>
          <option value="BLOQUEADO">Bloqueado</option>
          <option value="ARQUIVADO">Arquivado</option>
          <option value="AGUARDANDO_EXCLUSAO">Exclusao agendada</option>
        </select>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={billingStatus}
          onChange={(event) => setBillingStatus(event.target.value)}
        >
          <option value="">Todos os financeiros</option>
          <option value="ADIMPLENTE">Adimplente</option>
          <option value="INADIMPLENTE_COM_HISTORICO">Inadimplente com historico</option>
          <option value="SEM_CONVERSAO">Sem conversao</option>
          <option value="ISENTO">Isento</option>
        </select>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          value={conversionStatus}
          onChange={(event) => setConversionStatus(event.target.value)}
        >
          <option value="">Todos os tipos de conversao</option>
          <option value="NUNCA_PAGOU">Nunca pagou</option>
          <option value="JA_PAGOU_AO_MENOS_UMA_VEZ">Ja pagou ao menos uma vez</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error.message}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70">
        <table className="min-w-[1300px] w-full text-sm text-zinc-100">
          <thead className="bg-zinc-950/70 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-left">Racha</th>
              <th className="px-3 py-2 text-left">Presidente</th>
              <th className="px-3 py-2 text-left">Ciclo</th>
              <th className="px-3 py-2 text-left">Financeiro</th>
              <th className="px-3 py-2 text-left">Conversao</th>
              <th className="px-3 py-2 text-left">Trial fim</th>
              <th className="px-3 py-2 text-left">1o pagamento</th>
              <th className="px-3 py-2 text-left">Ult. pagamento</th>
              <th className="px-3 py-2 text-left">Inatividade</th>
              <th className="px-3 py-2 text-left">Criado</th>
              <th className="px-3 py-2 text-left">Arquivado</th>
              <th className="px-3 py-2 text-left">Exclusao</th>
              <th className="px-3 py-2 text-left">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-zinc-400">
                  Carregando lifecycle...
                </td>
              </tr>
            ) : null}

            {!isLoading && (data?.rows?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-zinc-400">
                  Nenhum racha encontrado para os filtros.
                </td>
              </tr>
            ) : null}

            {(data?.rows ?? []).map((row) => {
              return (
                <tr key={row.tenantId} className="border-t border-zinc-800/80 align-top">
                  <td className="px-3 py-3">
                    <div className="font-semibold">{row.tenantName}</div>
                    <div className="text-xs text-zinc-500">/{row.tenantSlug}</div>
                    {row.lifecycleReason ? (
                      <div className="mt-1 text-[11px] text-zinc-500">{row.lifecycleReason}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <div>{row.ownerName || "--"}</div>
                    <div className="text-xs text-zinc-500">{row.ownerEmail || "--"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${lifecycleClasses[row.lifecycleStatus]}`}
                    >
                      {lifecycleLabels[row.lifecycleStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">{billingLabels[row.billingStatus]}</td>
                  <td className="px-3 py-3 text-xs">
                    {row.conversionStatus === "NUNCA_PAGOU" ? "Nunca pagou" : "Ja pagou"}
                  </td>
                  <td className="px-3 py-3 text-xs">{formatDate(row.trialEnd)}</td>
                  <td className="px-3 py-3 text-xs">{formatDate(row.firstPaymentAt)}</td>
                  <td className="px-3 py-3 text-xs">{formatDate(row.lastPaymentAt)}</td>
                  <td className="px-3 py-3 text-xs">
                    {typeof row.inactivityDays === "number" ? `${row.inactivityDays} dias` : "--"}
                    <div className="text-[11px] text-zinc-500">
                      {formatDate(row.lastActivityAt)}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs">{formatDate(row.createdAt)}</td>
                  <td className="px-3 py-3 text-xs">{formatDate(row.archivedAt)}</td>
                  <td className="px-3 py-3 text-xs">{formatDateTime(row.scheduledDeletionAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.protectedFromAutoDeletion ? (
                        <button
                          className="rounded bg-zinc-700 px-2 py-1 text-[11px] font-semibold text-zinc-100 hover:bg-zinc-600 disabled:opacity-60"
                          disabled={isMutating}
                          onClick={() =>
                            applyAction(
                              row.tenantId,
                              "REMOVER_PROTECAO",
                              "Protecao removida manualmente no painel de lifecycle"
                            )
                          }
                        >
                          Remover protecao
                        </button>
                      ) : (
                        <button
                          className="rounded bg-blue-800 px-2 py-1 text-[11px] font-semibold text-blue-100 hover:bg-blue-700 disabled:opacity-60"
                          disabled={isMutating}
                          onClick={() =>
                            applyAction(
                              row.tenantId,
                              "PROTEGER",
                              "Protecao manual contra limpeza automatica"
                            )
                          }
                        >
                          Proteger
                        </button>
                      )}

                      {row.lifecycleStatus === "ARQUIVADO" ||
                      row.lifecycleStatus === "AGUARDANDO_EXCLUSAO" ? (
                        <>
                          <button
                            className="rounded bg-emerald-800 px-2 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-700 disabled:opacity-60"
                            disabled={isMutating}
                            onClick={() =>
                              applyAction(row.tenantId, "REATIVAR", "Reativado manualmente")
                            }
                          >
                            Reativar
                          </button>
                          <button
                            className="rounded bg-zinc-700 px-2 py-1 text-[11px] font-semibold text-zinc-100 hover:bg-zinc-600 disabled:opacity-60"
                            disabled={isMutating}
                            onClick={() =>
                              applyAction(
                                row.tenantId,
                                "CANCELAR_EXCLUSAO",
                                "Cancelamento manual da exclusao agendada"
                              )
                            }
                          >
                            Cancelar exclusao
                          </button>
                        </>
                      ) : (
                        <button
                          className="rounded bg-amber-800 px-2 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-700 disabled:opacity-60"
                          disabled={isMutating}
                          onClick={() =>
                            applyAction(
                              row.tenantId,
                              "ARQUIVAR",
                              "Arquivamento manual pelo painel de lifecycle"
                            )
                          }
                        >
                          Arquivar
                        </button>
                      )}

                      <button
                        className="rounded bg-rose-800 px-2 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-700 disabled:opacity-60"
                        disabled={isMutating}
                        onClick={() => setTenantToDelete(row)}
                      >
                        Excluir agora
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-zinc-400">
          Exibindo {showingFrom}-{showingTo} de {totalRows} rachas
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            disabled={isLoading || isMutating || currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Pagina anterior
          </button>
          <span className="text-xs text-zinc-400">
            Pagina {currentPage} de {totalPages}
          </span>
          <button
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            disabled={isLoading || isMutating || currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Proxima pagina
          </button>
        </div>
      </div>
      <Fut7DestructiveDialog
        open={Boolean(tenantToDelete)}
        title={`Excluir definitivamente ${tenantToDelete?.tenantName || "racha"}?`}
        description="Esta ação remove o tenant imediatamente pelo fluxo de lifecycle. Use apenas quando o racha já foi validado para exclusão manual."
        confirmLabel="Excluir agora"
        cancelLabel="Cancelar"
        confirmationText="EXCLUIR AGORA"
        confirmationLabel="Digite a frase abaixo para confirmar"
        loading={isMutating}
        impactItems={[
          "Todos os dados operacionais do racha serão removidos pelo backend.",
          "A exclusão ignora a fila de espera do lifecycle.",
          "A ação deve ter respaldo administrativo e auditoria externa.",
        ]}
        onClose={() => setTenantToDelete(null)}
        onConfirm={() => void confirmDeleteTenant()}
      />
    </section>
  );
}

function SummaryCard({ title, value, accent }: { title: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
