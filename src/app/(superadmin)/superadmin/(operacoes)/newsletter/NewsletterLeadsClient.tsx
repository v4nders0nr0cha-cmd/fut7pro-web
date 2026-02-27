"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaCopy,
  FaEnvelope,
  FaFilter,
  FaGlobe,
  FaInbox,
  FaLink,
  FaRedo,
  FaSearch,
} from "react-icons/fa";

type NewsletterLead = {
  id: string;
  email: string;
  source: string;
  ip?: string | null;
  origin?: string | null;
  referer?: string | null;
  userAgent?: string | null;
  subscribedAt: string;
  lastAttemptAt: string;
  duplicateCount: number;
  notificationSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewsletterSummary = {
  duplicateAttempts: number;
  notificationSent: number;
  activeSources: number;
};

type ApiPayload = {
  results?: NewsletterLead[];
  total?: number;
  summary?: NewsletterSummary;
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

function resolveResults(payload: unknown) {
  if (Array.isArray(payload)) return payload as NewsletterLead[];
  if (isObjectRecord(payload) && Array.isArray((payload as ApiPayload).results)) {
    return (payload as ApiPayload).results || [];
  }
  return [];
}

function resolveSummary(payload: unknown): NewsletterSummary {
  if (isObjectRecord(payload) && isObjectRecord((payload as ApiPayload).summary)) {
    const summary = (payload as ApiPayload).summary as NewsletterSummary;
    return {
      duplicateAttempts: Number(summary.duplicateAttempts || 0),
      notificationSent: Number(summary.notificationSent || 0),
      activeSources: Number(summary.activeSources || 0),
    };
  }

  return {
    duplicateAttempts: 0,
    notificationSent: 0,
    activeSources: 0,
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("pt-BR");
}

function truncate(value?: string | null, max = 68) {
  if (!value) return "--";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
}

function looksLikeUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export default function NewsletterLeadsClient() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [leads, setLeads] = useState<NewsletterLead[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<NewsletterSummary>({
    duplicateAttempts: 0,
    notificationSent: 0,
    activeSources: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const params = new URLSearchParams({ limit: "200" });
      if (search.trim()) params.set("q", search.trim());
      if (sourceFilter.trim()) params.set("source", sourceFilter.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const response = await fetch(
        `/api/superadmin/marketing/newsletter-leads?${params.toString()}`,
        {
          cache: "no-store",
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(extractError(payload, "Não foi possível carregar os leads da newsletter."));
      }

      const nextResults = resolveResults(payload);
      setLeads(nextResults);
      setTotal(Number((payload as ApiPayload).total || nextResults.length || 0));
      setSummary(resolveSummary(payload));
      setSelectedId((current) => {
        if (current && nextResults.some((item) => item.id === current)) {
          return current;
        }
        return nextResults[0]?.id || null;
      });
    } catch (loadError) {
      setLeads([]);
      setTotal(0);
      setSummary({
        duplicateAttempts: 0,
        notificationSent: 0,
        activeSources: 0,
      });
      setSelectedId(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Erro inesperado ao carregar os leads da newsletter."
      );
    } finally {
      setIsLoading(false);
    }
  }, [from, search, sourceFilter, to]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedId) || null,
    [leads, selectedId]
  );

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setFeedback(`E-mail ${email} copiado.`);
    } catch {
      setFeedback("Não foi possível copiar o e-mail.");
    }
  }

  function clearFilters() {
    setSearch("");
    setSourceFilter("");
    setFrom("");
    setTo("");
  }

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-yellow-300">
          <FaEnvelope />
          Leads da newsletter
        </h1>
        <p className="text-sm text-zinc-300">
          Base consolidada dos leads capturados no site institucional. Use este painel para revisar
          origem, duplicidades, notificação enviada e contexto técnico de cada inscrição.
        </p>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Leads filtrados</p>
            <p className="mt-1 text-xl font-semibold text-yellow-300">{total}</p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Tentativas duplicadas</p>
            <p className="mt-1 text-xl font-semibold text-orange-300">
              {summary.duplicateAttempts}
            </p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Notificações enviadas</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">
              {summary.notificationSent}
            </p>
          </div>
          <div className="rounded border border-zinc-700 bg-[#121212] px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Fontes ativas</p>
            <p className="mt-1 text-xl font-semibold text-sky-300">{summary.activeSources}</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-zinc-800 bg-[#171717] p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <FaFilter />
          Filtros
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por e-mail, origin, referer, IP..."
              className="w-full rounded border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-3 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>

          <input
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            placeholder="Filtrar por source"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />

          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />

          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadLeads()}
            className="inline-flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            <FaRedo />
            Atualizar lista
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {feedback && (
        <div className="rounded border border-emerald-700 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_380px]">
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#171717]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Lista de leads</h2>
              <p className="text-sm text-zinc-400">
                Ordenado pelos leads mais recentes. Limite atual de 200 registros por consulta.
              </p>
            </div>
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              {isLoading ? "Atualizando..." : `${leads.length} exibidos`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-[#131313] text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3">Inscrição</th>
                  <th className="px-4 py-3">Duplicadas</th>
                  <th className="px-4 py-3">Notificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {!leads.length && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-400">
                      Nenhum lead encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}

                {leads.map((lead) => {
                  const isActive = selectedId === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      className={`cursor-pointer transition ${
                        isActive ? "bg-yellow-400/10" : "hover:bg-zinc-900/70"
                      }`}
                      onClick={() => setSelectedId(lead.id)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-zinc-100">{lead.email}</span>
                          <span className="text-xs text-zinc-400">{truncate(lead.referer)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit rounded-full bg-sky-900/50 px-2 py-1 text-xs font-semibold text-sky-200">
                            {lead.source}
                          </span>
                          <span className="text-xs text-zinc-400">{truncate(lead.origin, 42)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-zinc-200">
                        <div>{formatDateTime(lead.subscribedAt)}</div>
                        <div className="text-xs text-zinc-500">
                          Última tentativa: {formatDateTime(lead.lastAttemptAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            lead.duplicateCount > 0
                              ? "bg-orange-900/50 text-orange-200"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {lead.duplicateCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {lead.notificationSentAt ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 px-2 py-1 text-xs font-semibold text-emerald-200">
                            <FaCheckCircle />
                            Enviada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-300">
                            <FaBell />
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-zinc-800 bg-[#171717] p-4">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Detalhes do lead</h2>
              <p className="text-sm text-zinc-400">Selecione um lead para revisar o contexto.</p>
            </div>
            <FaInbox className="text-zinc-500" />
          </div>

          {!selectedLead ? (
            <div className="py-10 text-sm text-zinc-400">Nenhum lead selecionado no momento.</div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">E-mail</p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-semibold text-yellow-300 hover:text-yellow-200"
                  >
                    {selectedLead.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyEmail(selectedLead.email)}
                    className="rounded border border-zinc-700 p-2 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                    aria-label={`Copiar e-mail ${selectedLead.email}`}
                  >
                    <FaCopy size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Source</p>
                  <p className="mt-1 font-semibold text-zinc-100">{selectedLead.source}</p>
                </div>
                <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Inscrito em</p>
                  <p className="mt-1 font-semibold text-zinc-100">
                    {formatDateTime(selectedLead.subscribedAt)}
                  </p>
                </div>
                <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Última tentativa</p>
                  <p className="mt-1 font-semibold text-zinc-100">
                    {formatDateTime(selectedLead.lastAttemptAt)}
                  </p>
                </div>
                <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Duplicidades</p>
                  <p className="mt-1 font-semibold text-zinc-100">{selectedLead.duplicateCount}</p>
                </div>
              </div>

              <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                  <FaGlobe />
                  Contexto técnico
                </p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-zinc-500">IP</dt>
                    <dd className="font-medium text-zinc-100">{selectedLead.ip || "--"}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Origin</dt>
                    <dd className="font-medium text-zinc-100 break-all">
                      {selectedLead.origin || "--"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Referer</dt>
                    <dd className="font-medium text-zinc-100 break-all">
                      {looksLikeUrl(selectedLead.referer) ? (
                        <a
                          href={selectedLead.referer || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
                        >
                          <FaLink />
                          {selectedLead.referer}
                        </a>
                      ) : (
                        selectedLead.referer || "--"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">User-Agent</dt>
                    <dd className="font-medium text-zinc-100 break-words">
                      {selectedLead.userAgent || "--"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded border border-zinc-800 bg-[#121212] p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Notificação interna</p>
                <p className="mt-1 font-semibold text-zinc-100">
                  {selectedLead.notificationSentAt
                    ? `Enviada em ${formatDateTime(selectedLead.notificationSentAt)}`
                    : "Ainda não registrada nesta captura"}
                </p>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
