"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaFilter,
  FaPaperPlane,
  FaSearch,
  FaTimesCircle,
  FaUserShield,
} from "react-icons/fa";

type AmbassadorSupportStatus =
  | "ABERTO"
  | "EM_ANALISE"
  | "AGUARDANDO_RETORNO_EMBAIXADOR"
  | "RESOLVIDO"
  | "ENCERRADO";

type AmbassadorSupportPriority = "NORMAL" | "ALTA" | "CRITICA";

type AmbassadorSupportMessage = {
  id: string;
  authorType: "EMBAIXADOR" | "SUPERADMIN";
  authorDisplay: string | null;
  message: string;
  createdAt: string;
};

type AmbassadorSupportTicket = {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerCoupon: string;
  contractualStatus: string;
  operationalStatus: string;
  financialStatus: string;
  panelAccessMode: string;
  title: string;
  category: string;
  priority: AmbassadorSupportPriority;
  status: AmbassadorSupportStatus;
  openedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  lastMessageAt: string;
  messages: AmbassadorSupportMessage[];
};

type AmbassadorSupportListResponse = {
  tickets?: AmbassadorSupportTicket[];
  contactEmail?: string;
  error?: string;
  message?: string;
};

type StatusPatchResponse = {
  ok?: boolean;
  ticket?: {
    id: string;
    status: AmbassadorSupportStatus;
    priority: AmbassadorSupportPriority;
    category: string;
    updatedAt: string;
    resolvedAt: string | null;
  };
  error?: string;
  message?: string;
};

const statusLabels: Record<AmbassadorSupportStatus, string> = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em análise",
  AGUARDANDO_RETORNO_EMBAIXADOR: "Aguardando embaixador",
  RESOLVIDO: "Resolvido",
  ENCERRADO: "Encerrado",
};

const statusClasses: Record<AmbassadorSupportStatus, string> = {
  ABERTO: "bg-sky-900/50 text-sky-200",
  EM_ANALISE: "bg-amber-900/50 text-amber-200",
  AGUARDANDO_RETORNO_EMBAIXADOR: "bg-violet-900/50 text-violet-200",
  RESOLVIDO: "bg-emerald-900/50 text-emerald-200",
  ENCERRADO: "bg-zinc-800 text-zinc-300",
};

const priorityLabels: Record<AmbassadorSupportPriority, string> = {
  NORMAL: "Normal",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const priorityClasses: Record<AmbassadorSupportPriority, string> = {
  NORMAL: "bg-zinc-800 text-zinc-200",
  ALTA: "bg-amber-900/50 text-amber-200",
  CRITICA: "bg-rose-900/50 text-rose-200",
};

const statusValues = Object.keys(statusLabels) as AmbassadorSupportStatus[];
const priorityValues = Object.keys(priorityLabels) as AmbassadorSupportPriority[];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function extractError(payload: unknown, fallback: string): string {
  if (!isObjectRecord(payload)) return fallback;

  const message = payload.message;
  if (Array.isArray(message)) {
    const compact = message
      .map((entry) => String(entry || "").trim())
      .filter(Boolean)
      .join(" | ");
    if (compact) return compact;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  const error = payload.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("pt-BR");
}

function messageAuthorLabel(message: AmbassadorSupportMessage): string {
  if (message.authorType === "SUPERADMIN") {
    return message.authorDisplay?.trim() || "Equipe Fut7Pro";
  }
  return message.authorDisplay?.trim() || "Embaixador";
}

function truncate(value: string, max = 135): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

export default function SuperAdminSuportePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AmbassadorSupportStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<AmbassadorSupportPriority | "ALL">("ALL");

  const [tickets, setTickets] = useState<AmbassadorSupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isListLoading, setIsListLoading] = useState(false);
  const [isApplyingStatus, setIsApplyingStatus] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<AmbassadorSupportStatus | "KEEP">(
    "AGUARDANDO_RETORNO_EMBAIXADOR"
  );

  const [statusDraft, setStatusDraft] = useState<AmbassadorSupportStatus>("EM_ANALISE");
  const [priorityDraft, setPriorityDraft] = useState<AmbassadorSupportPriority>("NORMAL");
  const [categoryDraft, setCategoryDraft] = useState("EMBAIXADORES");

  const loadTickets = useCallback(async () => {
    setIsListLoading(true);
    setPageError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);

      const response = await fetch(
        `/api/superadmin/embaixadores/support/tickets${
          params.toString() ? `?${params.toString()}` : ""
        }`,
        { cache: "no-store" }
      );
      const payload = (await response.json().catch(() => ({}))) as AmbassadorSupportListResponse;

      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível carregar os chamados."));
      }

      const list = Array.isArray(payload.tickets) ? payload.tickets : [];
      setTickets(list);

      if (list.length === 0) {
        setSelectedTicketId(null);
      } else if (!selectedTicketId || !list.some((ticket) => ticket.id === selectedTicketId)) {
        setSelectedTicketId(list[0].id);
      }
    } catch (error) {
      setTickets([]);
      setSelectedTicketId(null);
      setPageError(
        error instanceof Error ? error.message : "Erro inesperado ao carregar os chamados."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [priorityFilter, selectedTicketId, statusFilter]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;

    return tickets.filter((ticket) => {
      const haystack = [
        ticket.title,
        ticket.category,
        ticket.influencerName,
        ticket.influencerCoupon,
        ticket.messages.at(-1)?.message || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search, tickets]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [selectedTicketId, tickets]
  );

  useEffect(() => {
    if (!selectedTicket) return;
    setStatusDraft(selectedTicket.status === "ABERTO" ? "EM_ANALISE" : selectedTicket.status);
    setPriorityDraft(selectedTicket.priority);
    setCategoryDraft(selectedTicket.category || "EMBAIXADORES");
  }, [selectedTicket]);

  const stats = useMemo(() => {
    return {
      open: tickets.filter((ticket) => ticket.status === "ABERTO").length,
      inReview: tickets.filter((ticket) => ticket.status === "EM_ANALISE").length,
      waitingAmbassador: tickets.filter(
        (ticket) => ticket.status === "AGUARDANDO_RETORNO_EMBAIXADOR"
      ).length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVIDO").length,
      closed: tickets.filter((ticket) => ticket.status === "ENCERRADO").length,
    };
  }, [tickets]);

  const patchTicket = useCallback(async (ticketId: string, body: Record<string, unknown>) => {
    const response = await fetch(
      `/api/superadmin/embaixadores/support/tickets/${encodeURIComponent(ticketId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const payload = (await response.json().catch(() => ({}))) as StatusPatchResponse;
    if (!response.ok) {
      throw new Error(extractError(payload, "Não foi possível atualizar o chamado."));
    }

    return payload;
  }, []);

  async function applyStatusChanges() {
    if (!selectedTicket) return;

    setIsApplyingStatus(true);
    setPageError(null);
    setFeedback(null);

    try {
      await patchTicket(selectedTicket.id, {
        status: statusDraft,
        priority: priorityDraft,
        category: categoryDraft.trim() || selectedTicket.category,
      });

      setFeedback({ success: true, message: "Status do chamado atualizado com sucesso." });
      await loadTickets();
    } catch (error) {
      setFeedback({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao atualizar status.",
      });
    } finally {
      setIsApplyingStatus(false);
    }
  }

  async function sendReply() {
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
      await patchTicket(selectedTicket.id, {
        message,
        status: replyStatus === "KEEP" ? undefined : replyStatus,
      });

      setReplyMessage("");
      setReplyStatus("AGUARDANDO_RETORNO_EMBAIXADOR");
      setFeedback({ success: true, message: "Resposta enviada para o embaixador." });
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

  return (
    <div className="space-y-5">
      <header className="space-y-3 rounded-lg border border-zinc-800 bg-[#171717] p-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-yellow-300">
          <FaUserShield />
          Suporte oficial dos embaixadores
        </h1>
        <p className="text-sm text-zinc-300">
          Monitore chamados abertos no painel do embaixador, responda direto da fila oficial e
          mantenha o histórico sincronizado entre as duas pontas.
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Abertos</p>
            <p className="text-xl font-semibold text-sky-300">{stats.open}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Em análise</p>
            <p className="text-xl font-semibold text-amber-300">{stats.inReview}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Aguardando retorno</p>
            <p className="text-xl font-semibold text-violet-300">{stats.waitingAmbassador}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Resolvidos</p>
            <p className="text-xl font-semibold text-emerald-300">{stats.resolved}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Encerrados</p>
            <p className="text-xl font-semibold text-zinc-300">{stats.closed}</p>
          </div>
        </div>
      </header>

      <section className="space-y-3 rounded-lg border border-zinc-800 bg-[#171717] p-4">
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
              placeholder="Buscar por embaixador, cupom ou mensagem..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as AmbassadorSupportStatus | "ALL")
            }
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todos os status</option>
            {statusValues.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as AmbassadorSupportPriority | "ALL")
            }
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todas as prioridades</option>
            {priorityValues.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>
      </section>

      {pageError ? (
        <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          {pageError}
        </div>
      ) : null}

      {feedback ? (
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
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[390px_1fr]">
        <article className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Chamados do programa
            </h2>
            <span className="text-xs text-zinc-500">{filteredTickets.length} itens</span>
          </div>

          {isListLoading ? (
            <p className="py-8 text-center text-sm text-zinc-400">Carregando chamados...</p>
          ) : filteredTickets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Nenhum chamado encontrado.</p>
          ) : (
            <div className="max-h-[75vh] space-y-3 overflow-auto pr-1">
              {filteredTickets.map((ticket) => {
                const lastMessage =
                  ticket.messages[ticket.messages.length - 1]?.message || "Sem mensagens ainda.";
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full rounded border px-3 py-3 text-left transition ${
                      selectedTicketId === ticket.id
                        ? "border-yellow-400 bg-yellow-500/10"
                        : "border-zinc-700 bg-[#1f1f1f] hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-zinc-100">{ticket.title}</p>
                      <span
                        className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ${statusClasses[ticket.status]}`}
                      >
                        {statusLabels[ticket.status]}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-400">
                      {ticket.influencerName} • Cupom {ticket.influencerCoupon}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {ticket.category} • Aberto em {formatDateTime(ticket.openedAt)}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-semibold ${priorityClasses[ticket.priority]}`}
                      >
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
                        {ticket.panelAccessMode}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-300">{truncate(lastMessage)}</p>

                    <p className="mt-2 text-xs text-zinc-500">
                      Última atividade: {formatDateTime(ticket.lastMessageAt)} •{" "}
                      {ticket.messages.length} mensagem(ns)
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
          {!selectedTicket ? (
            <div className="flex h-full min-h-[460px] items-center justify-center text-sm text-zinc-400">
              Selecione um chamado para acompanhar o histórico e responder.
            </div>
          ) : (
            <div className="space-y-4">
              <header className="space-y-2 border-b border-zinc-800 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300">
                      {selectedTicket.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {selectedTicket.influencerName} • Cupom {selectedTicket.influencerCoupon}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${statusClasses[selectedTicket.status]}`}
                  >
                    {statusLabels[selectedTicket.status]}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Categoria: {selectedTicket.category} • Prioridade:{" "}
                  {priorityLabels[selectedTicket.priority]}
                </p>
                <p className="text-xs text-zinc-500">
                  Aberto em {formatDateTime(selectedTicket.openedAt)} • Última atividade:{" "}
                  {formatDateTime(selectedTicket.lastMessageAt)}
                </p>
              </header>

              <div className="grid grid-cols-1 gap-3 rounded border border-zinc-800 bg-[#121212] p-3 md:grid-cols-[220px_220px_1fr_auto] md:items-end">
                <div>
                  <label
                    htmlFor="status-draft"
                    className="mb-1 block text-xs font-semibold text-zinc-300"
                  >
                    Status
                  </label>
                  <select
                    id="status-draft"
                    value={statusDraft}
                    onChange={(event) =>
                      setStatusDraft(event.target.value as AmbassadorSupportStatus)
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  >
                    {statusValues.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority-draft"
                    className="mb-1 block text-xs font-semibold text-zinc-300"
                  >
                    Prioridade
                  </label>
                  <select
                    id="priority-draft"
                    value={priorityDraft}
                    onChange={(event) =>
                      setPriorityDraft(event.target.value as AmbassadorSupportPriority)
                    }
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  >
                    {priorityValues.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="category-draft"
                    className="mb-1 block text-xs font-semibold text-zinc-300"
                  >
                    Categoria
                  </label>
                  <input
                    id="category-draft"
                    value={categoryDraft}
                    onChange={(event) => setCategoryDraft(event.target.value)}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void applyStatusChanges()}
                  disabled={isApplyingStatus}
                  className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {isApplyingStatus ? "Salvando..." : "Salvar status"}
                </button>
              </div>

              <div className="max-h-[330px] space-y-3 overflow-auto rounded border border-zinc-800 bg-[#101010] p-3">
                {selectedTicket.messages.map((message) => {
                  const fromSuperAdmin = message.authorType === "SUPERADMIN";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${fromSuperAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-lg border px-3 py-2 text-sm ${
                          fromSuperAdmin
                            ? "border-emerald-600/50 bg-emerald-900/25 text-emerald-100"
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
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
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
                        setReplyStatus(event.target.value as AmbassadorSupportStatus | "KEEP")
                      }
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    >
                      <option value="KEEP">Manter status atual</option>
                      {statusValues.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="reply-message"
                      className="mb-1 block text-xs font-semibold text-zinc-300"
                    >
                      Resposta para o embaixador
                    </label>
                    <textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      maxLength={4000}
                      placeholder="Digite a orientação da equipe Fut7Pro para o embaixador..."
                      className="min-h-[120px] w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void sendReply()}
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
