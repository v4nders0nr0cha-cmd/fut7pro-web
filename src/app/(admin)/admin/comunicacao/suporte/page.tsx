"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaClock,
  FaHeadset,
  FaPaperPlane,
  FaPlus,
  FaSearch,
  FaTimesCircle,
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

function truncate(value: string, max = 110) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

function messageAuthorLabel(message: SupportTicketDetail["messages"][number]) {
  if (message.authorType === "ADMIN") return "Admin do racha";
  if (message.authorType === "SUPERADMIN") return "Equipe Fut7Pro";
  return "Sistema";
}

export default function SuportePage() {
  const searchParams = useSearchParams();
  const ticketFromQuery = searchParams?.get("open") ?? null;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | "ALL">("ALL");

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketDetail | null>(null);

  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [createForm, setCreateForm] = useState({
    category: "TECHNICAL_ISSUE" as SupportTicketCategory,
    subject: "",
    message: "",
  });
  const [replyMessage, setReplyMessage] = useState("");

  const loadTickets = useCallback(async () => {
    setIsListLoading(true);
    setPageError(null);

    try {
      const params = new URLSearchParams({ limit: "80" });
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);

      const response = await fetch(`/api/admin/support/tickets?${params.toString()}`, {
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
  }, [search, statusFilter, categoryFilter, selectedTicketId]);

  const openTicket = useCallback(async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDetailLoading(true);
    setPageError(null);

    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível carregar o chamado."));
      }
      setSelectedTicket(payload as SupportTicketDetail);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Erro ao abrir o chamado.");
      setSelectedTicket(null);
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

  async function createTicket() {
    const subject = createForm.subject.trim();
    const message = createForm.message.trim();

    if (subject.length < 6) {
      setFeedback({ success: false, message: "O assunto deve ter pelo menos 6 caracteres." });
      return;
    }
    if (message.length < 10) {
      setFeedback({ success: false, message: "A descrição deve ter pelo menos 10 caracteres." });
      return;
    }

    setIsCreating(true);
    setPageError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: createForm.category,
          subject,
          message,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível abrir o chamado."));
      }

      const created = payload as SupportTicketDetail;
      setCreateForm({
        category: "TECHNICAL_ISSUE",
        subject: "",
        message: "",
      });
      setIsCreateOpen(false);
      setSelectedTicketId(created.id);
      setSelectedTicket(created);
      setFeedback({ success: true, message: "Chamado criado com sucesso." });
      await loadTickets();
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao criar o chamado.",
      });
    } finally {
      setIsCreating(false);
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
      const response = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível enviar a resposta."));
      }

      const updated = payload as SupportTicketDetail;
      setSelectedTicket(updated);
      setReplyMessage("");
      setFeedback({ success: true, message: "Resposta enviada para a equipe Fut7Pro." });
      await loadTickets();
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao enviar a resposta.",
      });
    } finally {
      setIsReplying(false);
    }
  }

  async function updateTicketStatus(status: SupportTicketStatus) {
    if (!selectedTicket) return;
    setIsUpdatingStatus(true);
    setPageError(null);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível atualizar o chamado."));
      }

      const updated = payload as SupportTicketDetail;
      setSelectedTicket(updated);
      setFeedback({
        success: true,
        message:
          status === "CLOSED"
            ? "Chamado fechado com sucesso."
            : "Chamado reaberto para continuidade do atendimento.",
      });
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

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;
    const inProgress = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
    const waiting = tickets.filter((ticket) => ticket.status === "WAITING_ADMIN").length;
    const resolved = tickets.filter(
      (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED"
    ).length;

    return { open, inProgress, waiting, resolved };
  }, [tickets]);

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-7xl mx-auto w-full space-y-5">
      <header className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <FaHeadset />
          Suporte Fut7Pro
        </h1>
        <div className="rounded-lg bg-[#232323] border-l-4 border-yellow-400 p-4 text-sm text-zinc-200">
          <p className="font-semibold text-yellow-300">Canal oficial com a equipe Fut7Pro.</p>
          <p className="mt-1">
            Abra chamados para relatar problemas, tirar dúvidas ou enviar sugestões sobre a
            plataforma. Todo o histórico fica registrado com status, mensagens e rastreabilidade.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded border border-zinc-700 bg-[#181818] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Abertos</p>
            <p className="text-xl font-semibold text-yellow-300">{stats.open}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#181818] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Em andamento</p>
            <p className="text-xl font-semibold text-blue-300">{stats.inProgress}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#181818] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Aguardando admin</p>
            <p className="text-xl font-semibold text-orange-300">{stats.waiting}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#181818] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Resolvidos/Fechados</p>
            <p className="text-xl font-semibold text-emerald-300">{stats.resolved}</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-zinc-700 bg-[#171717] p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por assunto ou mensagem..."
              className="w-full rounded border border-zinc-600 bg-zinc-900 py-2 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as SupportTicketStatus | "ALL")}
            className="rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todos os status</option>
            {(Object.keys(supportTicketStatusLabels) as SupportTicketStatus[]).map((status) => (
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
            className="rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todas as categorias</option>
            {categoryValues.map((category) => (
              <option key={category} value={category}>
                {supportTicketCategoryLabels[category]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            <FaPlus />
            Abrir chamado
          </button>
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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[370px_1fr]">
        <article className="rounded-lg border border-zinc-700 bg-[#171717] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Chamados do racha
            </h2>
            <span className="text-xs text-zinc-500">{tickets.length} itens</span>
          </div>

          {isListLoading ? (
            <p className="py-8 text-center text-sm text-zinc-400">Carregando chamados...</p>
          ) : tickets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              Nenhum chamado encontrado para o filtro atual.
            </p>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
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
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-zinc-100">{ticket.subject}</p>
                    <span
                      className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ${supportTicketStatusClasses[ticket.status]}`}
                    >
                      {supportTicketStatusLabels[ticket.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {supportTicketCategoryLabels[ticket.category]} •{" "}
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

        <article className="rounded-lg border border-zinc-700 bg-[#171717] p-4">
          {!selectedTicketId ? (
            <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-zinc-400">
              Selecione um chamado para visualizar o histórico e responder.
            </div>
          ) : isDetailLoading || !selectedTicket ? (
            <div className="flex h-full min-h-[420px] items-center justify-center text-sm text-zinc-400">
              Carregando detalhes do chamado...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300">
                    {selectedTicket.subject}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {supportTicketCategoryLabels[selectedTicket.category]} • Aberto em{" "}
                    {formatDateTime(selectedTicket.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${supportTicketStatusClasses[selectedTicket.status]}`}
                  >
                    {supportTicketStatusLabels[selectedTicket.status]}
                  </span>
                  {selectedTicket.status === "CLOSED" ? (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => void updateTicketStatus("IN_PROGRESS")}
                      className="rounded border border-blue-500 px-3 py-1 text-xs font-semibold text-blue-200 transition hover:bg-blue-900/40 disabled:opacity-60"
                    >
                      {isUpdatingStatus ? "Atualizando..." : "Reabrir"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => void updateTicketStatus("CLOSED")}
                      className="rounded border border-red-500 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-900/30 disabled:opacity-60"
                    >
                      {isUpdatingStatus ? "Atualizando..." : "Fechar chamado"}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded border border-zinc-800 bg-[#121212] p-3 text-xs text-zinc-400">
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                  <p>
                    <span className="text-zinc-500">Última atividade:</span>{" "}
                    {formatDateTime(selectedTicket.lastMessageAt)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Primeira resposta:</span>{" "}
                    {formatDateTime(selectedTicket.firstResponseAt)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Resolvido em:</span>{" "}
                    {formatDateTime(selectedTicket.resolvedAt)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Fechado em:</span>{" "}
                    {formatDateTime(selectedTicket.closedAt)}
                  </p>
                </div>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-auto rounded border border-zinc-800 bg-[#101010] p-3">
                {selectedTicket.messages.map((message) => {
                  const fromAdmin = message.authorType === "ADMIN";
                  const fromSuperAdmin = message.authorType === "SUPERADMIN";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${fromAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-lg border px-3 py-2 text-sm ${
                          fromAdmin
                            ? "border-yellow-600/50 bg-yellow-900/25 text-yellow-100"
                            : fromSuperAdmin
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

              <div className="space-y-2">
                <label htmlFor="reply-message" className="text-xs font-semibold text-zinc-300">
                  Responder chamado
                </label>
                <textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  maxLength={4000}
                  disabled={selectedTicket.status === "CLOSED"}
                  placeholder="Escreva uma resposta para a equipe Fut7Pro..."
                  className="min-h-[120px] w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                />
                {selectedTicket.status === "CLOSED" && (
                  <p className="text-xs text-orange-300">
                    Este chamado está fechado. Reabra para enviar novas mensagens.
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void replyTicket()}
                    disabled={isReplying || selectedTicket.status === "CLOSED"}
                    className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                  >
                    <FaPaperPlane />
                    {isReplying ? "Enviando..." : "Enviar resposta"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </article>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-lg border border-zinc-700 bg-[#171717] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-yellow-300">Abrir novo chamado</h2>
                <p className="text-sm text-zinc-400">
                  Relate o contexto completo para acelerar o atendimento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="inline-flex items-center gap-1 rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <FaTimesCircle />
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="ticket-category" className="mb-1 block text-sm text-zinc-300">
                  Categoria
                </label>
                <select
                  id="ticket-category"
                  value={createForm.category}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      category: event.target.value as SupportTicketCategory,
                    }))
                  }
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                >
                  {categoryValues.map((category) => (
                    <option key={category} value={category}>
                      {supportTicketCategoryLabels[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ticket-subject" className="mb-1 block text-sm text-zinc-300">
                  Assunto
                </label>
                <input
                  id="ticket-subject"
                  value={createForm.subject}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  maxLength={120}
                  placeholder="Ex.: Erro ao salvar presença da partida"
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label htmlFor="ticket-message" className="mb-1 block text-sm text-zinc-300">
                  Descrição
                </label>
                <textarea
                  id="ticket-message"
                  value={createForm.message}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  maxLength={4000}
                  placeholder="Descreva o que aconteceu, impacto e passos para reproduzir."
                  className="min-h-[150px] w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void createTicket()}
                disabled={isCreating}
                className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
              >
                {isCreating ? <FaClock /> : <FaPlus />}
                {isCreating ? "Criando..." : "Criar chamado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
