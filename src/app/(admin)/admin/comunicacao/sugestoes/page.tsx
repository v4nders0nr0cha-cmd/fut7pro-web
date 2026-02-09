"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaPaperPlane, FaRegCommentDots, FaSearch } from "react-icons/fa";

type SuggestionCategory =
  | "PLATFORM_IMPROVEMENT"
  | "BUG_REPORT"
  | "QUESTION"
  | "RACHA_IDEA"
  | "FINANCE_SPONSORSHIP"
  | "OTHER";

type SuggestionStatus =
  | "RECEIVED"
  | "READ_BY_ADMIN"
  | "FORWARDED"
  | "READ_BY_FUT7PRO"
  | "IN_REVIEW"
  | "PLANNED"
  | "DONE"
  | "REJECTED";

type SuggestionTarget = "TENANT_ADMIN" | "FUT7PRO_TEAM";
type SuggestionCreatedByType = "ATHLETE" | "ADMIN";

type SuggestionItem = {
  id: string;
  createdByType: SuggestionCreatedByType;
  category: SuggestionCategory;
  target: SuggestionTarget;
  status: SuggestionStatus;
  message: string;
  forwardNote?: string | null;
  superAdminResponse?: string | null;
  createdAt: string;
  adminReadAt?: string | null;
  forwardedAt?: string | null;
  athlete?: {
    id: string;
    name: string;
    nickname?: string | null;
  } | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

const categoryLabels: Record<SuggestionCategory, string> = {
  PLATFORM_IMPROVEMENT: "Melhoria da plataforma",
  BUG_REPORT: "Informar bug",
  QUESTION: "Dúvida",
  RACHA_IDEA: "Ideia para o racha",
  FINANCE_SPONSORSHIP: "Financeiro e patrocínios",
  OTHER: "Outro",
};

const statusLabels: Record<SuggestionStatus, string> = {
  RECEIVED: "Recebida pelo admin",
  READ_BY_ADMIN: "Lida pelo admin",
  FORWARDED: "Encaminhada",
  READ_BY_FUT7PRO: "Lida pela equipe Fut7Pro",
  IN_REVIEW: "Em avaliação",
  PLANNED: "Planejada",
  DONE: "Concluída",
  REJECTED: "Rejeitada",
};

const statusStyles: Record<SuggestionStatus, string> = {
  RECEIVED: "bg-zinc-700 text-zinc-100",
  READ_BY_ADMIN: "bg-blue-900/60 text-blue-200",
  FORWARDED: "bg-yellow-900/60 text-yellow-200",
  READ_BY_FUT7PRO: "bg-sky-900/60 text-sky-200",
  IN_REVIEW: "bg-orange-900/60 text-orange-200",
  PLANNED: "bg-purple-900/60 text-purple-200",
  DONE: "bg-emerald-900/60 text-emerald-200",
  REJECTED: "bg-red-900/60 text-red-200",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("pt-BR");
}

function resolveResults(payload: unknown): SuggestionItem[] {
  if (Array.isArray(payload)) return payload as SuggestionItem[];
  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload &&
    Array.isArray((payload as { results: unknown }).results)
  ) {
    return (payload as { results: SuggestionItem[] }).results;
  }
  return [];
}

type TabKey = "received" | "sent";

export default function SugestoesAdminPage() {
  const [tab, setTab] = useState<TabKey>("received");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SuggestionStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | SuggestionCategory>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const [selected, setSelected] = useState<SuggestionItem | null>(null);

  const [forwarding, setForwarding] = useState<SuggestionItem | null>(null);
  const [forwardNote, setForwardNote] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeCategory, setComposeCategory] =
    useState<SuggestionCategory>("PLATFORM_IMPROVEMENT");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeError, setComposeError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "300" });
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);

      const response = await fetch(`/api/admin/suggestions?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível carregar as sugestões."
        );
      }
      setSuggestions(resolveResults(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar sugestões.");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const receivedFromAthletes = useMemo(
    () => suggestions.filter((item) => item.createdByType === "ATHLETE"),
    [suggestions]
  );

  const sentToFut7Pro = useMemo(
    () => suggestions.filter((item) => item.target === "FUT7PRO_TEAM"),
    [suggestions]
  );

  const list = tab === "received" ? receivedFromAthletes : sentToFut7Pro;

  async function markAsRead(item: SuggestionItem) {
    try {
      const response = await fetch(`/api/admin/suggestions/${item.id}/read`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível marcar como lida."
        );
      }
      await loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao marcar sugestão como lida.");
    }
  }

  async function submitForward() {
    if (!forwarding) return;
    setIsForwarding(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/suggestions/${forwarding.id}/forward`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forwardNote: forwardNote.trim() || undefined }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível encaminhar a sugestão."
        );
      }

      setForwarding(null);
      setForwardNote("");
      await loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao encaminhar sugestão.");
    } finally {
      setIsForwarding(false);
    }
  }

  async function submitCompose() {
    const normalized = composeMessage.trim();
    if (normalized.length < 10) {
      setComposeError("Digite uma mensagem com pelo menos 10 caracteres.");
      return;
    }

    setIsComposing(true);
    setComposeError(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: composeCategory,
          message: normalized,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível enviar a sugestão."
        );
      }

      setIsComposeOpen(false);
      setComposeMessage("");
      setComposeCategory("PLATFORM_IMPROVEMENT");
      setTab("sent");
      await loadSuggestions();
    } catch (err) {
      setComposeError(err instanceof Error ? err.message : "Erro ao enviar sugestão.");
    } finally {
      setIsComposing(false);
    }
  }

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <FaRegCommentDots className="text-2xl" /> Sugestões e Feedback
      </h1>

      <div className="mb-6 rounded-lg bg-[#232323] border-l-4 border-yellow-400 p-4 text-sm text-zinc-200">
        <p className="font-semibold text-yellow-300">
          Central do racha e canal com a equipe Fut7Pro.
        </p>
        <p className="mt-1">
          Aqui chegam as sugestões dos atletas do seu racha. Você pode marcar como lida, responder
          internamente e encaminhar as melhores para a equipe Fut7Pro. Quando a equipe ler ou
          atualizar o status, essa informação aparece para você e para o atleta.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar sugestões
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por palavra, autor ou data..."
              className="w-full rounded border border-zinc-600 bg-[#181818] py-2 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          className="rounded border border-zinc-600 bg-[#181818] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
        >
          <option value="ALL">Todos os status</option>
          {(Object.keys(statusLabels) as SuggestionStatus[]).map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)}
          className="rounded border border-zinc-600 bg-[#181818] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
        >
          <option value="ALL">Todos os assuntos</option>
          {(Object.keys(categoryLabels) as SuggestionCategory[]).map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setIsComposeOpen(true)}
          className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 transition"
        >
          <FaPaperPlane />
          Enviar sugestão à equipe Fut7Pro
        </button>
      </div>

      <div className="mb-5 inline-flex rounded-lg border border-zinc-700 bg-[#161616] p-1">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
            tab === "received" ? "bg-yellow-400 text-black" : "text-zinc-300 hover:text-white"
          }`}
        >
          Recebidas dos atletas
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
            tab === "sent" ? "bg-yellow-400 text-black" : "text-zinc-300 hover:text-white"
          }`}
        >
          Enviadas ao Fut7Pro
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-zinc-400">Carregando sugestões...</div>
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-zinc-700 bg-[#181818] p-4 text-sm text-zinc-400">
          Nenhuma sugestão encontrada para este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((item) => {
            const author =
              item.createdByType === "ATHLETE"
                ? item.athlete?.nickname || item.athlete?.name || "Atleta"
                : "Admin do racha";

            return (
              <article key={item.id} className="rounded-lg border border-zinc-700 bg-[#202020] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-yellow-300">{author}</p>
                    <p className="text-xs text-zinc-400">{formatDate(item.createdAt)}</p>
                  </div>
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>

                <p className="mb-2 text-xs text-zinc-400">{categoryLabels[item.category]}</p>
                <p className="text-sm text-zinc-100 whitespace-pre-wrap line-clamp-4">
                  {item.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="rounded border border-zinc-600 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition"
                  >
                    Ver detalhes
                  </button>

                  {tab === "received" && !item.adminReadAt && (
                    <button
                      type="button"
                      onClick={() => markAsRead(item)}
                      className="inline-flex items-center gap-1 rounded bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600 transition"
                    >
                      <FaCheckCircle />
                      Marcar como lida
                    </button>
                  )}

                  {tab === "received" && !item.forwardedAt && (
                    <button
                      type="button"
                      onClick={() => setForwarding(item)}
                      className="inline-flex items-center gap-1 rounded bg-yellow-600 px-3 py-1 text-xs font-semibold text-black hover:bg-yellow-500 transition"
                    >
                      <FaPaperPlane />
                      Encaminhar para Fut7Pro
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-lg border border-zinc-700 bg-[#171717] p-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-yellow-300">Detalhes da sugestão</h2>
                <p className="text-xs text-zinc-400">
                  {formatDate(selected.createdAt)} • {categoryLabels[selected.category]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-zinc-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="mb-4">
              <span
                className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusStyles[selected.status]}`}
              >
                {statusLabels[selected.status]}
              </span>
            </div>

            <p className="text-sm text-zinc-100 whitespace-pre-wrap">{selected.message}</p>

            {selected.forwardNote && (
              <div className="mt-4 rounded border border-yellow-700/50 bg-yellow-900/20 p-3">
                <p className="text-xs font-semibold text-yellow-300 mb-1">Comentário do admin</p>
                <p className="text-sm text-yellow-100 whitespace-pre-wrap">
                  {selected.forwardNote}
                </p>
              </div>
            )}

            {selected.superAdminResponse && (
              <div className="mt-4 rounded border border-emerald-700/50 bg-emerald-900/20 p-3">
                <p className="text-xs font-semibold text-emerald-300 mb-1">
                  Resposta da equipe Fut7Pro
                </p>
                <p className="text-sm text-emerald-100 whitespace-pre-wrap">
                  {selected.superAdminResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {forwarding && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-zinc-700 bg-[#171717] p-5">
            <h2 className="text-lg font-semibold text-yellow-300 mb-2">Encaminhar para Fut7Pro</h2>
            <p className="text-sm text-zinc-300 mb-3">
              Opcionalmente, adicione um comentário para contextualizar a sugestão.
            </p>
            <textarea
              value={forwardNote}
              onChange={(event) => setForwardNote(event.target.value)}
              placeholder="Comentário opcional..."
              maxLength={500}
              className="w-full min-h-[110px] rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setForwarding(null);
                  setForwardNote("");
                }}
                className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 transition"
                disabled={isForwarding}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitForward}
                className="rounded bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-300 transition disabled:opacity-60"
                disabled={isForwarding}
              >
                {isForwarding ? "Enviando..." : "Encaminhar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-zinc-700 bg-[#171717] p-5">
            <h2 className="text-lg font-semibold text-yellow-300 mb-2">
              Enviar sugestão à equipe Fut7Pro
            </h2>

            <label htmlFor="compose-category" className="block text-sm text-zinc-300 mb-1">
              Assunto
            </label>
            <select
              id="compose-category"
              value={composeCategory}
              onChange={(event) => setComposeCategory(event.target.value as SuggestionCategory)}
              className="mb-3 w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            >
              {(Object.keys(categoryLabels) as SuggestionCategory[]).map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>

            <label htmlFor="compose-message" className="block text-sm text-zinc-300 mb-1">
              Mensagem
            </label>
            <textarea
              id="compose-message"
              value={composeMessage}
              onChange={(event) => setComposeMessage(event.target.value)}
              placeholder="Descreva sua sugestão para o Fut7Pro..."
              maxLength={2000}
              className="w-full min-h-[130px] rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />

            {composeError && <p className="mt-2 text-sm text-red-300">{composeError}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsComposeOpen(false);
                  setComposeError(null);
                }}
                className="rounded border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 transition"
                disabled={isComposing}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitCompose}
                className="rounded bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-300 transition disabled:opacity-60"
                disabled={isComposing}
              >
                {isComposing ? "Enviando..." : "Enviar sugestão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
