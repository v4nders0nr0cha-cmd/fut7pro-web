"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type AmbassadorStatus = "ATIVO" | "EM_ANALISE" | "BLOQUEADO";
type ReferralStatus = "TESTE" | "PRIMEIRA_COMPRA" | "ATIVO" | "CANCELADO";
type CommissionStatus = "PENDENTE" | "PAGA" | "BLOQUEADA";

interface DashboardResponse {
  kpis: {
    totalAmbassadors: number;
    activeAmbassadors: number;
    validCoupons: number;
    totalReferrals: number;
    converted: number;
    conversionRate: number;
    pendingCents: number;
    paidCents: number;
    pendingApplications: number;
  };
  ambassadors: Array<{
    id: string;
    name: string;
    cpfMasked: string;
    level: 1 | 2 | 3;
    status: AmbassadorStatus;
    sales: number;
    couponCode: string;
    city: string;
    state: string;
    pendingCents: number;
  }>;
  referrals: Array<{
    id: string;
    rachaName: string;
    ambassadorId: string;
    ambassadorName: string;
    couponCode: string;
    city: string;
    status: ReferralStatus;
    trialStartedAt: string;
    firstPurchaseAt: string | null;
    valueCents: number;
  }>;
  commissions: Array<{
    id: string;
    ambassadorId: string;
    ambassadorName: string;
    type: "UNICA" | "RECORRENTE";
    competence: string;
    amountCents: number;
    status: CommissionStatus;
    scheduledFor: string;
    paidAt: string | null;
  }>;
}

interface AmbassadorMetrics {
  id: string;
  name: string;
  cpfMasked: string;
  couponCode: string;
  city: string;
  state: string;
  level: 1 | 2 | 3;
  status: AmbassadorStatus;
  sales: number;
  pendingCents: number;
  totalReferrals: number;
  convertedReferrals: number;
  inTrialReferrals: number;
  canceledReferrals: number;
  nonConvertedReferrals: number;
  conversionRate: number;
  pendingCommissionsCents: number;
  paidCommissionsCents: number;
}

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & Partial<DashboardResponse>;
  if (!response.ok) {
    throw new Error(body.error || "Nao foi possivel carregar os dados de embaixadores.");
  }
  return body as DashboardResponse;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}

function formatDate(dateISO: string | null): string {
  if (!dateISO) return "-";
  const parsed = new Date(dateISO);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function ambassadorStatusBadge(status: AmbassadorStatus): string {
  if (status === "ATIVO") return "border-emerald-500/40 bg-emerald-500/20 text-emerald-300";
  if (status === "EM_ANALISE") return "border-yellow-500/40 bg-yellow-500/20 text-yellow-300";
  return "border-red-500/40 bg-red-500/20 text-red-300";
}

function referralStatusBadge(status: ReferralStatus): string {
  if (status === "ATIVO" || status === "PRIMEIRA_COMPRA") {
    return "border-emerald-500/40 bg-emerald-500/20 text-emerald-300";
  }
  if (status === "TESTE") return "border-sky-500/40 bg-sky-500/20 text-sky-300";
  return "border-red-500/40 bg-red-500/20 text-red-300";
}

export default function EmbaixadoresGestaoClient() {
  const searchParams = useSearchParams();
  const preselectedAmbassadorId = searchParams.get("ambassadorId") || "";

  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardResponse>(
    "/api/superadmin/embaixadores",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    }
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState("");
  const [hasAppliedQuerySelection, setHasAppliedQuerySelection] = useState(false);
  const [actionLoading, setActionLoading] = useState<"status" | "delete" | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const ambassadorMetrics = useMemo<AmbassadorMetrics[]>(() => {
    if (!data) return [];

    const metricsMap = new Map<string, AmbassadorMetrics>();
    for (const ambassador of data.ambassadors) {
      metricsMap.set(ambassador.id, {
        id: ambassador.id,
        name: ambassador.name,
        cpfMasked: ambassador.cpfMasked,
        couponCode: ambassador.couponCode,
        city: ambassador.city || "-",
        state: ambassador.state || "-",
        level: ambassador.level,
        status: ambassador.status,
        sales: ambassador.sales,
        pendingCents: ambassador.pendingCents,
        totalReferrals: 0,
        convertedReferrals: 0,
        inTrialReferrals: 0,
        canceledReferrals: 0,
        nonConvertedReferrals: 0,
        conversionRate: 0,
        pendingCommissionsCents: 0,
        paidCommissionsCents: 0,
      });
    }

    for (const referral of data.referrals) {
      const target = metricsMap.get(referral.ambassadorId);
      if (!target) continue;
      target.totalReferrals += 1;
      if (referral.status === "PRIMEIRA_COMPRA" || referral.status === "ATIVO") {
        target.convertedReferrals += 1;
      } else if (referral.status === "TESTE") {
        target.inTrialReferrals += 1;
      } else if (referral.status === "CANCELADO") {
        target.canceledReferrals += 1;
      }
    }

    for (const commission of data.commissions) {
      const target = metricsMap.get(commission.ambassadorId);
      if (!target) continue;
      if (commission.status === "PAGA") {
        target.paidCommissionsCents += commission.amountCents;
      } else if (commission.status === "PENDENTE") {
        target.pendingCommissionsCents += commission.amountCents;
      }
    }

    for (const metric of metricsMap.values()) {
      metric.nonConvertedReferrals = Math.max(metric.totalReferrals - metric.convertedReferrals, 0);
      metric.conversionRate =
        metric.totalReferrals > 0 ? (metric.convertedReferrals / metric.totalReferrals) * 100 : 0;
    }

    return Array.from(metricsMap.values()).sort((a, b) => {
      if (b.convertedReferrals !== a.convertedReferrals) {
        return b.convertedReferrals - a.convertedReferrals;
      }
      if (b.totalReferrals !== a.totalReferrals) {
        return b.totalReferrals - a.totalReferrals;
      }
      return a.name.localeCompare(b.name);
    });
  }, [data]);

  const stateRanking = useMemo(() => {
    const rankMap = new Map<string, number>();
    for (const item of ambassadorMetrics) {
      const key = item.state || "-";
      rankMap.set(key, (rankMap.get(key) || 0) + 1);
    }
    return Array.from(rankMap.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [ambassadorMetrics]);

  const cityRanking = useMemo(() => {
    const rankMap = new Map<string, number>();
    for (const item of ambassadorMetrics) {
      const key = `${item.city}/${item.state}`;
      rankMap.set(key, (rankMap.get(key) || 0) + 1);
    }
    return Array.from(rankMap.entries())
      .map(([cityUf, count]) => ({ cityUf, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [ambassadorMetrics]);

  const stateOptions = useMemo(
    () =>
      Array.from(new Set(ambassadorMetrics.map((item) => item.state)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [ambassadorMetrics]
  );

  const cityOptions = useMemo(() => {
    const scoped = stateFilter
      ? ambassadorMetrics.filter((item) => item.state === stateFilter)
      : ambassadorMetrics;
    return Array.from(new Set(scoped.map((item) => item.city)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [ambassadorMetrics, stateFilter]);

  const filteredAmbassadors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return ambassadorMetrics.filter((item) => {
      if (stateFilter && item.state !== stateFilter) return false;
      if (cityFilter && item.city !== cityFilter) return false;
      if (!normalizedSearch) return true;
      const haystack =
        `${item.name} ${item.couponCode} ${item.city} ${item.state} ${item.cpfMasked}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [ambassadorMetrics, cityFilter, searchTerm, stateFilter]);

  useEffect(() => {
    if (!ambassadorMetrics.length) {
      setSelectedAmbassadorId("");
      return;
    }

    if (
      !hasAppliedQuerySelection &&
      preselectedAmbassadorId &&
      ambassadorMetrics.some((item) => item.id === preselectedAmbassadorId) &&
      selectedAmbassadorId !== preselectedAmbassadorId
    ) {
      setSelectedAmbassadorId(preselectedAmbassadorId);
      setHasAppliedQuerySelection(true);
      return;
    }

    if (
      selectedAmbassadorId &&
      ambassadorMetrics.some((item) => item.id === selectedAmbassadorId)
    ) {
      return;
    }

    setSelectedAmbassadorId(ambassadorMetrics[0].id);
  }, [ambassadorMetrics, hasAppliedQuerySelection, preselectedAmbassadorId, selectedAmbassadorId]);

  const selectedAmbassador = useMemo(
    () => ambassadorMetrics.find((item) => item.id === selectedAmbassadorId) || null,
    [ambassadorMetrics, selectedAmbassadorId]
  );

  const selectedReferrals = useMemo(() => {
    if (!selectedAmbassadorId || !data) return [];
    return data.referrals
      .filter((item) => item.ambassadorId === selectedAmbassadorId)
      .sort((a, b) => Date.parse(b.trialStartedAt) - Date.parse(a.trialStartedAt));
  }, [data, selectedAmbassadorId]);

  const averageReferrals =
    ambassadorMetrics.length > 0
      ? ambassadorMetrics.reduce((sum, item) => sum + item.totalReferrals, 0) /
        ambassadorMetrics.length
      : 0;

  const handleToggleAmbassadorStatus = async () => {
    if (!selectedAmbassador) return;

    const nextStatus = selectedAmbassador.status === "BLOQUEADO" ? "ATIVO" : "BLOQUEADO";
    const confirmMessage =
      nextStatus === "BLOQUEADO"
        ? `Bloquear temporariamente ${selectedAmbassador.name}? O cupom ficará indisponível até a reativação.`
        : `Reativar ${selectedAmbassador.name}? O cupom volta a ficar disponível.`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoading("status");
    setActionMessage(null);
    try {
      const response = await fetch(
        `/api/superadmin/embaixadores/${encodeURIComponent(selectedAmbassador.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Nao foi possivel atualizar o status do embaixador.");
      }
      setActionMessage(
        nextStatus === "BLOQUEADO"
          ? "Embaixador bloqueado temporariamente."
          : "Embaixador reativado com sucesso."
      );
      await mutate();
    } catch (requestError) {
      setActionMessage(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao atualizar status do embaixador."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAmbassador = async () => {
    if (!selectedAmbassador) return;

    const confirmMessage = `Deletar embaixador ${selectedAmbassador.name}? Esta ação remove o cadastro e não pode ser desfeita.`;
    if (!window.confirm(confirmMessage)) return;

    setActionLoading("delete");
    setActionMessage(null);
    try {
      const response = await fetch(
        `/api/superadmin/embaixadores/${encodeURIComponent(selectedAmbassador.id)}`,
        {
          method: "DELETE",
        }
      );
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Nao foi possivel deletar o embaixador.");
      }
      setActionMessage("Embaixador deletado com sucesso.");
      await mutate();
    } catch (requestError) {
      setActionMessage(
        requestError instanceof Error ? requestError.message : "Erro ao deletar embaixador."
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
        <section className="rounded-xl bg-zinc-900/80 p-5 shadow-lg">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Gestao de Embaixadores</h1>
          <p className="mt-2 text-zinc-400">Carregando dados dos embaixadores...</p>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
        <section className="rounded-xl border border-red-500/40 bg-red-950/20 p-5 shadow-lg">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Gestao de Embaixadores</h1>
          <p className="mt-2 text-red-200">
            {error instanceof Error
              ? error.message
              : "Nao foi possivel carregar os dados dos embaixadores."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#101826] px-2 py-6 md:px-8">
      <section className="mb-6 rounded-xl bg-zinc-900/80 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Gestao de Embaixadores</h1>
            <p className="mt-1 text-zinc-400">
              Operacao completa do programa com busca, distribuicao geografica e desempenho de
              conversao por cupom.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/superadmin/embaixadores"
              className="rounded-md border border-zinc-700 bg-zinc-950/40 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              Voltar ao dashboard
            </Link>
            <span className="rounded-full border border-zinc-700 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-400">
              {isValidating ? "Atualizando..." : "Dados em tempo real"}
            </span>
          </div>
        </div>
      </section>

      {actionMessage ? (
        <section className="mb-6">
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              actionMessage.toLowerCase().includes("erro")
                ? "border-red-500/40 bg-red-950/30 text-red-200"
                : "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
            }`}
          >
            {actionMessage}
          </div>
        </section>
      ) : null}

      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <article className="rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-600 p-4 text-black shadow-lg">
          <p className="text-xs font-semibold uppercase">Embaixadores</p>
          <p className="mt-1 text-2xl font-bold">{ambassadorMetrics.length}</p>
          <p className="text-xs">Total cadastrado</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Ativos</p>
          <p className="mt-1 text-2xl font-bold">{data.kpis.activeAmbassadors}</p>
          <p className="text-xs">Com status ativo</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-blue-400 to-blue-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Rachas com cupom</p>
          <p className="mt-1 text-2xl font-bold">{data.kpis.totalReferrals}</p>
          <p className="text-xs">Indicados rastreados</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-purple-400 to-purple-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Conversao geral</p>
          <p className="mt-1 text-2xl font-bold">{Math.round(data.kpis.conversionRate)}%</p>
          <p className="text-xs">Teste para pago</p>
        </article>
        <article className="rounded-xl bg-gradient-to-tr from-cyan-400 to-cyan-600 p-4 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase">Media por embaixador</p>
          <p className="mt-1 text-2xl font-bold">{averageReferrals.toFixed(1)}</p>
          <p className="text-xs">Rachas por cupom</p>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Estados com mais embaixadores</h2>
          {stateRanking.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">Sem dados de estado.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {stateRanking.map((item) => (
                <div
                  key={item.state}
                  className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-200">{item.state}</span>
                  <span className="font-semibold text-yellow-300">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Cidades com mais embaixadores</h2>
          {cityRanking.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">Sem dados de cidade.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {cityRanking.map((item) => (
                <div
                  key={item.cityUf}
                  className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                >
                  <span className="text-zinc-200">{item.cityUf}</span>
                  <span className="font-semibold text-yellow-300">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="mb-6 rounded-xl bg-zinc-900/80 p-4 shadow-lg">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome, cupom, cidade ou CPF"
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 text-sm text-zinc-100 outline-none focus:border-yellow-500 md:col-span-2"
          />
          <select
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value);
              setCityFilter("");
            }}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 text-sm text-zinc-100 outline-none focus:border-yellow-500"
          >
            <option value="">Todos os estados</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 text-sm text-zinc-100 outline-none focus:border-yellow-500"
          >
            <option value="">Todas as cidades</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lista de Embaixadores</h2>
            <span className="text-xs text-zinc-400">Filtrados: {filteredAmbassadors.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="px-2 py-2 font-medium">Nome</th>
                  <th className="px-2 py-2 font-medium">Cupom</th>
                  <th className="px-2 py-2 font-medium">Cidade/UF</th>
                  <th className="px-2 py-2 font-medium">Rachas</th>
                  <th className="px-2 py-2 font-medium">Conversao</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAmbassadors.map((item) => {
                  const selected = item.id === selectedAmbassadorId;
                  return (
                    <tr
                      key={item.id}
                      className={`cursor-pointer border-b border-zinc-800 transition ${
                        selected ? "bg-yellow-500/10" : "hover:bg-zinc-800/40"
                      }`}
                      onClick={() => setSelectedAmbassadorId(item.id)}
                    >
                      <td className="px-2 py-2 font-medium text-white">{item.name}</td>
                      <td className="px-2 py-2 font-semibold text-yellow-300">{item.couponCode}</td>
                      <td className="px-2 py-2 text-zinc-300">
                        {item.city}/{item.state}
                      </td>
                      <td className="px-2 py-2 text-zinc-300">{item.totalReferrals}</td>
                      <td className="px-2 py-2 text-zinc-300">
                        {Math.round(item.conversionRate)}%
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs ${ambassadorStatusBadge(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredAmbassadors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-4 text-center text-zinc-400">
                      Nenhum embaixador encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl bg-zinc-900/80 p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-semibold text-white">Detalhes do Embaixador</h2>
          {!selectedAmbassador ? (
            <p className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-400">
              Selecione um embaixador para visualizar indicadores detalhados.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{selectedAmbassador.name}</p>
                    <p className="text-sm text-zinc-300">CPF: {selectedAmbassador.cpfMasked}</p>
                    <p className="text-sm text-zinc-300">
                      Cidade/UF: {selectedAmbassador.city}/{selectedAmbassador.state}
                    </p>
                    <p className="text-sm text-zinc-300">Cupom: {selectedAmbassador.couponCode}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs ${ambassadorStatusBadge(selectedAmbassador.status)}`}
                  >
                    {selectedAmbassador.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleToggleAmbassadorStatus()}
                    disabled={actionLoading !== null}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedAmbassador.status === "BLOQUEADO"
                        ? "border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                        : "border border-yellow-500/50 bg-yellow-500/15 text-yellow-200 hover:bg-yellow-500/25"
                    }`}
                  >
                    {actionLoading === "status"
                      ? "Processando..."
                      : selectedAmbassador.status === "BLOQUEADO"
                        ? "Reativar embaixador"
                        : "Bloquear temporariamente"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteAmbassador()}
                    disabled={actionLoading !== null}
                    className="rounded-md border border-red-500/50 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === "delete" ? "Deletando..." : "Deletar embaixador"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MetricCard label="Rachas com cupom" value={selectedAmbassador.totalReferrals} />
                <MetricCard
                  label="Compraram apos teste"
                  value={selectedAmbassador.convertedReferrals}
                />
                <MetricCard
                  label="Nao compraram"
                  value={selectedAmbassador.nonConvertedReferrals}
                />
                <MetricCard label="Ainda em teste" value={selectedAmbassador.inTrialReferrals} />
                <MetricCard
                  label="Cancelados/estorno"
                  value={selectedAmbassador.canceledReferrals}
                />
                <MetricCard
                  label="Taxa de conversao"
                  value={`${Math.round(selectedAmbassador.conversionRate)}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  label="Comissao pendente"
                  value={formatCurrency(selectedAmbassador.pendingCommissionsCents)}
                />
                <MetricCard
                  label="Comissao paga"
                  value={formatCurrency(selectedAmbassador.paidCommissionsCents)}
                />
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                  Rachas por status
                </p>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {selectedReferrals.length === 0 ? (
                    <p className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-400">
                      Nenhum racha rastreado para este cupom ainda.
                    </p>
                  ) : (
                    selectedReferrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-zinc-100">{referral.rachaName}</p>
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${referralStatusBadge(referral.status)}`}
                          >
                            {referral.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                          Cidade: {referral.city} - Inicio do teste:{" "}
                          {formatDate(referral.trialStartedAt)}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Compra: {formatDate(referral.firstPurchaseAt)} - Valor:{" "}
                          {formatCurrency(referral.valueCents)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-2.5">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
