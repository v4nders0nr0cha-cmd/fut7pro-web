"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaFilter,
  FaPaperPlane,
  FaSearch,
  FaTimesCircle,
  FaTools,
} from "react-icons/fa";
import type {
  SupportTicketDetail,
  SupportTicketItem,
  SupportTicketStatus,
} from "@/types/support-ticket";
import { supportTicketStatusLabels } from "@/types/support-ticket";

type SupportOrigin = "EMBAIXADOR" | "ADMIN_RACHA";

type AmbassadorSupportStatus =
  | "ABERTO"
  | "EM_ANALISE"
  | "AGUARDANDO_RETORNO_EMBAIXADOR"
  | "RESOLVIDO"
  | "ENCERRADO";

type AmbassadorSupportPriority = "NORMAL" | "ALTA" | "CRITICA";

type UnifiedSupportMessage = {
  id: string;
  authorType: "EMBAIXADOR" | "SUPERADMIN" | "ADMIN_RACHA" | "SISTEMA";
  authorDisplay: string | null;
  message: string;
  createdAt: string;
};

type UnifiedSupportStatus = AmbassadorSupportStatus | SupportTicketStatus;
type UnifiedSupportPriority = AmbassadorSupportPriority | "N/A";

type UnifiedSupportTicket = {
  id: string;
  origin: SupportOrigin;
  influencerName?: string | null;
  influencerCoupon?: string | null;
  tenantName?: string | null;
  tenantSlug?: string | null;
  tenantId?: string | null;
  title: string;
  category: string;
  priority: UnifiedSupportPriority;
  status: UnifiedSupportStatus;
  openedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  lastMessageAt: string;
  messages: UnifiedSupportMessage[];
};

type AmbassadorSupportListResponse = {
  tickets?: Array<{
    id: string;
    influencerName: string;
    influencerCoupon: string;
    title: string;
    category: string;
    priority: AmbassadorSupportPriority;
    status: AmbassadorSupportStatus;
    openedAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    lastMessageAt: string;
    messages: Array<{
      id: string;
      authorType: "EMBAIXADOR" | "SUPERADMIN";
      authorDisplay: string | null;
      message: string;
      createdAt: string;
    }>;
  }>;
  error?: string;
  message?: string;
};

type AdminSupportListResponse = {
  results?: SupportTicketItem[];
  error?: string;
  message?: string;
};

type PatchResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
};

const ambassadorStatusLabels: Record<AmbassadorSupportStatus, string> = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em análise",
  AGUARDANDO_RETORNO_EMBAIXADOR: "Aguardando embaixador",
  RESOLVIDO: "Resolvido",
  ENCERRADO: "Encerrado",
};

const ambassadorStatusClasses: Record<AmbassadorSupportStatus, string> = {
  ABERTO: "bg-sky-900/50 text-sky-200",
  EM_ANALISE: "bg-amber-900/50 text-amber-200",
  AGUARDANDO_RETORNO_EMBAIXADOR: "bg-violet-900/50 text-violet-200",
  RESOLVIDO: "bg-emerald-900/50 text-emerald-200",
  ENCERRADO: "bg-zinc-800 text-zinc-300",
};

const adminStatusClasses: Record<SupportTicketStatus, string> = {
  OPEN: "bg-sky-900/50 text-sky-200",
  IN_PROGRESS: "bg-amber-900/50 text-amber-200",
  WAITING_ADMIN: "bg-violet-900/50 text-violet-200",
  RESOLVED: "bg-emerald-900/50 text-emerald-200",
  CLOSED: "bg-zinc-800 text-zinc-300",
};

const priorityLabels: Record<UnifiedSupportPriority, string> = {
  NORMAL: "Normal",
  ALTA: "Alta",
  CRITICA: "Crítica",
  "N/A": "Não aplicável",
};

const priorityClasses: Record<UnifiedSupportPriority, string> = {
  NORMAL: "bg-zinc-800 text-zinc-200",
  ALTA: "bg-amber-900/50 text-amber-200",
  CRITICA: "bg-rose-900/50 text-rose-200",
  "N/A": "bg-zinc-900 text-zinc-400",
};

const adminStatusValues = Object.keys(supportTicketStatusLabels) as SupportTicketStatus[];
const ambassadorStatusValues = Object.keys(ambassadorStatusLabels) as AmbassadorSupportStatus[];
const priorityValues = Object.keys(priorityLabels) as UnifiedSupportPriority[];
const ambassadorPriorityValues = ["NORMAL", "ALTA", "CRITICA"] as const;

function ticketKey(input: Pick<UnifiedSupportTicket, "id" | "origin">): string {
  return `${input.origin}:${input.id}`;
}

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

function isAdminStatus(value: string): value is SupportTicketStatus {
  return adminStatusValues.includes(value as SupportTicketStatus);
}

function statusLabel(status: UnifiedSupportStatus): string {
  if (isAdminStatus(status)) return supportTicketStatusLabels[status];
  return ambassadorStatusLabels[status];
}

function statusClass(status: UnifiedSupportStatus): string {
  if (isAdminStatus(status)) return adminStatusClasses[status];
  return ambassadorStatusClasses[status];
}

function messageAuthorLabel(message: UnifiedSupportMessage): string {
  if (message.authorType === "SUPERADMIN") return message.authorDisplay?.trim() || "Equipe Fut7Pro";
  if (message.authorType === "ADMIN_RACHA")
    return message.authorDisplay?.trim() || "Admin do racha";
  if (message.authorType === "SISTEMA") return "Sistema";
  return message.authorDisplay?.trim() || "Embaixador";
}

function truncate(value: string, max = 135): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

function mapAdminTicket(item: SupportTicketItem): UnifiedSupportTicket {
  const lastMessage = item.lastMessage?.message || "Sem mensagens ainda.";
  return {
    id: item.id,
    origin: "ADMIN_RACHA",
    tenantId: item.tenantId,
    tenantName: item.tenant?.name || null,
    tenantSlug: item.tenant?.slug || null,
    title: item.subject,
    category: item.category,
    priority: "N/A",
    status: item.status,
    openedAt: item.createdAt,
    updatedAt: item.updatedAt,
    resolvedAt: item.resolvedAt || null,
    lastMessageAt: item.lastMessageAt,
    messages: [
      {
        id: item.lastMessage?.id || `preview-${item.id}`,
        authorType:
          item.lastMessage?.authorType === "SUPERADMIN"
            ? "SUPERADMIN"
            : item.lastMessage?.authorType === "ADMIN"
              ? "ADMIN_RACHA"
              : "SISTEMA",
        authorDisplay:
          item.lastMessage?.authorUser?.name || item.lastMessage?.authorUser?.email || "Sistema",
        message: lastMessage,
        createdAt: item.lastMessage?.createdAt || item.lastMessageAt,
      },
    ],
  };
}

function mapAdminDetail(item: SupportTicketDetail): UnifiedSupportTicket {
  return {
    ...mapAdminTicket(item),
    messages: (item.messages || []).map((message) => ({
      id: message.id,
      authorType:
        message.authorType === "SUPERADMIN"
          ? "SUPERADMIN"
          : message.authorType === "ADMIN"
            ? "ADMIN_RACHA"
            : "SISTEMA",
      authorDisplay: message.authorUser?.name || message.authorUser?.email || null,
      message: message.message,
      createdAt: message.createdAt,
    })),
  };
}

export default function SuperAdminSuportePage() {
  const [originFilter, setOriginFilter] = useState<SupportOrigin | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UnifiedSupportStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<UnifiedSupportPriority | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [tenantFilter, setTenantFilter] = useState("");

  const [tickets, setTickets] = useState<UnifiedSupportTicket[]>([]);
  const [selectedTicketKey, setSelectedTicketKey] = useState<string | null>(null);
  const [adminDetails, setAdminDetails] = useState<Record<string, UnifiedSupportTicket>>({});

  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isApplyingStatus, setIsApplyingStatus] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<UnifiedSupportStatus | "KEEP">(
    "AGUARDANDO_RETORNO_EMBAIXADOR"
  );

  const [statusDraft, setStatusDraft] = useState<UnifiedSupportStatus>("EM_ANALISE");
  const [priorityDraft, setPriorityDraft] = useState<AmbassadorSupportPriority>("NORMAL");
  const [categoryDraft, setCategoryDraft] = useState("EMBAIXADORES");
  const [statusNoteDraft, setStatusNoteDraft] = useState("");

  const loadTickets = useCallback(async () => {
    setIsListLoading(true);
    setPageError(null);

    try {
      const adminParams = new URLSearchParams({ limit: "100", page: "1" });
      if (search.trim()) adminParams.set("q", search.trim());
      if (tenantFilter.trim()) adminParams.set("tenantId", tenantFilter.trim());
      if (statusFilter !== "ALL" && isAdminStatus(statusFilter))
        adminParams.set("status", statusFilter);
      if (categoryFilter !== "ALL") adminParams.set("category", categoryFilter);

      const ambassadorParams = new URLSearchParams();
      if (statusFilter !== "ALL" && !isAdminStatus(statusFilter)) {
        ambassadorParams.set("status", statusFilter);
      }
      if (priorityFilter !== "ALL" && priorityFilter !== "N/A") {
        ambassadorParams.set("priority", priorityFilter);
      }

      const [adminResponse, ambassadorResponse] = await Promise.all([
        fetch(`/api/superadmin/support/tickets?${adminParams.toString()}`, { cache: "no-store" }),
        fetch(
          `/api/superadmin/embaixadores/support/tickets${
            ambassadorParams.toString() ? `?${ambassadorParams.toString()}` : ""
          }`,
          { cache: "no-store" }
        ),
      ]);

      const adminPayload = (await adminResponse
        .json()
        .catch(() => ({}))) as AdminSupportListResponse;
      const ambassadorPayload = (await ambassadorResponse
        .json()
        .catch(() => ({}))) as AmbassadorSupportListResponse;

      if (!adminResponse.ok) {
        throw new Error(
          extractError(adminPayload, "Não foi possível carregar chamados dos rachas.")
        );
      }
      if (!ambassadorResponse.ok) {
        throw new Error(
          extractError(ambassadorPayload, "Não foi possível carregar chamados dos embaixadores.")
        );
      }

      const adminTickets = Array.isArray(adminPayload.results)
        ? adminPayload.results.map(mapAdminTicket)
        : [];
      const ambassadorTickets = Array.isArray(ambassadorPayload.tickets)
        ? ambassadorPayload.tickets.map((ticket) => ({
            id: ticket.id,
            origin: "EMBAIXADOR" as const,
            influencerName: ticket.influencerName,
            influencerCoupon: ticket.influencerCoupon,
            title: ticket.title,
            category: ticket.category,
            priority: ticket.priority,
            status: ticket.status,
            openedAt: ticket.openedAt,
            updatedAt: ticket.updatedAt,
            resolvedAt: ticket.resolvedAt,
            lastMessageAt: ticket.lastMessageAt,
            messages: (ticket.messages || []).map((message) => ({
              id: message.id,
              authorType: message.authorType,
              authorDisplay: message.authorDisplay,
              message: message.message,
              createdAt: message.createdAt,
            })),
          }))
        : [];

      const list = [...ambassadorTickets, ...adminTickets].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      setTickets(list);

      if (list.length === 0) {
        setSelectedTicketKey(null);
      } else if (
        !selectedTicketKey ||
        !list.some((ticket) => ticketKey(ticket) === selectedTicketKey)
      ) {
        setSelectedTicketKey(ticketKey(list[0]));
      }
    } catch (error) {
      setTickets([]);
      setSelectedTicketKey(null);
      setPageError(
        error instanceof Error ? error.message : "Erro inesperado ao carregar os chamados."
      );
    } finally {
      setIsListLoading(false);
    }
  }, [categoryFilter, priorityFilter, search, selectedTicketKey, statusFilter, tenantFilter]);

  const loadAdminDetail = useCallback(
    async (input: Pick<UnifiedSupportTicket, "id" | "origin">) => {
      const key = ticketKey(input);
      setIsDetailLoading(true);
      try {
        const response = await fetch(
          `/api/superadmin/support/tickets/${encodeURIComponent(input.id)}`,
          {
            cache: "no-store",
          }
        );
        const payload = (await response.json().catch(() => ({}))) as SupportTicketDetail;
        if (!response.ok) {
          throw new Error(
            extractError(payload, "Não foi possível carregar os detalhes do chamado.")
          );
        }
        setAdminDetails((prev) => ({ ...prev, [key]: mapAdminDetail(payload) }));
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Erro ao abrir o chamado.");
      } finally {
        setIsDetailLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (originFilter !== "ALL" && ticket.origin !== originFilter) return false;
      if (statusFilter !== "ALL" && ticket.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && ticket.priority !== priorityFilter) return false;
      if (categoryFilter !== "ALL" && ticket.category !== categoryFilter) return false;
      if (tenantFilter.trim()) {
        const tenantQuery = tenantFilter.trim().toLowerCase();
        const tenantContext =
          `${ticket.tenantName || ""} ${ticket.tenantSlug || ""} ${ticket.tenantId || ""}`
            .trim()
            .toLowerCase();
        if (!tenantContext.includes(tenantQuery)) return false;
      }
      if (!query) return true;
      const haystack = [
        ticket.title,
        ticket.category,
        ticket.influencerName || "",
        ticket.influencerCoupon || "",
        ticket.tenantName || "",
        ticket.tenantSlug || "",
        ticket.messages.at(-1)?.message || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [categoryFilter, originFilter, priorityFilter, search, statusFilter, tenantFilter, tickets]);

  const selectedTicket = useMemo(() => {
    const ticket = tickets.find((item) => ticketKey(item) === selectedTicketKey) || null;
    if (!ticket) return null;
    const key = ticketKey(ticket);
    if (ticket.origin === "ADMIN_RACHA" && adminDetails[key]) {
      return adminDetails[key];
    }
    return ticket;
  }, [adminDetails, selectedTicketKey, tickets]);

  useEffect(() => {
    if (!selectedTicketKey) return;
    const summary = tickets.find((ticket) => ticketKey(ticket) === selectedTicketKey);
    if (!summary || summary.origin !== "ADMIN_RACHA") return;
    const key = ticketKey(summary);
    if (adminDetails[key]) return;
    void loadAdminDetail(summary);
  }, [adminDetails, loadAdminDetail, selectedTicketKey, tickets]);

  useEffect(() => {
    if (!selectedTicket) return;
    setStatusDraft(selectedTicket.status);
    setPriorityDraft(selectedTicket.priority === "N/A" ? "NORMAL" : selectedTicket.priority);
    setCategoryDraft(selectedTicket.category || "EMBAIXADORES");
    setStatusNoteDraft("");
  }, [selectedTicket]);

  const stats = useMemo(() => {
    return {
      open: tickets.filter((ticket) => ticket.status === "ABERTO" || ticket.status === "OPEN")
        .length,
      inReview: tickets.filter(
        (ticket) => ticket.status === "EM_ANALISE" || ticket.status === "IN_PROGRESS"
      ).length,
      waitingAmbassador: tickets.filter(
        (ticket) =>
          ticket.status === "AGUARDANDO_RETORNO_EMBAIXADOR" || ticket.status === "WAITING_ADMIN"
      ).length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "RESOLVIDO" || ticket.status === "RESOLVED"
      ).length,
      closed: tickets.filter(
        (ticket) => ticket.status === "ENCERRADO" || ticket.status === "CLOSED"
      ).length,
    };
  }, [tickets]);

  const patchAmbassadorTicket = useCallback(
    async (ticketId: string, body: Record<string, unknown>) => {
      const response = await fetch(
        `/api/superadmin/embaixadores/support/tickets/${encodeURIComponent(ticketId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const payload = (await response.json().catch(() => ({}))) as PatchResponse;
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível atualizar o chamado."));
      }

      return payload;
    },
    []
  );

  const patchAdminStatus = useCallback(
    async (ticketId: string, status: SupportTicketStatus, note?: string) => {
      const response = await fetch(
        `/api/superadmin/support/tickets/${encodeURIComponent(ticketId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note: note?.trim() || undefined }),
        }
      );

      const payload = (await response.json().catch(() => ({}))) as PatchResponse;
      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível atualizar o chamado."));
      }
      return payload;
    },
    []
  );

  async function applyStatusChanges() {
    if (!selectedTicket) return;

    setIsApplyingStatus(true);
    setPageError(null);
    setFeedback(null);

    try {
      if (selectedTicket.origin === "EMBAIXADOR") {
        await patchAmbassadorTicket(selectedTicket.id, {
          status: statusDraft,
          priority: priorityDraft,
          category: categoryDraft.trim() || selectedTicket.category,
        });
      } else {
        if (!isAdminStatus(statusDraft)) {
          throw new Error("Status inválido para chamado de admin do racha.");
        }
        await patchAdminStatus(selectedTicket.id, statusDraft, statusNoteDraft);
        await loadAdminDetail(selectedTicket);
      }

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
      if (selectedTicket.origin === "EMBAIXADOR") {
        await patchAmbassadorTicket(selectedTicket.id, {
          message,
          status: replyStatus === "KEEP" ? undefined : replyStatus,
        });
      } else {
        const response = await fetch(
          `/api/superadmin/support/tickets/${encodeURIComponent(selectedTicket.id)}/replies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              status:
                replyStatus !== "KEEP" && isAdminStatus(replyStatus) ? replyStatus : undefined,
            }),
          }
        );
        const payload = (await response.json().catch(() => ({}))) as PatchResponse;
        if (!response.ok) {
          throw new Error(extractError(payload, "Não foi possível enviar resposta."));
        }
        await loadAdminDetail(selectedTicket);
      }

      setReplyMessage("");
      setReplyStatus(
        selectedTicket.origin === "EMBAIXADOR" ? "AGUARDANDO_RETORNO_EMBAIXADOR" : "WAITING_ADMIN"
      );
      setFeedback({ success: true, message: "Resposta enviada com sucesso." });
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
          <FaTools />
          Central de suporte Fut7Pro
        </h1>
        <p className="text-sm text-zinc-300">
          Fila única multi-origem com chamados de embaixadores e admins dos rachas, mantendo
          atendimento centralizado no SuperAdmin.
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

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
          <select
            value={originFilter}
            onChange={(event) => setOriginFilter(event.target.value as SupportOrigin | "ALL")}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Origem: Todas</option>
            <option value="EMBAIXADOR">Origem: Embaixador</option>
            <option value="ADMIN_RACHA">Origem: Admin do racha</option>
          </select>

          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, cupom, slug ou mensagem..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as UnifiedSupportStatus | "ALL")
            }
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todos os status</option>
            <optgroup label="Admin do racha">
              {adminStatusValues.map((status) => (
                <option key={status} value={status}>
                  {supportTicketStatusLabels[status]}
                </option>
              ))}
            </optgroup>
            <optgroup label="Embaixador">
              {ambassadorStatusValues.map((status) => (
                <option key={status} value={status}>
                  {ambassadorStatusLabels[status]}
                </option>
              ))}
            </optgroup>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as UnifiedSupportPriority | "ALL")
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

          <input
            value={tenantFilter}
            onChange={(event) => setTenantFilter(event.target.value)}
            placeholder="Tenant / slug"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todas as categorias</option>
            {Array.from(new Set(tickets.map((ticket) => ticket.category)))
              .filter(Boolean)
              .map((category) => (
                <option key={category} value={category}>
                  {category}
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
              Fila central
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
                    onClick={() => setSelectedTicketKey(ticketKey(ticket))}
                    className={`w-full rounded border px-3 py-3 text-left transition ${
                      selectedTicketKey === ticketKey(ticket)
                        ? "border-yellow-400 bg-yellow-500/10"
                        : "border-zinc-700 bg-[#1f1f1f] hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-zinc-100">{ticket.title}</p>
                      <span
                        className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ${statusClass(ticket.status)}`}
                      >
                        {statusLabel(ticket.status)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-400">
                      Origem: {ticket.origin === "EMBAIXADOR" ? "Embaixador" : "Admin do racha"}
                      {ticket.influencerName ? ` • ${ticket.influencerName}` : ""}
                      {ticket.influencerCoupon ? ` • Cupom ${ticket.influencerCoupon}` : ""}
                      {ticket.tenantSlug
                        ? ` • ${ticket.tenantName || "Racha"} (${ticket.tenantSlug})`
                        : ""}
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
          ) : isDetailLoading && selectedTicket.origin === "ADMIN_RACHA" ? (
            <div className="flex h-full min-h-[460px] items-center justify-center text-sm text-zinc-400">
              Carregando histórico completo...
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
                      Origem:{" "}
                      {selectedTicket.origin === "EMBAIXADOR" ? "Embaixador" : "Admin do racha"}
                      {selectedTicket.influencerName ? ` • ${selectedTicket.influencerName}` : ""}
                      {selectedTicket.influencerCoupon
                        ? ` • Cupom ${selectedTicket.influencerCoupon}`
                        : ""}
                      {selectedTicket.tenantSlug
                        ? ` • ${selectedTicket.tenantName || "Racha"} (${selectedTicket.tenantSlug})`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(selectedTicket.status)}`}
                  >
                    {statusLabel(selectedTicket.status)}
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

              <div
                className={`grid grid-cols-1 gap-3 rounded border border-zinc-800 bg-[#121212] p-3 ${
                  selectedTicket.origin === "EMBAIXADOR"
                    ? "md:grid-cols-[220px_220px_1fr_auto] md:items-end"
                    : "md:grid-cols-[260px_1fr_auto] md:items-end"
                }`}
              >
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
                    onChange={(event) => setStatusDraft(event.target.value as UnifiedSupportStatus)}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  >
                    {(selectedTicket.origin === "EMBAIXADOR"
                      ? ambassadorStatusValues
                      : adminStatusValues
                    ).map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTicket.origin === "EMBAIXADOR" ? (
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
                      {ambassadorPriorityValues.map((priority) => (
                        <option key={priority} value={priority}>
                          {priorityLabels[priority]}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="status-note"
                      className="mb-1 block text-xs font-semibold text-zinc-300"
                    >
                      Observação interna (opcional)
                    </label>
                    <input
                      id="status-note"
                      value={statusNoteDraft}
                      onChange={(event) => setStatusNoteDraft(event.target.value)}
                      maxLength={300}
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                )}

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
                    disabled={selectedTicket.origin !== "EMBAIXADOR"}
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
                            : message.authorType === "EMBAIXADOR"
                              ? "border-blue-600/50 bg-blue-900/25 text-blue-100"
                              : message.authorType === "ADMIN_RACHA"
                                ? "border-violet-600/50 bg-violet-900/25 text-violet-100"
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
                        setReplyStatus(event.target.value as UnifiedSupportStatus | "KEEP")
                      }
                      className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    >
                      <option value="KEEP">Manter status atual</option>
                      {(selectedTicket.origin === "EMBAIXADOR"
                        ? ambassadorStatusValues
                        : adminStatusValues
                      ).map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="reply-message"
                      className="mb-1 block text-xs font-semibold text-zinc-300"
                    >
                      Resposta operacional
                    </label>
                    <textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(event) => setReplyMessage(event.target.value)}
                      maxLength={4000}
                      placeholder={
                        selectedTicket.origin === "EMBAIXADOR"
                          ? "Digite a orientação da equipe Fut7Pro para o embaixador..."
                          : "Digite a orientação da equipe Fut7Pro para o admin do racha..."
                      }
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
