"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaCheckCircle, FaFilter, FaSearch, FaTimesCircle, FaUserSlash } from "react-icons/fa";
import type { SupportTicketDetail, SupportTicketStatus } from "@/types/support-ticket";
import { supportTicketStatusClasses, supportTicketStatusLabels } from "@/types/support-ticket";

type CancellationStage = "SOLICITADO" | "APROVADO" | "CONCLUIDO";

type CancellationTicketItem = {
  id: string;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  lastMessage?: {
    message: string;
    createdAt: string;
  } | null;
  cancellationStage: CancellationStage;
  canApprove: boolean;
  canConclude: boolean;
  subscriptionStatus?: string | null;
  subscriptionPlanKey?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
};

type CancellationTicketDetail = SupportTicketDetail & {
  cancellationStage?: CancellationStage;
  canApprove?: boolean;
  canConclude?: boolean;
  subscriptionStatus?: string | null;
  subscriptionPlanKey?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
};

type ApiListPayload = {
  results?: CancellationTicketItem[];
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function extractError(payload: unknown, fallback: string) {
  if (!isObjectRecord(payload)) return fallback;
  const message = payload.message;
  if (typeof message === "string" && message.trim()) return message;
  const error = payload.error;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function resolveList(payload: unknown): CancellationTicketItem[] {
  if (Array.isArray(payload)) return payload as CancellationTicketItem[];
  if (isObjectRecord(payload) && Array.isArray((payload as ApiListPayload).results)) {
    return (payload as ApiListPayload).results || [];
  }
  return [];
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("pt-BR");
}

function truncate(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

function formatSubscriptionStatus(status?: string | null) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "Sem assinatura";
  if (normalized === "active") return "Ativa";
  if (normalized === "trialing") return "Teste";
  if (normalized === "past_due") return "Inadimplente";
  if (normalized === "paused") return "Pausada";
  if (normalized === "canceled") return "Cancelada";
  if (normalized === "expired") return "Expirada";
  return normalized;
}

function stageLabel(stage?: CancellationStage | null) {
  if (stage === "APROVADO") return "Aprovado";
  if (stage === "CONCLUIDO") return "Concluído";
  return "Solicitado";
}

function stageBadgeClass(stage?: CancellationStage | null) {
  if (stage === "APROVADO") return "bg-blue-900/40 text-blue-200 border border-blue-600/60";
  if (stage === "CONCLUIDO")
    return "bg-emerald-900/40 text-emerald-200 border border-emerald-600/60";
  return "bg-yellow-900/40 text-yellow-200 border border-yellow-600/60";
}

export default function SuperAdminCancelamentosPage() {
  const searchParams = useSearchParams();
  const ticketFromQuery = searchParams?.get("open") ?? null;

  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "ALL">("ALL");

  const [tickets, setTickets] = useState<CancellationTicketItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<CancellationTicketItem | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<CancellationTicketDetail | null>(null);

  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [actionNote, setActionNote] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const loadTickets = useCallback(async () => {
    setIsListLoading(true);
    setPageError(null);

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search.trim()) params.set("q", search.trim());
      if (tenantFilter.trim()) params.set("tenantId", tenantFilter.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const response = await fetch(
        `/api/superadmin/support/cancelamento-racha?${params.toString()}`,
        {
          cache: "no-store",
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível carregar as solicitações."));
      }

      const list = resolveList(payload);
      setTickets(list);

      if (selectedTicketId) {
        const found = list.find((ticket) => ticket.id === selectedTicketId) || null;
        setSelectedSummary(found);
        if (!found) {
          setSelectedTicketId(null);
          setSelectedTicket(null);
        }
      }
    } catch (error) {
      setTickets([]);
      setPageError(
        error instanceof Error ? error.message : "Erro inesperado ao carregar cancelamentos."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [search, tenantFilter, statusFilter, selectedTicketId]);

  const openTicket = useCallback(
    async (ticketId: string) => {
      setSelectedTicketId(ticketId);
      setIsDetailLoading(true);
      setPageError(null);
      setFeedback(null);

      const summary = tickets.find((ticket) => ticket.id === ticketId) || null;
      setSelectedSummary(summary);

      try {
        const response = await fetch(`/api/superadmin/support/tickets/${ticketId}`, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(extractError(payload, "Não foi possível carregar o protocolo."));
        }
        setSelectedTicket(payload as CancellationTicketDetail);
      } catch (error) {
        setSelectedTicket(null);
        setPageError(error instanceof Error ? error.message : "Erro ao abrir o protocolo.");
      } finally {
        setIsDetailLoading(false);
      }
    },
    [tickets]
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!ticketFromQuery || !tickets.length) return;
    if (!tickets.some((ticket) => ticket.id === ticketFromQuery)) return;
    if (selectedTicketId === ticketFromQuery) return;
    void openTicket(ticketFromQuery);
  }, [ticketFromQuery, tickets, selectedTicketId, openTicket]);

  async function processAction(action: "aprovar" | "concluir") {
    if (!selectedTicketId) return;

    setIsProcessing(true);
    setPageError(null);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/superadmin/support/cancelamento-racha/${selectedTicketId}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: actionNote.trim() || undefined }),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível processar o protocolo."));
      }

      const updated = payload as CancellationTicketDetail;
      setSelectedTicket(updated);
      setActionNote("");
      setFeedback({
        success: true,
        message:
          action === "aprovar"
            ? "Solicitação aprovada para processamento."
            : "Protocolo concluído e assinatura processada.",
      });
      await loadTickets();
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao processar protocolo.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const stats = useMemo(() => {
    const solicitado = tickets.filter((ticket) => ticket.cancellationStage === "SOLICITADO").length;
    const aprovado = tickets.filter((ticket) => ticket.cancellationStage === "APROVADO").length;
    const concluido = tickets.filter((ticket) => ticket.cancellationStage === "CONCLUIDO").length;
    return { solicitado, aprovado, concluido };
  }, [tickets]);

  const effectiveStage =
    selectedTicket?.cancellationStage || selectedSummary?.cancellationStage || "SOLICITADO";
  const canApprove = Boolean(selectedTicket?.canApprove ?? selectedSummary?.canApprove);
  const canConclude = Boolean(selectedTicket?.canConclude ?? selectedSummary?.canConclude);
  const subscriptionStatus =
    selectedTicket?.subscriptionStatus ?? selectedSummary?.subscriptionStatus ?? null;
  const subscriptionPlanKey =
    selectedTicket?.subscriptionPlanKey ?? selectedSummary?.subscriptionPlanKey ?? null;
  const subscriptionCurrentPeriodEnd =
    selectedTicket?.subscriptionCurrentPeriodEnd ?? selectedSummary?.subscriptionCurrentPeriodEnd;

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <h1 className="text-2xl font-semibold text-red-300 flex items-center gap-2">
          <FaUserSlash />
          Rachas que solicitaram cancelamento
        </h1>
        <p className="text-sm text-zinc-300">
          Fluxo dedicado para processar pedidos de cancelamento da conta do racha: aprovação e
          conclusão do protocolo com registro rastreável.
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Solicitados</p>
            <p className="text-xl font-semibold text-yellow-300">{stats.solicitado}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Aprovados</p>
            <p className="text-xl font-semibold text-blue-300">{stats.aprovado}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Concluídos</p>
            <p className="text-xl font-semibold text-emerald-300">{stats.concluido}</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <FaFilter />
          Filtros
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por assunto ou mensagem..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>

          <input
            value={tenantFilter}
            onChange={(event) => setTenantFilter(event.target.value)}
            placeholder="Tenant (slug ou tenantId)"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as SupportTicketStatus | "ALL")}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todos os status</option>
            {(Object.keys(supportTicketStatusLabels) as SupportTicketStatus[]).map((status) => (
              <option key={status} value={status}>
                {supportTicketStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </section>

      {pageError && (
        <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          {pageError}
        </div>
      )}

      {feedback && (
        <div
          className={`rounded px-3 py-2 text-sm font-semibold ${
            feedback.success
              ? "border border-emerald-700 bg-emerald-900/30 text-emerald-200"
              : "border border-red-700 bg-red-900/30 text-red-200"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {feedback.success ? <FaCheckCircle /> : <FaTimesCircle />}
            {feedback.message}
          </span>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[390px_1fr]">
        <article className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Solicitações
            </h2>
            <span className="text-xs text-zinc-500">{tickets.length} itens</span>
          </div>

          {isListLoading ? (
            <p className="py-8 text-center text-sm text-zinc-400">Carregando solicitações...</p>
          ) : tickets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              Nenhuma solicitação encontrada para os filtros atuais.
            </p>
          ) : (
            <div className="space-y-3 max-h-[75vh] overflow-auto pr-1">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => void openTicket(ticket.id)}
                  className={`w-full rounded border px-3 py-3 text-left transition ${
                    selectedTicketId === ticket.id
                      ? "border-yellow-400 bg-yellow-500/10"
                      : "border-zinc-700 bg-[#1f1f1f] hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-zinc-100">{ticket.subject}</p>
                    <span
                      className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ${supportTicketStatusClasses[ticket.status]}`}
                    >
                      {supportTicketStatusLabels[ticket.status]}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-400">
                    {ticket.tenant?.name || "Racha não identificado"} •{" "}
                    {ticket.tenant?.slug || ticket.tenantId}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Etapa:{" "}
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] ${stageBadgeClass(ticket.cancellationStage)}`}
                    >
                      {stageLabel(ticket.cancellationStage)}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Assinatura: {formatSubscriptionStatus(ticket.subscriptionStatus)}
                  </p>

                  <p className="mt-2 text-sm text-zinc-300">
                    {truncate(ticket.lastMessage?.message || "Sem mensagens ainda.")}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    Última atividade: {formatDateTime(ticket.lastMessageAt)} • {ticket.messageCount}{" "}
                    mensagem(ns)
                  </p>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
          {!selectedTicketId ? (
            <div className="flex h-full min-h-[460px] items-center justify-center text-sm text-zinc-400">
              Selecione uma solicitação para processar o cancelamento.
            </div>
          ) : isDetailLoading || !selectedTicket ? (
            <div className="flex h-full min-h-[460px] items-center justify-center text-sm text-zinc-400">
              Carregando protocolo...
            </div>
          ) : (
            <div className="space-y-4">
              <header className="space-y-2 border-b border-zinc-800 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-red-300">{selectedTicket.subject}</h3>
                    <p className="text-xs text-zinc-400">
                      {selectedTicket.tenant?.name || "Racha sem nome"} •{" "}
                      {selectedTicket.tenant?.slug || selectedTicket.tenantId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-1 text-xs ${stageBadgeClass(effectiveStage)}`}
                    >
                      {stageLabel(effectiveStage)}
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${supportTicketStatusClasses[selectedTicket.status]}`}
                    >
                      {supportTicketStatusLabels[selectedTicket.status]}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400">
                  Assinatura atual: <b>{formatSubscriptionStatus(subscriptionStatus)}</b>{" "}
                  {subscriptionPlanKey ? `• Plano: ${subscriptionPlanKey}` : ""}
                  {subscriptionCurrentPeriodEnd
                    ? ` • Vigência até ${formatDateTime(subscriptionCurrentPeriodEnd)}`
                    : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  Protocolo: {selectedTicket.id} • Criado em{" "}
                  {formatDateTime(selectedTicket.createdAt)}
                </p>
                <p className="text-xs text-zinc-500">
                  Criado por: {selectedTicket.createdByAdminUser?.name || "Admin do racha"}
                </p>
              </header>

              <section className="rounded border border-zinc-800 bg-[#121212] p-3 space-y-3">
                <label
                  htmlFor="cancelamento-note"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Observação operacional (opcional)
                </label>
                <textarea
                  id="cancelamento-note"
                  value={actionNote}
                  onChange={(event) => setActionNote(event.target.value)}
                  maxLength={500}
                  placeholder="Ex.: validação concluída com o presidente do racha."
                  className="min-h-[88px] w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void processAction("aprovar")}
                    disabled={isProcessing || !canApprove}
                    className="rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-blue-400 disabled:opacity-50"
                  >
                    {isProcessing ? "Processando..." : "Aprovar cancelamento"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void processAction("concluir")}
                    disabled={isProcessing || !canConclude}
                    className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isProcessing ? "Processando..." : "Concluir protocolo"}
                  </button>
                  <Link
                    href={`/superadmin/financeiro/${encodeURIComponent(selectedTicket.tenant?.slug || selectedTicket.tenantId)}`}
                    className="text-sm text-yellow-300 underline"
                  >
                    Ver financeiro do racha
                  </Link>
                </div>
              </section>

              <div className="max-h-[330px] space-y-3 overflow-auto rounded border border-zinc-800 bg-[#101010] p-3">
                {selectedTicket.messages.map((message) => {
                  const isSuperAdmin = message.authorType === "SUPERADMIN";
                  const isAdmin = message.authorType === "ADMIN";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSuperAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-lg border px-3 py-2 text-sm ${
                          isSuperAdmin
                            ? "border-emerald-600/50 bg-emerald-900/25 text-emerald-100"
                            : isAdmin
                              ? "border-blue-600/50 bg-blue-900/25 text-blue-100"
                              : "border-zinc-700 bg-zinc-900 text-zinc-200"
                        }`}
                      >
                        <p className="mb-1 text-[11px] uppercase tracking-wide opacity-80">
                          {message.authorType} • {formatDateTime(message.createdAt)}
                        </p>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
