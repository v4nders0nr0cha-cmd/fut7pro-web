"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaFilter,
  FaPaperPlane,
  FaSearch,
  FaTimesCircle,
  FaUserShield,
} from "react-icons/fa";
import type {
  SupportTicketCategory,
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketStatus,
} from "@/types/support-ticket";
import {
  supportTicketCategoryLabels,
  supportTicketStatusClasses,
  supportTicketStatusLabels,
} from "@/types/support-ticket";

type ApiListPayload = {
  results?: SupportTicketItem[];
};

const categoryValues = Object.keys(supportTicketCategoryLabels) as SupportTicketCategory[];
const statusValues = Object.keys(supportTicketStatusLabels) as SupportTicketStatus[];

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

function resolveList(payload: unknown): SupportTicketItem[] {
  if (Array.isArray(payload)) return payload as SupportTicketItem[];
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

function messageAuthorLabel(message: SupportTicketDetail["messages"][number]) {
  if (message.authorType === "SUPERADMIN") return "Equipe Fut7Pro";
  if (message.authorType === "ADMIN") {
    const authorName = message.authorUser?.name?.trim();
    return authorName ? `Admin (${authorName})` : "Admin do racha";
  }
  return "Sistema";
}

export default function SuperAdminSuportePage() {
  const searchParams = useSearchParams();
  const ticketFromQuery = searchParams?.get("open") ?? null;

  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | "ALL">("ALL");

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDetail | null>(null);

  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<SupportTicketStatus | "KEEP">("WAITING_ADMIN");
  const [statusDraft, setStatusDraft] = useState<SupportTicketStatus>("IN_PROGRESS");
  const [statusNote, setStatusNote] = useState("");

  const loadTickets = useCallback(async () => {
    setIsListLoading(true);
    setPageError(null);

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search.trim()) params.set("q", search.trim());
      if (tenantFilter.trim()) params.set("tenantId", tenantFilter.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);

      const response = await fetch(`/api/superadmin/support/tickets?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível carregar os chamados."));
      }

      const list = resolveList(payload);
      setTickets(list);

      if (selectedTicketId && !list.some((ticket) => ticket.id === selectedTicketId)) {
        setSelectedTicketId(null);
        setSelectedTicket(null);
      }
    } catch (error) {
      setTickets([]);
      setPageError(
        error instanceof Error ? error.message : "Erro inesperado ao carregar os chamados."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [search, tenantFilter, statusFilter, categoryFilter, selectedTicketId]);

  const openTicket = useCallback(async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDetailLoading(true);
    setPageError(null);

    try {
      const response = await fetch(`/api/superadmin/support/tickets/${ticketId}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível carregar o chamado."));
      }

      const detail = payload as SupportTicketDetail;
      setSelectedTicket(detail);
      setStatusDraft(detail.status === "OPEN" ? "IN_PROGRESS" : detail.status);
      setReplyStatus("WAITING_ADMIN");
    } catch (error) {
      setSelectedTicket(null);
      setPageError(error instanceof Error ? error.message : "Erro ao abrir o chamado.");
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!ticketFromQuery || !tickets.length) return;
    if (!tickets.some((ticket) => ticket.id === ticketFromQuery)) return;
    if (selectedTicketId === ticketFromQuery) return;
    void openTicket(ticketFromQuery);
  }, [ticketFromQuery, tickets, selectedTicketId, openTicket]);

  async function updateTicketStatus() {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    setPageError(null);
    setFeedback(null);

    try {
      const response = await fetch(`/api/superadmin/support/tickets/${selectedTicket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusDraft,
          note: statusNote.trim() || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível atualizar o status."));
      }

      const updated = payload as SupportTicketDetail;
      setSelectedTicket(updated);
      setStatusDraft(updated.status === "OPEN" ? "IN_PROGRESS" : updated.status);
      setStatusNote("");
      setFeedback({ success: true, message: "Status do chamado atualizado com sucesso." });
      await loadTickets();
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao atualizar status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function replyTicket() {
    if (!selectedTicket) return;

    const message = replyMessage.trim();
    if (message.length < 2) {
      setFeedback({ success: false, message: "Digite uma resposta com pelo menos 2 caracteres." });
      return;
    }

    setIsReplying(true);
    setPageError(null);
    setFeedback(null);

    try {
      const response = await fetch(`/api/superadmin/support/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          status: replyStatus === "KEEP" ? undefined : replyStatus,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível enviar a resposta."));
      }

      const updated = payload as SupportTicketDetail;
      setSelectedTicket(updated);
      setReplyMessage("");
      setStatusDraft(updated.status === "OPEN" ? "IN_PROGRESS" : updated.status);
      setReplyStatus("WAITING_ADMIN");
      setFeedback({ success: true, message: "Resposta enviada para o administrador do racha." });
      await loadTickets();
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao enviar resposta.",
      });
    } finally {
      setIsReplying(false);
    }
  }

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;
    const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
    const waiting = tickets.filter((ticket) => ticket.status === "WAITING_ADMIN").length;
    const resolved = tickets.filter((ticket) => ticket.status === "RESOLVED").length;
    const closed = tickets.filter((ticket) => ticket.status === "CLOSED").length;

    return { open, inProgress, waiting, resolved, closed };
  }, [tickets]);

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <h1 className="text-2xl font-semibold text-yellow-300 flex items-center gap-2">
          <FaUserShield />
          Suporte global Fut7Pro
        </h1>
        <p className="text-sm text-zinc-300">
          Painel de chamados dos administradores dos rachas. Gerencie prioridades, atualize status e
          responda com rastreabilidade total entre Admin e SuperAdmin.
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Abertos</p>
            <p className="text-xl font-semibold text-yellow-300">{stats.open}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Em andamento</p>
            <p className="text-xl font-semibold text-blue-300">{stats.inProgress}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Aguardando admin</p>
            <p className="text-xl font-semibold text-orange-300">{stats.waiting}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Resolvidos</p>
            <p className="text-xl font-semibold text-emerald-300">{stats.resolved}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Fechados</p>
            <p className="text-xl font-semibold text-zinc-300">{stats.closed}</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <FaFilter />
          Filtros
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
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
            {statusValues.map((status) => (
              <option key={status} value={status}>
                {supportTicketStatusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as SupportTicketCategory | "ALL")
            }
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todas as categorias</option>
            {categoryValues.map((category) => (
              <option key={category} value={category}>
                {supportTicketCategoryLabels[category]}
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
              Chamados globais
            </h2>
            <span className="text-xs text-zinc-500">{tickets.length} itens</span>
          </div>

          {isListLoading ? (
            <p className="py-8 text-center text-sm text-zinc-400">Carregando chamados...</p>
          ) : tickets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Nenhum chamado encontrado.</p>
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
                    {supportTicketCategoryLabels[ticket.category]} • Aberto em{" "}
                    {formatDateTime(ticket.createdAt)}
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
              Selecione um chamado para acompanhar o histórico e responder.
            </div>
          ) : isDetailLoading || !selectedTicket ? (
            <div className="flex h-full min-h-[460px] items-center justify-center text-sm text-zinc-400">
              Carregando detalhes do chamado...
            </div>
          ) : (
            <div className="space-y-4">
              <header className="space-y-2 border-b border-zinc-800 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {selectedTicket.tenant?.name || "Racha sem nome"} •{" "}
                      {selectedTicket.tenant?.slug || selectedTicket.tenantId}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${supportTicketStatusClasses[selectedTicket.status]}`}
                  >
                    {supportTicketStatusLabels[selectedTicket.status]}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Categoria: {supportTicketCategoryLabels[selectedTicket.category]} • Aberto em{" "}
                  {formatDateTime(selectedTicket.createdAt)}
                </p>
                <p className="text-xs text-zinc-500">
                  Criado por: {selectedTicket.createdByAdminUser?.name || "Admin do racha"} • Última
                  atividade: {formatDateTime(selectedTicket.lastMessageAt)}
                </p>
              </header>

              <div className="grid grid-cols-1 gap-3 rounded border border-zinc-800 bg-[#121212] p-3 md:grid-cols-[220px_1fr_auto] md:items-end">
                <div>
                  <label
                    htmlFor="status-draft"
                    className="mb-1 block text-xs font-semibold text-zinc-300"
                  >
                    Atualizar status
                  </label>
                  <select
                    id="status-draft"
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value as SupportTicketStatus)}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  >
                    {statusValues.map((status) => (
                      <option key={status} value={status}>
                        {supportTicketStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-note"
                    className="mb-1 block text-xs font-semibold text-zinc-300"
                  >
                    Observação (opcional)
                  </label>
                  <input
                    id="status-note"
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    maxLength={300}
                    placeholder="Ex.: aguardando validação de logs"
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void updateTicketStatus()}
                  disabled={isUpdatingStatus}
                  className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {isUpdatingStatus ? "Salvando..." : "Salvar status"}
                </button>
              </div>

              <div className="max-h-[330px] space-y-3 overflow-auto rounded border border-zinc-800 bg-[#101010] p-3">
                {selectedTicket.messages.map((message) => {
                  const fromSuperAdmin = message.authorType === "SUPERADMIN";
                  const fromAdmin = message.authorType === "ADMIN";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${fromSuperAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-lg border px-3 py-2 text-sm ${
                          fromSuperAdmin
                            ? "border-emerald-600/50 bg-emerald-900/25 text-emerald-100"
                            : fromAdmin
                              ? "border-blue-600/50 bg-blue-900/25 text-blue-100"
                              : "border-zinc-700 bg-zinc-900 text-zinc-200"
                        }`}
                      >
                        <p className="mb-1 text-[11px] uppercase tracking-wide opacity-80">
                          {messageAuthorLabel(message)} • {formatDateTime(message.createdAt)}
                        </p>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <section className="space-y-2 rounded border border-zinc-800 bg-[#121212] p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                  <div>
                    <label
                      htmlFor="reply-status"
                      className="mb-1 block text-xs font-semibold text-zinc-300"
                    >
                      Status após responder
                    </label>
                    <select
                      id="reply-status"
                      value={replyStatus}
                      onChange={(event) =>
                        setReplyStatus(event.target.value as SupportTicketStatus | "KEEP")
                      }
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    >
                      <option value="KEEP">Manter status atual</option>
                      {statusValues.map((status) => (
                        <option key={status} value={status}>
                          {supportTicketStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="reply-message"
                      className="mb-1 block text-xs font-semibold text-zinc-300"
                    >
                      Resposta para o admin
                    </label>
                    <textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      maxLength={4000}
                      placeholder="Digite a orientação da equipe Fut7Pro para o administrador..."
                      className="min-h-[120px] w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void replyTicket()}
                    disabled={isReplying}
                    className="inline-flex items-center gap-2 rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
                  >
                    <FaPaperPlane />
                    {isReplying ? "Enviando..." : "Enviar resposta"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
