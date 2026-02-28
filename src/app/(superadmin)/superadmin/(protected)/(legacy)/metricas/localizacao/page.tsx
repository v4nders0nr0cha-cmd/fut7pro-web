"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useBranding } from "@/hooks/useBranding";
import { UF_LIST } from "@/data/br/ufs";
import { loadCitiesByUf, type CityOption } from "@/data/br/cidades";

type MetricsRow = {
  key: string;
  uf?: string;
  cidade?: string;
  label: string;
  total: number;
  trial: number;
  paid: number;
  pastDue: number;
  canceled: number;
  paused: number;
  expired: number;
  trialExpiredNoPayment: number;
  conversionRate: number;
};

type MetricsResponse = {
  summary: {
    total: number;
    trial: number;
    paid: number;
    pastDue: number;
    canceled: number;
    paused: number;
    expired: number;
    trialExpiredNoPayment: number;
    conversionRate: number;
    churnRate?: number;
    pendenciasLocalizacao: number;
  };
  byState: MetricsRow[];
  byCity: MetricsRow[];
  pending?: {
    total: number;
    globalTotal?: number;
    scope?: string;
    page: number;
    pageSize: number;
    results: PendingTenant[];
  };
  insights?: {
    minSampleUf: number;
    bestConversionUf?: { uf: string; conversionRate: number; total: number } | null;
    worstChurnUf?: { uf: string; churnRate: number; paidBase: number } | null;
    topExpiredTrialUf?: { uf: string; trialExpiredNoPayment: number; total: number } | null;
    topPaidCity?: { cidade: string; uf: string; paid: number } | null;
  };
  definitions?: {
    conversion?: string;
    churn?: string;
  };
};

type PendingTenant = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  status?: string | null;
  estadoUf?: string | null;
  cidadeNome?: string | null;
  cidadeIbgeCode?: string | null;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  return text ? JSON.parse(text) : null;
};

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

function formatPercent(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${(safe * 100).toFixed(1)}%`;
}

function formatDateShort(value?: string | null) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

function formatPlanStatus(value?: string | null) {
  if (!value) return "--";
  const normalized = value.toUpperCase();
  if (normalized.includes("TRIAL")) return "Teste";
  if (normalized.includes("ACTIVE")) return "Ativo";
  if (normalized.includes("PAST_DUE")) return "Inadimplente";
  if (normalized.includes("CANCELED")) return "Cancelado";
  if (normalized.includes("PAUSED")) return "Pausado";
  if (normalized.includes("EXPIRED")) return "Expirado";
  return value;
}

export default function SuperAdminLocationMetricsPage() {
  const { brandText } = useBranding({ scope: "superadmin" });
  const today = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => toDateInput(today), [today]);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return toDateInput(d);
  }, [today]);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyExpiredTrial, setOnlyExpiredTrial] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const pendingPageSize = 10;
  const [pendenciasGlobais, setPendenciasGlobais] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState<PendingTenant | null>(null);
  const [ufSelecionado, setUfSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState<CityOption | null>(null);
  const [cidadeOptions, setCidadeOptions] = useState<CityOption[]>([]);
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [cidadeLoading, setCidadeLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPendingPage(1);
    setSelectedTenant(null);
  }, [fromDate, toDate, statusFilter, onlyExpiredTrial, pendenciasGlobais]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const status = onlyExpiredTrial ? "trial_expired_no_payment" : statusFilter;
    if (status && status !== "all") params.set("status", status);
    params.set("pendingPage", String(pendingPage));
    params.set("pendingPageSize", String(pendingPageSize));
    if (pendenciasGlobais) params.set("pendingScope", "global");
    return params.toString();
  }, [
    fromDate,
    toDate,
    statusFilter,
    onlyExpiredTrial,
    pendingPage,
    pendingPageSize,
    pendenciasGlobais,
  ]);

  const url = query
    ? `/api/superadmin/metrics/locations?${query}`
    : "/api/superadmin/metrics/locations";
  const { data, error, isLoading, mutate } = useSWR<MetricsResponse>(url, fetcher);

  const summary = data?.summary ?? {
    total: 0,
    trial: 0,
    paid: 0,
    pastDue: 0,
    canceled: 0,
    paused: 0,
    expired: 0,
    trialExpiredNoPayment: 0,
    conversionRate: 0,
    pendenciasLocalizacao: 0,
  };

  const pending = data?.pending;
  const pendingResults = pending?.results ?? [];
  const pendingTotal = pending?.total ?? 0;
  const pendingGlobalTotal = pending?.globalTotal ?? summary.pendenciasLocalizacao;
  const pendingPages = Math.max(1, Math.ceil(pendingTotal / pendingPageSize));
  const insights = data?.insights;

  const cards = [
    { label: "Total de rachas", value: summary.total },
    { label: "Em teste", value: summary.trial },
    { label: "Pagos", value: summary.paid },
    { label: "Conversao", value: formatPercent(summary.conversionRate) },
    { label: "Teste expirado sem pagamento", value: summary.trialExpiredNoPayment },
    { label: "Pendencias de localizacao (global)", value: summary.pendenciasLocalizacao },
  ];

  useEffect(() => {
    if (!selectedTenant) return;
    setUfSelecionado(selectedTenant.estadoUf ?? "");
    setCidadeSelecionada(
      selectedTenant.cidadeIbgeCode && selectedTenant.cidadeNome
        ? { ibge: selectedTenant.cidadeIbgeCode, nome: selectedTenant.cidadeNome }
        : null
    );
    setCidadeFiltro("");
    setSaveError(null);
  }, [selectedTenant]);

  useEffect(() => {
    if (!ufSelecionado) {
      setCidadeOptions([]);
      setCidadeLoading(false);
      return;
    }
    let active = true;
    setCidadeLoading(true);
    loadCitiesByUf(ufSelecionado)
      .then((options) => {
        if (!active) return;
        setCidadeOptions(options);
        setCidadeLoading(false);
        setCidadeSelecionada((prev) => {
          if (!prev) return prev;
          const match = options.find((city) => city.ibge === prev.ibge);
          return match ? { ibge: match.ibge, nome: match.nome } : null;
        });
      })
      .catch(() => {
        if (!active) return;
        setCidadeOptions([]);
        setCidadeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ufSelecionado]);

  const cidadesFiltradas = useMemo(() => {
    if (!cidadeFiltro) return cidadeOptions;
    const term = cidadeFiltro.trim().toLowerCase();
    if (!term) return cidadeOptions;
    return cidadeOptions.filter((city) => city.nome.toLowerCase().includes(term));
  }, [cidadeFiltro, cidadeOptions]);

  async function handleSalvarLocalizacao() {
    if (!selectedTenant) return;
    setSaveError(null);

    if (!ufSelecionado) {
      setSaveError("Selecione um estado (UF).");
      return;
    }
    if (!cidadeSelecionada) {
      setSaveError("Selecione uma cidade valida.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/superadmin/tenants/${selectedTenant.id}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estadoUf: ufSelecionado,
          cidadeNome: cidadeSelecionada.nome,
          cidadeIbgeCode: cidadeSelecionada.ibge,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Falha ao salvar localizacao");
      }
      setSelectedTenant(null);
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar localizacao";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  const pageTitle = brandText("Métricas por Localização - SuperAdmin Fut7Pro");
  const description = brandText(
    "Acompanhe conversão por estado e cidade, testes expirados e distribuição geográfica dos rachas Fut7Pro."
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
      </Head>
      <main className="w-full min-h-screen bg-[#101826] px-2 md:px-8 py-6 text-white">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {brandText("Métricas por Estado e Cidade")}
          </h1>
          <p className="text-sm text-zinc-400">
            {brandText("Analise conversão, testes e distribuição geográfica dos rachas.")}
          </p>
        </div>

        <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <label className="text-xs text-zinc-400">
              Período (de)
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
            <label className="text-xs text-zinc-400">
              Período (até)
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </label>
            <label className="text-xs text-zinc-400">
              Status do plano
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={onlyExpiredTrial}
                className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="all">Todos</option>
                <option value="trial">Em teste</option>
                <option value="paid">Pagos (ativos)</option>
                <option value="past_due">Inadimplentes</option>
                <option value="canceled">Cancelados</option>
                <option value="paused">Pausados</option>
                <option value="expired">Expirados</option>
              </select>
            </label>
            <label className="flex items-end gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={onlyExpiredTrial}
                onChange={(e) => setOnlyExpiredTrial(e.target.checked)}
                className="h-4 w-4 accent-yellow-400"
              />
              Somente teste expirado sem pagamento
            </label>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Conversao = primeiro pagamento confirmado no período / rachas criados no período.
          </p>
        </section>

        {error ? (
          <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-sm text-red-200">
            Nao foi possivel carregar as metricas. Tente novamente em instantes.
          </div>
        ) : null}

        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{card.label}</div>
              <div className="mt-2 text-2xl font-bold text-yellow-300">{card.value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Insights automáticos</h2>
              <p className="text-xs text-zinc-400">
                Mínimo de amostra por UF: {insights?.minSampleUf ?? 10}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[#151a24] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                UF com maior conversao
              </div>
              {insights?.bestConversionUf ? (
                <div className="mt-2 text-base font-semibold text-white">
                  {insights.bestConversionUf.uf} •{" "}
                  {formatPercent(insights.bestConversionUf.conversionRate)}
                </div>
              ) : (
                <div className="mt-2 text-sm text-zinc-500">Dados insuficientes</div>
              )}
            </div>
            <div className="rounded-xl bg-[#151a24] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                UF com maior churn
              </div>
              {insights?.worstChurnUf ? (
                <div className="mt-2 text-base font-semibold text-white">
                  {insights.worstChurnUf.uf} • {formatPercent(insights.worstChurnUf.churnRate)}
                </div>
              ) : (
                <div className="mt-2 text-sm text-zinc-500">Dados insuficientes</div>
              )}
            </div>
            <div className="rounded-xl bg-[#151a24] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                UF com mais teste expirado
              </div>
              {insights?.topExpiredTrialUf ? (
                <div className="mt-2 text-base font-semibold text-white">
                  {insights.topExpiredTrialUf.uf} •{" "}
                  {insights.topExpiredTrialUf.trialExpiredNoPayment} racha(s)
                </div>
              ) : (
                <div className="mt-2 text-sm text-zinc-500">Dados insuficientes</div>
              )}
            </div>
            <div className="rounded-xl bg-[#151a24] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Cidade com mais pagos
              </div>
              {insights?.topPaidCity ? (
                <div className="mt-2 text-base font-semibold text-white">
                  {insights.topPaidCity.cidade} / {insights.topPaidCity.uf} •{" "}
                  {insights.topPaidCity.paid}
                </div>
              ) : (
                <div className="mt-2 text-sm text-zinc-500">Dados insuficientes</div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Rachas sem localização</h2>
              <p className="text-xs text-zinc-400">
                Corrija os rachas antigos para eliminar "Nao informado" nas métricas.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-zinc-400 md:items-end">
              <div>
                {pendingGlobalTotal} pendência(s) globais • exibindo {pendingTotal}{" "}
                {pendenciasGlobais ? "globais" : "no filtro"} • página {pendingPage} de{" "}
                {pendingPages}
              </div>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-400"
                  checked={pendenciasGlobais}
                  onChange={(e) => setPendenciasGlobais(e.target.checked)}
                />
                Ver pendências globais
              </label>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-700">
                <tr>
                  <th className="py-2">Racha</th>
                  <th className="py-2">Slug</th>
                  <th className="py-2">Criado em</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Localizacao atual</th>
                  <th className="py-2 text-right">Acao</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && pendingResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-zinc-500">
                      Nenhuma pendência encontrada no período.
                    </td>
                  </tr>
                ) : null}
                {pendingResults.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-zinc-800">
                    <td className="py-2 font-semibold">{tenant.name}</td>
                    <td className="py-2 text-zinc-400">{tenant.slug}</td>
                    <td className="py-2">{formatDateShort(tenant.createdAt)}</td>
                    <td className="py-2">{formatPlanStatus(tenant.status)}</td>
                    <td className="py-2">
                      {(tenant.cidadeNome || "--") + " / " + (tenant.estadoUf || "--")}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        className="rounded-lg bg-yellow-500/90 px-3 py-1 text-xs font-semibold text-black hover:bg-yellow-400"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        Corrigir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
            <button
              className="rounded-lg border border-zinc-700 px-3 py-1 hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-50"
              disabled={pendingPage <= 1}
              onClick={() => setPendingPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </button>
            <span>
              Mostrando {pendingResults.length} de {pendingTotal}
            </span>
            <button
              className="rounded-lg border border-zinc-700 px-3 py-1 hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-50"
              disabled={pendingPage >= pendingPages}
              onClick={() => setPendingPage((prev) => Math.min(prev + 1, pendingPages))}
            >
              Próxima
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-yellow-300 mb-3">
              {brandText("Por Estado")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-700">
                  <tr>
                    <th className="py-2">UF</th>
                    <th className="py-2">Rachas</th>
                    <th className="py-2">Em teste</th>
                    <th className="py-2">Pagos</th>
                    <th className="py-2">Inadimplentes</th>
                    <th className="py-2">Conversao</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && (data?.byState?.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-zinc-500">
                        Nenhum dado encontrado no período.
                      </td>
                    </tr>
                  ) : null}
                  {(data?.byState ?? []).map((row) => (
                    <tr key={row.key} className="border-b border-zinc-800">
                      <td className="py-2 font-semibold">{row.label}</td>
                      <td className="py-2">{row.total}</td>
                      <td className="py-2">{row.trial}</td>
                      <td className="py-2">{row.paid}</td>
                      <td className="py-2">{row.pastDue}</td>
                      <td className="py-2">{formatPercent(row.conversionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-yellow-300 mb-3">
              {brandText("Top Cidades")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-700">
                  <tr>
                    <th className="py-2">Cidade / UF</th>
                    <th className="py-2">Rachas</th>
                    <th className="py-2">Em teste</th>
                    <th className="py-2">Pagos</th>
                    <th className="py-2">Conversao</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && (data?.byCity?.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-500">
                        Nenhum dado encontrado no período.
                      </td>
                    </tr>
                  ) : null}
                  {(data?.byCity ?? []).map((row) => (
                    <tr key={row.key} className="border-b border-zinc-800">
                      <td className="py-2 font-semibold">{row.label}</td>
                      <td className="py-2">{row.total}</td>
                      <td className="py-2">{row.trial}</td>
                      <td className="py-2">{row.paid}</td>
                      <td className="py-2">{formatPercent(row.conversionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {selectedTenant ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#191c27] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Corrigir localizacao</h3>
                <button
                  className="text-zinc-400 hover:text-white"
                  onClick={() => setSelectedTenant(null)}
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Racha</p>
                  <p className="text-base font-semibold text-white">{selectedTenant.name}</p>
                  <p className="text-xs text-zinc-500">{selectedTenant.slug}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Estado (UF)</label>
                  <select
                    value={ufSelecionado}
                    onChange={(e) => {
                      setUfSelecionado(e.target.value);
                      setCidadeSelecionada(null);
                      setCidadeFiltro("");
                    }}
                    className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Selecione o estado</option>
                    {UF_LIST.map((uf) => (
                      <option key={uf.uf} value={uf.uf}>
                        {uf.uf} - {uf.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Cidade</label>
                  <input
                    type="text"
                    placeholder="Buscar cidade..."
                    value={cidadeFiltro}
                    onChange={(e) => setCidadeFiltro(e.target.value)}
                    disabled={!ufSelecionado || cidadeLoading}
                    className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                  />
                  <select
                    value={cidadeSelecionada?.ibge ?? ""}
                    onChange={(e) => {
                      const ibge = e.target.value;
                      const city = cidadeOptions.find((option) => option.ibge === ibge) || null;
                      setCidadeSelecionada(city);
                    }}
                    disabled={!ufSelecionado || cidadeLoading}
                    className="mt-2 w-full rounded-lg bg-[#161822] border border-[#23283a] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                  >
                    <option value="">Selecione a cidade</option>
                    {cidadesFiltradas.map((city) => (
                      <option key={city.ibge} value={city.ibge}>
                        {city.nome}
                      </option>
                    ))}
                  </select>
                  {cidadeLoading ? (
                    <p className="mt-2 text-xs text-zinc-500">Carregando cidades...</p>
                  ) : null}
                </div>

                {saveError ? (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                    {saveError}
                  </div>
                ) : null}
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-yellow-400 hover:text-yellow-300"
                  onClick={() => setSelectedTenant(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-70"
                  onClick={handleSalvarLocalizacao}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar localizacao"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
