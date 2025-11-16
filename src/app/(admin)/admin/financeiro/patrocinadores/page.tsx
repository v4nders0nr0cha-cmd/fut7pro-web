"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";
import { useAuth } from "@/hooks/useAuth";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import { useSponsorMetrics } from "@/hooks/useSponsorMetrics";
import type {
  Patrocinador,
  SponsorTier,
  SponsorMetricStatus,
  SponsorMetricsAlert,
} from "@/types/patrocinador";
import { useNotification } from "@/context/NotificationContext";
import {
  FaBullseye,
  FaChartLine,
  FaCheckCircle,
  FaDownload,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPercent,
  FaSpinner,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

const METRICS_RANGE_OPTIONS = [
  { value: "7d", label: "Ultimos 7 dias", days: 6, granularity: "day" as const },
  { value: "30d", label: "Ultimos 30 dias", days: 29, granularity: "day" as const },
  { value: "90d", label: "Ultimos 90 dias", days: 89, granularity: "week" as const },
];

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});
const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const STATUS_META: Record<SponsorMetricStatus, { label: string; color: string; badge: string }> = {
  on_track: { label: "No alvo", color: "text-green-400", badge: "bg-green-500/10" },
  attention: { label: "Ajustar", color: "text-yellow-400", badge: "bg-yellow-500/10" },
  critical: { label: "Critico", color: "text-red-400", badge: "bg-red-500/10" },
};

type MetricsRangeValue = (typeof METRICS_RANGE_OPTIONS)[number]["value"];

function calcProgress(value: number, goal: number) {
  if (!goal || goal <= 0) {
    return value > 0 ? 1 : 0;
  }
  return Math.min(1, value / goal);
}

function formatNumber(value: number) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDecimal(value: number) {
  return decimalFormatter.format(Number.isFinite(value) ? value : 0);
}

const ROI_ALERT_LEVELS = {
  attention: 1.5,
  critical: 0.75,
};

const CPC_ALERT_LEVELS = {
  attention: 6,
  critical: 10,
};

function buildTrendLabel(bucket: string) {
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) return bucket;
  return date.toLocaleDateString("pt-BR");
}

export default function PaginaPatrocinadores() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? null;
  const { notify } = useNotification();
  const {
    patrocinadores,
    isLoading,
    error,
    createPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    toggleFooterForAll,
    toggleFooterVisibility,
  } = usePatrocinadores(tenantSlug);

  const inicioPadrao = useMemo(
    () => new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString().slice(0, 10),
    []
  );
  const [periodo] = useState({ inicio: inicioPadrao, fim: DATA_ATUAL });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Patrocinador | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const footerVisivel = patrocinadores.some((p) => p.showOnFooter);
  const atingiuLimite = patrocinadores.length >= 10;
  const [formatoExport, setFormatoExport] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [filtroTier, setFiltroTier] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [somenteFooter, setSomenteFooter] = useState(false);
  const [exportando, setExportando] = useState(false);

  const [metricsRange, setMetricsRange] = useState<MetricsRangeValue>("30d");
  const [metricsTier, setMetricsTier] = useState<"all" | SponsorTier>("all");
  const [metricsExportFormat, setMetricsExportFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [metricsExportando, setMetricsExportando] = useState(false);

  const metricsConfig = useMemo(() => {
    const option =
      METRICS_RANGE_OPTIONS.find((item) => item.value === metricsRange) ?? METRICS_RANGE_OPTIONS[1];
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - option.days);
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
      granularity: option.granularity,
    };
  }, [metricsRange]);

  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useSponsorMetrics({
    tenantSlug,
    start: metricsConfig.start,
    end: metricsConfig.end,
    granularity: metricsConfig.granularity,
    tier: metricsTier === "all" ? undefined : metricsTier,
  });

  const metricsTrend = useMemo(() => {
    if (!metrics) return [];
    return metrics.trend.map((point) => ({
      label: buildTrendLabel(point.bucket),
      impressions: point.impressions,
      clicks: point.clicks,
    }));
  }, [metrics]);

  const topSponsors = useMemo(() => (metrics ? metrics.sponsors.slice(0, 5) : []), [metrics]);
  const tierResumo = metrics?.tiers ?? [];
  const lastUpdated = metrics?.generatedAt
    ? new Date(metrics.generatedAt).toLocaleString("pt-BR")
    : null;

  const totalImpressions = metrics?.totals.impressions ?? 0;
  const totalClicks = metrics?.totals.clicks ?? 0;
  const totalCtr = metrics?.totals.ctr ?? 0;
  const totalSponsorsAtivos = metrics?.totals.uniqueSponsors ?? 0;
  const goalImpressions = metrics?.totals.goals.impressions ?? 0;
  const goalClicks = metrics?.totals.goals.clicks ?? 0;
  const goalCtr = metrics?.totals.goals.ctr ?? 0;

  const progressImpressions = calcProgress(totalImpressions, goalImpressions);
  const progressClicks = calcProgress(totalClicks, goalClicks);
  const progressCtr = calcProgress(totalCtr, goalCtr);

  const summaryCards = metrics
    ? [
        {
          key: "impressions",
          title: "Impressoes",
          value: totalImpressions,
          goal: goalImpressions,
          progress: progressImpressions,
          formatter: formatNumber,
          icon: <FaChartLine className="text-yellow-400" />,
          showProgress: goalImpressions > 0,
        },
        {
          key: "clicks",
          title: "Cliques",
          value: totalClicks,
          goal: goalClicks,
          progress: progressClicks,
          formatter: formatNumber,
          icon: <FaChartLine className="text-green-400" />,
          showProgress: goalClicks > 0,
        },
        {
          key: "ctr",
          title: "CTR",
          value: totalCtr,
          goal: goalCtr,
          progress: progressCtr,
          formatter: formatPercent,
          icon: <FaBullseye className="text-blue-300" />,
          showProgress: goalCtr > 0,
        },
        {
          key: "sponsors",
          title: "Patrocinadores ativos",
          value: totalSponsorsAtivos,
          goal: 0,
          progress: 0,
          formatter: formatNumber,
          icon: <FaCheckCircle className="text-emerald-400" />,
          showProgress: false,
        },
      ]
    : [];

  const sponsorFinancialRows = useMemo(() => {
    if (!metrics) return [];
    const patrocinadorMap = new Map(patrocinadores.map((p) => [p.id, p]));
    return metrics.sponsors
      .map((sponsor) => {
        const details = patrocinadorMap.get(sponsor.sponsorId);
        const investment = details?.value ?? 0;
        const cpc = investment > 0 && sponsor.clicks > 0 ? investment / sponsor.clicks : null;
        const roi = investment > 0 && sponsor.clicks > 0 ? sponsor.clicks / investment : null;
        const cpm =
          investment > 0 && sponsor.impressions > 0
            ? (investment / sponsor.impressions) * 1000
            : null;
        return {
          ...sponsor,
          investment,
          cpc,
          roi,
          cpm,
          tier: details?.tier ?? sponsor.tier,
        };
      })
      .sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0));
  }, [metrics, patrocinadores]);

  const derivedAlerts = useMemo<SponsorMetricsAlert[]>(() => {
    const items: SponsorMetricsAlert[] = [];
    sponsorFinancialRows.forEach((row) => {
      if (row.roi !== null && row.roi < ROI_ALERT_LEVELS.attention) {
        items.push({
          type: row.roi < ROI_ALERT_LEVELS.critical ? "critical" : "warning",
          message: `ROI do patrocinador ${row.name} esta em ${formatDecimal(row.roi)} cliques/R$ (abaixo do recomendado).`,
          sponsorId: row.sponsorId,
          tier: row.tier,
        });
      }
      if (row.cpc !== null && row.cpc > CPC_ALERT_LEVELS.attention) {
        items.push({
          type: row.cpc > CPC_ALERT_LEVELS.critical ? "critical" : "warning",
          message: `CPC medio de ${row.name} chegou a ${formatCurrency(row.cpc)} (cliques caros).`,
          sponsorId: row.sponsorId,
          tier: row.tier,
        });
      }
    });
    return items;
  }, [sponsorFinancialRows]);

  const backendAlerts = metrics?.alerts ?? [];
  const alerts = useMemo(
    () => [...backendAlerts, ...derivedAlerts],
    [backendAlerts, derivedAlerts]
  );

  const monitoradoInvestmentTotal = sponsorFinancialRows.reduce(
    (acc, row) => acc + row.investment,
    0
  );
  const monitoradoClicks = sponsorFinancialRows.reduce((acc, row) => acc + row.clicks, 0);
  const monitoradoImpressions = sponsorFinancialRows.reduce((acc, row) => acc + row.impressions, 0);
  const monitoradoCpc = monitoradoClicks > 0 ? monitoradoInvestmentTotal / monitoradoClicks : null;
  const monitoradoCpm =
    monitoradoImpressions > 0 ? (monitoradoInvestmentTotal / monitoradoImpressions) * 1000 : null;
  const monitoradoRoi =
    monitoradoInvestmentTotal > 0 ? monitoradoClicks / monitoradoInvestmentTotal : null;

  const progressBarClass = (value: number) =>
    value >= 1 ? "bg-green-400" : value >= 0.6 ? "bg-yellow-400" : "bg-red-500";
  const progressTextClass = (value: number) =>
    value >= 1 ? "text-green-400" : value >= 0.6 ? "text-yellow-400" : "text-red-400";

  const patrocinadoresFiltrados = useMemo(() => {
    return patrocinadores.filter((p) => {
      if (filtroTier && p.tier !== filtroTier) {
        return false;
      }
      const statusAtual = p.status ?? "ativo";
      if (filtroStatus && statusAtual !== filtroStatus) {
        return false;
      }
      if (somenteFooter && !p.showOnFooter) {
        return false;
      }
      return true;
    });
  }, [patrocinadores, filtroTier, filtroStatus, somenteFooter]);

  const totalInvestimentoPlanejado = useMemo(
    () => patrocinadores.reduce((acc, item) => acc + (item.value ?? 0), 0),
    [patrocinadores]
  );

  const handleNovo = () => {
    if (atingiuLimite || !tenantSlug) return;
    setSelectedSponsor(null);
    setModalOpen(true);
  };

  const handleEditar = (patro: Patrocinador) => {
    setSelectedSponsor(patro);
    setModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    await deletePatrocinador(id);
  };

  const handleToggleVisibilidade = async () => {
    await toggleFooterForAll(!footerVisivel);
  };

  const handleToggleSponsorFooter = async (id: string, show: boolean) => {
    await toggleFooterVisibility(id, show);
  };

  const handleSave = async (payload: Parameters<typeof createPatrocinador>[0], id?: string) => {
    setSubmitting(true);
    try {
      if (id) {
        await updatePatrocinador(id, payload);
      } else {
        await createPatrocinador(payload);
      }
      setModalOpen(false);
      setSelectedSponsor(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!tenantSlug) {
      notify({ message: "Selecione um racha antes de exportar patrocinadores.", type: "warning" });
      return;
    }

    const params = new URLSearchParams();
    params.set("format", formatoExport);
    params.set("slug", tenantSlug);
    if (filtroTier) {
      params.set("tier", filtroTier);
    }
    if (filtroStatus) {
      params.set("status", filtroStatus);
    }
    if (somenteFooter) {
      params.set("showOnFooter", "true");
    }

    setExportando(true);
    try {
      const response = await fetch(`/api/admin/patrocinadores/export?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData && typeof errorData.error === "string"
            ? errorData.error
            : "Falha ao exportar patrocinadores") as string
        );
      }

      const blob = await response.blob();
      const filename =
        extractFilename(response.headers.get("Content-Disposition")) ??
        `patrocinadores.${formatoExport}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      notify({ message: "Export gerado com sucesso.", type: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao exportar patrocinadores.";
      notify({ message, type: "error" });
    } finally {
      setExportando(false);
    }
  };

  const handleExportMetrics = async () => {
    if (!tenantSlug) {
      notify({ message: "Selecione um racha antes de exportar metricas.", type: "warning" });
      return;
    }

    const params = new URLSearchParams();
    params.set("slug", tenantSlug);
    params.set("format", metricsExportFormat);
    params.set("start", metricsConfig.start);
    params.set("end", metricsConfig.end);
    params.set("granularity", metricsConfig.granularity);
    if (metricsTier !== "all") {
      params.append("tier", metricsTier);
    }

    setMetricsExportando(true);
    try {
      const response = await fetch(
        `/api/admin/patrocinadores/metrics/export?${params.toString()}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData && typeof errorData.error === "string"
            ? errorData.error
            : "Falha ao exportar metricas de patrocinadores") as string
        );
      }

      const blob = await response.blob();
      const filename =
        extractFilename(response.headers.get("Content-Disposition")) ??
        `metricas-patrocinadores.${metricsExportFormat}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      notify({ message: "Export de metricas gerado com sucesso.", type: "success" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao exportar metricas de patrocinadores.";
      notify({ message, type: "error" });
    } finally {
      setMetricsExportando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Patrocinadores • Fut7Pro</title>
      </Head>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Gestao de Patrocinadores</h1>
            <p className="text-sm text-gray-400">
              Cadastre, organize e acompanhe os resultados dos patrocinadores do seu racha em tempo
              real.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNovo}
            disabled={atingiuLimite || !tenantSlug}
            className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {atingiuLimite ? "Limite de patrocinadores atingido" : "Cadastrar novo"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filtroTier}
              onChange={(e) => setFiltroTier(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              <option value="">Todos os tiers</option>
              <option value="BASIC">Basic</option>
              <option value="PLUS">Plus</option>
              <option value="PRO">Pro</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="em_breve">Em breve</option>
              <option value="expirado">Expirados</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300 bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-yellow-400"
                checked={somenteFooter}
                onChange={(e) => setSomenteFooter(e.target.checked)}
              />
              Somente rodape
            </label>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={formatoExport}
              onChange={(e) => setFormatoExport(e.target.value as typeof formatoExport)}
              className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportando || !tenantSlug}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {exportando ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FaDownload />
                  Exportar {formatoExport.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>

        <section className="bg-[#151515] border border-neutral-800 rounded-2xl p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <FaChartLine className="text-yellow-400" />
                Desempenho dos patrocinadores
              </div>
              <p className="text-sm text-gray-400">
                Impressoes, cliques e CTR consolidados diretamente do backend multi-tenant.
              </p>
              {lastUpdated && (
                <p className="mt-1 text-xs text-gray-500">Atualizado em {lastUpdated}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={metricsRange}
                onChange={(e) => setMetricsRange(e.target.value as MetricsRangeValue)}
                className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
              >
                {METRICS_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={metricsTier}
                onChange={(e) => setMetricsTier(e.target.value as "all" | SponsorTier)}
                className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
              >
                <option value="all">Todos os tiers</option>
                <option value="BASIC">Basic</option>
                <option value="PLUS">Plus</option>
                <option value="PRO">Pro</option>
              </select>
              <select
                value={metricsExportFormat}
                onChange={(e) =>
                  setMetricsExportFormat(e.target.value as typeof metricsExportFormat)
                }
                className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
                <option value="pdf">PDF</option>
              </select>
              <button
                type="button"
                onClick={handleExportMetrics}
                disabled={metricsExportando || !tenantSlug}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {metricsExportando ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Exportar {metricsExportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>

          {metricsError && (
            <div className="mt-4 p-3 rounded-lg border border-red-500 bg-red-900/40 text-sm text-red-200">
              Falha ao carregar metricas de patrocinadores. Tente novamente mais tarde.
            </div>
          )}

          {metricsLoading && !metrics && (
            <div className="mt-4 p-3 rounded-lg border border-neutral-800 bg-neutral-900 text-sm text-gray-300">
              Carregando metricas...
            </div>
          )}

          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
                {summaryCards.map((card) => {
                  const progressPercent = Math.round(card.progress * 100);
                  const barClass = progressBarClass(card.progress);
                  const textClass = progressTextClass(card.progress);
                  return (
                    <div
                      key={card.key}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-wide">
                        {card.icon}
                        {card.title}
                      </div>
                      <div>
                        <span className="text-2xl font-semibold text-white">
                          {card.formatter(card.value)}
                        </span>
                        {card.showProgress && card.goal > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            Meta {card.formatter(card.goal)}
                          </span>
                        )}
                      </div>
                      {card.showProgress && card.goal > 0 ? (
                        <>
                          <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full ${barClass}`}
                              style={{ width: `${Math.min(100, progressPercent)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${textClass}`}>
                            {progressPercent}% da meta atingida
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {card.key === "sponsors"
                            ? "Patrocinadores com metricas registradas no periodo."
                            : "Meta nao definida para este indicador."}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FaChartLine className="text-blue-300" />
                    Evolucao de impressoes x cliques
                  </h3>
                  <p className="text-xs text-gray-500">
                    Visualize o alcance dos patrocinadores ao longo do periodo selecionado.
                  </p>
                  <div className="mt-4 h-56">
                    {metricsTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metricsTrend}>
                          <CartesianGrid stroke="#202020" strokeDasharray="3 3" />
                          <XAxis dataKey="label" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" tickFormatter={(value) => formatNumber(value)} />
                          <Tooltip
                            contentStyle={{
                              background: "#111",
                              borderRadius: 8,
                              border: "1px solid #333",
                            }}
                            formatter={(value: number, name: string) => [
                              formatNumber(value),
                              name === "impressions" ? "Impressoes" : "Cliques",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="impressions"
                            stroke="#f59e0b"
                            fill="#f59e0b33"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="clicks"
                            stroke="#22c55e"
                            fill="#22c55e33"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        Nenhuma metrica registrada para montar o grafico.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FaExclamationTriangle className="text-orange-400" />
                    Alertas e oportunidades
                  </h3>
                  <p className="text-xs text-gray-500">
                    Acompanhe patrocinadores que precisam de reforco na visibilidade ou estao perto
                    do vencimento.
                  </p>
                  <div className="mt-4 space-y-3">
                    {alerts.length > 0 ? (
                      alerts.map((alert, index) => (
                        <div
                          key={`${alert.message}-${index}`}
                          className={`rounded-lg border p-3 text-sm ${
                            alert.type === "critical"
                              ? "border-red-500 bg-red-500/10 text-red-200"
                              : "border-yellow-400 bg-yellow-500/10 text-yellow-100"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <FaExclamationTriangle className="mt-1" />

                            <div>
                              <p>{alert.message}</p>

                              {alert.sponsorId && (
                                <p className="mt-1 text-xs opacity-75">
                                  ID: {alert.sponsorId}
                                  {alert.tier ? ` · Tier ${alert.tier}` : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-sm text-gray-400">
                        Nenhum alerta no periodo selecionado. Excelente trabalho!
                      </div>
                    )}
                  </div>

                  {derivedAlerts.length > 0 && (
                    <div className="mt-3 rounded-lg border border-dashed border-yellow-600/60 bg-yellow-500/10 p-3 text-xs text-yellow-100">
                      Follow-up com marketing: use a automacao{" "}
                      <span className="font-semibold">"ROI critico (Marketing)"</span> no painel
                      SuperAdmin ou alinhe o time comercial sempre que aparecer um alerta critico de
                      ROI/CPC.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-white mb-4">Resumo por tier</h3>
                  {tierResumo.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-200">
                      <thead className="text-xs uppercase text-gray-400">
                        <tr className="border-b border-neutral-800">
                          <th className="py-2 pr-4">Tier</th>
                          <th className="py-2 pr-4">Impressoes</th>
                          <th className="py-2 pr-4">Cliques</th>
                          <th className="py-2 pr-4">CTR</th>
                          <th className="py-2 pr-4">Patrocinadores</th>
                          <th className="py-2 pr-4">Meta</th>
                          <th className="py-2 pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tierResumo.map((tier) => {
                          const meta = STATUS_META[tier.status];
                          return (
                            <tr key={tier.tier} className="border-b border-neutral-800/60">
                              <td className="py-2 pr-4 font-semibold text-white">{tier.tier}</td>
                              <td className="py-2 pr-4">{formatNumber(tier.impressions)}</td>
                              <td className="py-2 pr-4">{formatNumber(tier.clicks)}</td>
                              <td className="py-2 pr-4">{formatPercent(tier.ctr)}</td>
                              <td className="py-2 pr-4">{tier.sponsors}</td>
                              <td className="py-2 pr-4 text-xs text-gray-500">
                                {formatNumber(tier.goals.impressions)} /{" "}
                                {formatNumber(tier.goals.clicks)} • CTR{" "}
                                {formatPercent(tier.goals.ctr)}
                              </td>
                              <td className="py-2 pr-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.badge} ${meta.color}`}
                                >
                                  <FaCheckCircle className="hidden sm:block" />
                                  {meta.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Nenhum patrocinador neste tier para o periodo atual.
                    </div>
                  )}
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-x-auto">
                  <h3 className="text-sm font-semibold text-white mb-4">
                    Top patrocinadores por cliques
                  </h3>
                  {topSponsors.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-200">
                      <thead className="text-xs uppercase text-gray-400">
                        <tr className="border-b border-neutral-800">
                          <th className="py-2 pr-4">Patrocinador</th>
                          <th className="py-2 pr-4">Tier</th>
                          <th className="py-2 pr-4">Impressoes</th>
                          <th className="py-2 pr-4">Cliques</th>
                          <th className="py-2 pr-4">CTR</th>
                          <th className="py-2 pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSponsors.map((sponsor) => {
                          const meta = STATUS_META[sponsor.status];
                          return (
                            <tr key={sponsor.sponsorId} className="border-b border-neutral-800/60">
                              <td className="py-2 pr-4 font-semibold text-white">{sponsor.name}</td>
                              <td className="py-2 pr-4">{sponsor.tier}</td>
                              <td className="py-2 pr-4">{formatNumber(sponsor.impressions)}</td>
                              <td className="py-2 pr-4">{formatNumber(sponsor.clicks)}</td>
                              <td className="py-2 pr-4">{formatPercent(sponsor.ctr)}</td>
                              <td className="py-2 pr-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.badge} ${meta.color}`}
                                >
                                  {meta.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Nenhum patrocinador registrou cliques no periodo selecionado.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FaMoneyBillWave className="text-emerald-400" />
                    ROI consolidado (cliques x investimento)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Compara o valor registrado nos contratos com os cliques medidos pelo backend.
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Investimento monitorado
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(monitoradoInvestmentTotal)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatCurrency(totalInvestimentoPlanejado)} planejados no total
                      </p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Custo medio por clique
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {monitoradoCpc ? formatCurrency(monitoradoCpc) : "—"}
                      </p>
                      <p className="text-[11px] text-gray-500">Divisao do contrato pelos cliques</p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">CPM estimado</p>
                      <p className="text-lg font-semibold text-white">
                        {monitoradoCpm ? formatCurrency(monitoradoCpm) : "—"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Investimento para cada 1.000 views
                      </p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        ROI (cliques por R$)
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {monitoradoRoi ? `${formatDecimal(monitoradoRoi)} cliques` : "—"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Aproveitamento medio por cada real investido
                      </p>
                    </div>
                  </div>
                  {!monitoradoInvestmentTotal && (
                    <div className="mt-4 rounded-lg border border-dashed border-yellow-600/60 bg-yellow-500/10 p-3 text-xs text-yellow-200">
                      Registre o valor dos contratos para habilitar o calculo de ROI e custo medio.
                    </div>
                  )}
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-x-auto">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <FaPercent className="text-purple-300" />
                    ROI por patrocinador (cliques x contrato)
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Calculado somando cliques do periodo e os valores cadastrados em cada acordo.
                  </p>
                  {sponsorFinancialRows.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-200">
                      <thead className="text-xs uppercase text-gray-400">
                        <tr className="border-b border-neutral-800">
                          <th className="py-2 pr-4">Patrocinador</th>
                          <th className="py-2 pr-4">Investimento</th>
                          <th className="py-2 pr-4">Cliques</th>
                          <th className="py-2 pr-4">CPC</th>
                          <th className="py-2 pr-4">ROI</th>
                          <th className="py-2 pr-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sponsorFinancialRows.map((row) => {
                          const meta = STATUS_META[row.status];
                          return (
                            <tr
                              key={`roi-${row.sponsorId}`}
                              className="border-b border-neutral-800/60"
                            >
                              <td className="py-2 pr-4 font-semibold text-white">
                                {row.name}
                                <span className="block text-[11px] text-gray-500">
                                  Tier {row.tier}
                                </span>
                              </td>
                              <td className="py-2 pr-4">{formatCurrency(row.investment)}</td>
                              <td className="py-2 pr-4">{formatNumber(row.clicks)}</td>
                              <td className="py-2 pr-4">
                                {row.cpc ? formatCurrency(row.cpc) : "—"}
                              </td>
                              <td className="py-2 pr-4">
                                {row.roi ? `${formatDecimal(row.roi)} cliques/R$` : "—"}
                              </td>
                              <td className="py-2 pr-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.badge} ${meta.color}`}
                                >
                                  {meta.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Cadastre valores para os patrocinadores ativos para medir o ROI do contrato.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {!metrics && !metricsLoading && !metricsError && (
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm text-gray-400">
              Nenhuma metrica registrada para o periodo selecionado.
            </div>
          )}
        </section>

        {!tenantSlug && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-500 bg-yellow-900/30 text-sm text-yellow-200">
            Selecione um racha valido para gerenciar seus patrocinadores.
          </div>
        )}

        {error && tenantSlug && (
          <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-900/40 text-sm text-red-200">
            Falha ao carregar patrocinadores. Tente novamente mais tarde.
          </div>
        )}

        <CardResumoPatrocinio patrocinadores={patrocinadores} periodo={periodo} />

        <ToggleVisibilidadePublica visivel={footerVisivel} onToggle={handleToggleVisibilidade} />

        {isLoading && (
          <div className="w-full py-8 text-center text-gray-300 text-sm">
            Carregando patrocinadores...
          </div>
        )}

        {!isLoading && (
          <TabelaPatrocinadores
            patrocinadores={patrocinadoresFiltrados}
            onEditar={handleEditar}
            onExcluir={handleExcluir}
            onToggleFooter={handleToggleSponsorFooter}
            onNovo={handleNovo}
          />
        )}

        <ModalPatrocinador
          open={modalOpen}
          onClose={() => {
            if (submitting) return;
            setModalOpen(false);
            setSelectedSponsor(null);
          }}
          onSave={handleSave}
          initial={selectedSponsor}
          submitting={submitting}
        />
      </div>
    </>
  );
}

function extractFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (!filenameMatch) return null;
  try {
    const raw = filenameMatch[1];
    if (raw.startsWith("UTF-8''")) {
      return decodeURIComponent(raw.slice(7));
    }
    return decodeURIComponent(raw.replace(/"/g, ""));
  } catch {
    return null;
  }
}
