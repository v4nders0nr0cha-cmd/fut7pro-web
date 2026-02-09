"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

type SuggestionCreatedByType = "ATHLETE" | "ADMIN";

type SuggestionItem = {
  id: string;
  tenantId: string;
  createdByType: SuggestionCreatedByType;
  category: SuggestionCategory;
  status: SuggestionStatus;
  target: "TENANT_ADMIN" | "FUT7PRO_TEAM";
  message: string;
  forwardNote?: string | null;
  superAdminResponse?: string | null;
  createdAt: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  athlete?: {
    id: string;
    name: string;
    nickname?: string | null;
  } | null;
  adminUser?: {
    id: string;
    name: string;
    email?: string | null;
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

const updatableStatuses: SuggestionStatus[] = ["IN_REVIEW", "PLANNED", "DONE", "REJECTED"];

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

export default function SuperAdminSugestoesPage() {
  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SuggestionStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | SuggestionCategory>("ALL");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const [selected, setSelected] = useState<SuggestionItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusDraft, setStatusDraft] = useState<SuggestionStatus>("IN_REVIEW");
  const [responseDraft, setResponseDraft] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingResponse, setIsSendingResponse] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "300" });
      if (search.trim()) params.set("q", search.trim());
      if (tenantFilter.trim()) params.set("tenantId", tenantFilter.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);

      const response = await fetch(`/api/superadmin/suggestions?${params.toString()}`, {
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
  }, [search, tenantFilter, statusFilter, categoryFilter]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const openSuggestion = useCallback(
    async (id: string) => {
      setIsLoadingDetail(true);
      setError(null);

      try {
        const response = await fetch(`/api/superadmin/suggestions/${id}`, {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            (payload as { message?: string; error?: string })?.message ||
              (payload as { message?: string; error?: string })?.error ||
              "Não foi possível abrir a sugestão."
          );
        }

        const item = payload as SuggestionItem;
        setSelected(item);
        setStatusDraft(
          updatableStatuses.includes(item.status)
            ? item.status
            : item.status === "READ_BY_FUT7PRO"
              ? "IN_REVIEW"
              : "IN_REVIEW"
        );
        setResponseDraft(item.superAdminResponse || "");
        await loadSuggestions();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao abrir sugestão.");
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [loadSuggestions]
  );

  async function updateStatus() {
    if (!selected) return;
    setIsUpdatingStatus(true);
    setError(null);

    try {
      const response = await fetch(`/api/superadmin/suggestions/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusDraft }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível atualizar o status."
        );
      }

      const updated = payload as SuggestionItem;
      setSelected(updated);
      setStatusDraft(updated.status);
      await loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function sendResponse() {
    if (!selected) return;
    const normalized = responseDraft.trim();
    if (normalized.length < 2) {
      setError("A resposta deve ter pelo menos 2 caracteres.");
      return;
    }

    setIsSendingResponse(true);
    setError(null);

    try {
      const response = await fetch(`/api/superadmin/suggestions/${selected.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: normalized }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (payload as { message?: string; error?: string })?.message ||
            (payload as { message?: string; error?: string })?.error ||
            "Não foi possível enviar a resposta."
        );
      }

      const updated = payload as SuggestionItem;
      setSelected(updated);
      setResponseDraft(updated.superAdminResponse || "");
      await loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar resposta.");
    } finally {
      setIsSendingResponse(false);
    }
  }

  const rows = useMemo(() => suggestions, [suggestions]);

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
        <h1 className="text-2xl font-semibold text-yellow-300">Sugestões recebidas</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Sugestões enviadas por administradores e atletas dos rachas. Marque como lida, atualize o
          status e responda quando necessário. Isso aparece automaticamente para quem enviou.
        </p>
      </header>

      <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por palavra..."
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />
          <input
            value={tenantFilter}
            onChange={(event) => setTenantFilter(event.target.value)}
            placeholder="Filtrar por tenantId ou slug"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
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
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Todos os assuntos</option>
            {(Object.keys(categoryLabels) as SuggestionCategory[]).map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
        {isLoading ? (
          <div className="text-sm text-zinc-400">Carregando sugestões...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-zinc-400">Nenhuma sugestão encontrada.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-3 py-2">Racha</th>
                  <th className="px-3 py-2">Quem enviou</th>
                  <th className="px-3 py-2">Assunto</th>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {rows.map((item) => {
                  const sender =
                    item.createdByType === "ATHLETE"
                      ? `${item.athlete?.nickname || item.athlete?.name || "Atleta"} (Atleta)`
                      : `${item.adminUser?.name || "Admin"} (Admin)`;
                  return (
                    <tr key={item.id}>
                      <td className="px-3 py-3 text-zinc-200">
                        <div>{item.tenant?.name || "--"}</div>
                        <div className="text-xs text-zinc-500">
                          {item.tenant?.slug || item.tenantId}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-zinc-200">{sender}</td>
                      <td className="px-3 py-3 text-zinc-200">{categoryLabels[item.category]}</td>
                      <td className="px-3 py-3 text-zinc-400">{formatDate(item.createdAt)}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                        >
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openSuggestion(item.id)}
                          className="rounded border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition"
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Detalhes da sugestão</h2>
              <p className="text-xs text-zinc-400">
                {selected.tenant?.name || "--"} • {formatDate(selected.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800 transition"
            >
              Fechar
            </button>
          </div>

          {isLoadingDetail ? (
            <p className="text-sm text-zinc-400">Abrindo sugestão...</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${statusStyles[selected.status]}`}
                >
                  {statusLabels[selected.status]}
                </span>
                <span className="text-xs text-zinc-400">{categoryLabels[selected.category]}</span>
              </div>

              <p className="text-sm text-zinc-100 whitespace-pre-wrap">{selected.message}</p>

              {selected.forwardNote && (
                <div className="rounded border border-yellow-700/50 bg-yellow-900/20 p-3">
                  <p className="text-xs font-semibold text-yellow-300 mb-1">Comentário do admin</p>
                  <p className="text-sm text-yellow-100 whitespace-pre-wrap">
                    {selected.forwardNote}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Atualizar status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value as SuggestionStatus)}
                    className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  >
                    {updatableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div />
                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={isUpdatingStatus}
                  className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition disabled:opacity-60"
                >
                  {isUpdatingStatus ? "Salvando..." : "Salvar status"}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Resposta da equipe Fut7Pro
                </label>
                <textarea
                  value={responseDraft}
                  onChange={(event) => setResponseDraft(event.target.value)}
                  maxLength={2000}
                  placeholder="Escreva uma resposta para o admin e o atleta..."
                  className="w-full min-h-[130px] rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={sendResponse}
                    disabled={isSendingResponse}
                    className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
                  >
                    {isSendingResponse ? "Enviando..." : "Enviar resposta"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
