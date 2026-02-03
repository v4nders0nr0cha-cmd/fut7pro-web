"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useBranding } from "@/hooks/useBranding";

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
    pendenciasLocalizacao: number;
  };
  byState: MetricsRow[];
  byCity: MetricsRow[];
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

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const status = onlyExpiredTrial ? "trial_expired_no_payment" : statusFilter;
    if (status && status !== "all") params.set("status", status);
    return params.toString();
  }, [fromDate, toDate, statusFilter, onlyExpiredTrial]);

  const url = query
    ? `/api/superadmin/metrics/locations?${query}`
    : "/api/superadmin/metrics/locations";
  const { data, error, isLoading } = useSWR<MetricsResponse>(url, fetcher);

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

  const cards = [
    { label: "Total de rachas", value: summary.total },
    { label: "Em teste", value: summary.trial },
    { label: "Pagos", value: summary.paid },
    { label: "Conversao", value: formatPercent(summary.conversionRate) },
    { label: "Teste expirado sem pagamento", value: summary.trialExpiredNoPayment },
    { label: "Pendencias de localizacao", value: summary.pendenciasLocalizacao },
  ];

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
      </main>
    </>
  );
}
