// src/app/admin/relatorios/page.tsx
"use client";

import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  FaArrowRight,
  FaCamera,
  FaChartLine,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaShareAlt,
  FaSpinner,
  FaSync,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/context/NotificationContext";
import {
  EXPORT_TARGETS,
  type ExportTargetId,
  type ExportTargetMeta,
} from "@/constants/export-targets";

const PERIODOS = [
  { label: "Hoje", value: "hoje" },
  { label: "Esta Semana", value: "semana" },
  { label: "Este Mês", value: "mes" },
  { label: "Este Ano", value: "ano" },
  { label: "Sempre", value: "all" },
] as const;

const MOCKS = {
  hoje: { acessos: 52, jogadores: 17, engajamento: 34, tempo: "5m 41s" },
  semana: { acessos: 378, jogadores: 39, engajamento: 113, tempo: "7m 21s" },
  mes: { acessos: 1402, jogadores: 52, engajamento: 488, tempo: "8m 12s" },
  ano: { acessos: 17740, jogadores: 86, engajamento: 4102, tempo: "7m 47s" },
  all: { acessos: 18844, jogadores: 94, engajamento: 4388, tempo: "7m 50s" },
};

type PeriodoType = (typeof PERIODOS)[number]["value"];
type MetricsType = (typeof MOCKS)[PeriodoType];

type ExportStatus = {
  state: "idle" | "loading" | "success" | "error";
  detail?: string;
  updatedAt?: number;
};

type ExportHistoryEntry = {
  targetId: ExportTargetId;
  label: string;
  state: ExportStatus["state"];
  detail?: string;
  timestamp: number;
};

type DiagnosticsApiEntry = {
  targetId: ExportTargetId;
  state: "success" | "error";
  detail?: string;
  statusCode?: number;
  timestamp?: string;
};

function compartilharRelatorio(periodo: PeriodoType) {
  const label = PERIODOS.find((p) => p.value === periodo)?.label || periodo;
  const metrics = MOCKS[periodo];
  const texto = `Relatório de Engajamento Fut7Pro - ${label}\n\nAcessos: ${metrics.acessos}\nJogadores: ${metrics.jogadores}\nEngajamento: ${metrics.engajamento}\nTempo médio: ${metrics.tempo}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator
      .share({
        title: "Relatório de Engajamento",
        text: texto,
      })
      .catch(() => {});
  } else {
    alert("Seu navegador não suporta compartilhamento direto.");
  }
}

const STATUS_LABELS: Record<ExportStatus["state"], string> = {
  idle: "Aguardando",
  loading: "Testando…",
  success: "OK",
  error: "Erro",
};

const STATUS_CLASSES: Record<ExportStatus["state"], string> = {
  idle: "bg-neutral-800 text-gray-300",
  loading: "bg-yellow-500/20 text-yellow-300",
  success: "bg-emerald-500/20 text-emerald-300",
  error: "bg-red-500/20 text-red-300",
};

function StatusBadge({ status }: { status: ExportStatus }) {
  const state = status.state;
  const Icon =
    state === "success" ? FaCheck : state === "error" ? FaExclamationTriangle : FaSpinner;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[state]}`}
    >
      <Icon className={state === "loading" ? "animate-spin" : ""} />
      {STATUS_LABELS[state]}
    </span>
  );
}

function ExportDiagnosticsCard({ tenantSlug }: { tenantSlug: string | null }) {
  const { notify } = useNotification();
  const [statuses, setStatuses] = useState<Record<ExportTargetId, ExportStatus>>(() =>
    EXPORT_TARGETS.reduce(
      (acc, target) => {
        acc[target.id] = { state: "idle" };
        return acc;
      },
      {} as Record<ExportTargetId, ExportStatus>
    )
  );
  const [runningAll, setRunningAll] = useState(false);
  const [history, setHistory] = useState<ExportHistoryEntry[]>([]);

  const recordHistory = useCallback((target: ExportTargetMeta, status: ExportStatus) => {
    const timestamp = status.updatedAt ?? Date.now();
    setHistory((prev) => {
      const next = [
        {
          targetId: target.id,
          label: target.label,
          state: status.state,
          detail: status.detail,
          timestamp,
        },
        ...prev,
      ];
      return next.slice(0, 12);
    });
  }, []);

  const mapResultToStatus = useCallback((result: DiagnosticsApiEntry): ExportStatus => {
    const parsedTimestamp = result.timestamp ? Date.parse(result.timestamp) : Date.now();
    return {
      state: result.state === "success" ? "success" : "error",
      detail:
        result.detail ??
        (result.state === "success" ? "Exportacao validada." : "Falha ao validar exportacao."),
      updatedAt: Number.isNaN(parsedTimestamp) ? Date.now() : parsedTimestamp,
    };
  }, []);

  const runDiagnostics = useCallback(
    async (targetId?: ExportTargetId) => {
      const payload: Record<string, unknown> = {};
      if (targetId) {
        payload.targetId = targetId;
      }
      if (tenantSlug) {
        payload.slug = tenantSlug;
      }

      const response = await fetch("/api/admin/relatorios/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok !== true) {
        const message =
          (data && typeof data.error === "string" && data.error) || `HTTP ${response.status}`;
        throw new Error(message);
      }

      const results = Array.isArray(data.results) ? data.results : [];
      return results.filter((entry: unknown): entry is DiagnosticsApiEntry => {
        return Boolean(entry && typeof (entry as DiagnosticsApiEntry).targetId === "string");
      });
    },
    [tenantSlug]
  );

  const testTarget = useCallback(
    async (target: ExportTargetMeta) => {
      setStatuses((prev) => ({
        ...prev,
        [target.id]: { state: "loading" },
      }));
      try {
        const diagnostics = await runDiagnostics(target.id);
        const result = diagnostics.find((entry) => entry.targetId === target.id);
        if (!result) {
          throw new Error("Diagnostico nao retornou dados.");
        }
        const status = mapResultToStatus(result);
        setStatuses((prev) => ({
          ...prev,
          [target.id]: status,
        }));
        recordHistory(target, status);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Falha ao testar a exportacao. Tente novamente.";
        const fallback: ExportStatus = {
          state: "error",
          detail: message,
          updatedAt: Date.now(),
        };
        setStatuses((prev) => ({
          ...prev,
          [target.id]: fallback,
        }));
        recordHistory(target, fallback);
        notify({
          message: `${target.label}: ${message}`,
          type: "error",
        });
      }
    },
    [runDiagnostics, mapResultToStatus, recordHistory, notify]
  );

  const handleTestAll = useCallback(async () => {
    setRunningAll(true);
    try {
      const diagnostics = await runDiagnostics();
      const updates: Partial<Record<ExportTargetId, ExportStatus>> = {};
      const seen = new Set<ExportTargetId>();
      diagnostics.forEach((entry) => {
        const status = mapResultToStatus(entry);
        updates[entry.targetId] = status;
        seen.add(entry.targetId);
        const targetMeta = EXPORT_TARGETS.find((item) => item.id === entry.targetId);
        if (targetMeta) {
          recordHistory(targetMeta, status);
        }
      });
      EXPORT_TARGETS.forEach((target) => {
        if (!seen.has(target.id)) {
          const fallback: ExportStatus = {
            state: "error",
            detail: "Diagnostico nao retornou dados.",
            updatedAt: Date.now(),
          };
          updates[target.id] = fallback;
          recordHistory(target, fallback);
        }
      });
      setStatuses((prev) => ({
        ...prev,
        ...updates,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha geral ao testar exportacoes.";
      setStatuses((prev) => {
        const next = { ...prev };
        EXPORT_TARGETS.forEach((target) => {
          next[target.id] = {
            state: "error",
            detail: message,
            updatedAt: Date.now(),
          };
        });
        return next;
      });
      notify({ message, type: "error" });
    } finally {
      setRunningAll(false);
    }
  }, [runDiagnostics, mapResultToStatus, recordHistory, notify]);

  useEffect(() => {
    handleTestAll();
  }, [handleTestAll]);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <FaSync className="text-cyan-400" />
          <h2 className="text-xl font-semibold text-yellow-400">Auditoria de Exportações</h2>
        </div>
        <p className="text-sm text-gray-400">
          Execute testes para garantir que os arquivos de financeiro, rankings e patrocinadores
          estejam sendo gerados corretamente via backend. Os resultados ficam registrados para
          auditoria e suporte.
        </p>
      </div>
      <div className="bg-[#1c1f26] border border-[#2a2f3a] rounded-2xl divide-y divide-[#2a2f3a]">
        {EXPORT_TARGETS.map((target) => {
          const status = statuses[target.id];
          return (
            <div
              key={target.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4"
            >
              <div className="flex-1">
                <p className="text-base font-semibold text-white">{target.label}</p>
                <p className="text-sm text-gray-400">{target.description}</p>
                {status.detail && (
                  <p className="text-[13px] text-gray-500 mt-1">Último retorno: {status.detail}</p>
                )}
                {status.updatedAt && (
                  <p className="text-[11px] text-gray-500">
                    Atualizado em {new Date(status.updatedAt).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={status} />
                <button
                  type="button"
                  onClick={() => testTarget(target)}
                  disabled={status.state === "loading" || runningAll}
                  className="px-4 py-2 rounded-full border border-cyan-600 text-sm font-semibold text-cyan-200 hover:bg-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Testar
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleTestAll}
          disabled={runningAll}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {runningAll && <FaSpinner className="animate-spin" />}
          Testar Tudo
        </button>
      </div>
      {history.length > 0 && (
        <div className="mt-6 bg-[#16181e] border border-[#232730] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FaClock className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
              Histórico de testes
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            {history.slice(0, 10).map((entry, index) => (
              <li key={`${entry.targetId}-${entry.timestamp}-${index}`} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{entry.label}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString("pt-BR")}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    entry.state === "success"
                      ? "text-emerald-300"
                      : entry.state === "error"
                        ? "text-red-300"
                        : "text-yellow-300"
                  }`}
                >
                  {STATUS_LABELS[entry.state]}
                </span>
                {entry.detail && (
                  <span className="text-xs text-gray-400">Retorno: {entry.detail}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const RANKING_TYPES: Array<{ label: string; value: string }> = [
  { label: "Ranking Geral", value: "geral" },
  { label: "Artilheiros", value: "artilheiros" },
  { label: "Assistências", value: "assistencias" },
];

const RANKING_FORMATS = [
  { label: "CSV", value: "csv" },
  { label: "Excel (XLSX)", value: "xlsx" },
  { label: "PDF", value: "pdf" },
] as const;

type RankingFormatValue = (typeof RANKING_FORMATS)[number]["value"];

const POSITION_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Todas as posições", value: "" },
  { label: "Goleiros", value: "goleiro" },
  { label: "Defensores", value: "defensor" },
  { label: "Meias", value: "meia" },
  { label: "Atacantes", value: "atacante" },
];

type RankingPeriod = "all" | "year" | "quarter" | "custom";

function RankingExportForm({ tenantSlug }: { tenantSlug: string | null }) {
  const [type, setType] = useState("geral");
  const [format, setFormat] = useState<RankingFormatValue>("csv");
  const [limit, setLimit] = useState(50);
  const [position, setPosition] = useState("");
  const [period, setPeriod] = useState<RankingPeriod>("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [exportando, setExportando] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const isCustomPeriod = period === "custom";
  const canExport = !exportando && (!isCustomPeriod || (start && end));

  const handleExport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canExport) return;
    setExportando(true);
    setFeedback(null);

    const params = new URLSearchParams({
      type,
      format,
      limit: String(limit),
    });

    if (position) {
      params.set("position", position);
    }

    if (period !== "all") {
      params.set("period", period);
    }

    if (isCustomPeriod) {
      params.set("start", start);
      params.set("end", end);
    }

    if (tenantSlug) {
      params.set("slug", tenantSlug);
    }

    try {
      const response = await fetch(`/api/admin/rankings/export?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload && typeof payload.error === "string" && payload.error) ||
          "Falha ao exportar rankings.";
        setFeedback({ ok: false, message });
      } else {
        const blob = await response.blob();
        const filename = `ranking-${type}.${format}`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setFeedback({ ok: true, message: "Exportação gerada com sucesso." });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setFeedback({ ok: false, message });
    } finally {
      setExportando(false);
    }
  };

  return (
    <section className="bg-[#181b20] rounded-2xl shadow p-6 mb-10 border border-neutral-800">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-yellow-300">Exportar Rankings Detalhados</h2>
          <p className="text-sm text-gray-400">
            Gere arquivos com filtros de posição, limite de atletas e período customizado.
          </p>
        </div>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleExport}>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300 font-semibold">Tipo de ranking</label>
          <select
            className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {RANKING_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300 font-semibold">Formato</label>
          <select
            className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
            value={format}
            onChange={(event) =>
              setFormat(event.target.value as (typeof RANKING_FORMATS)[number]["value"])
            }
          >
            {RANKING_FORMATS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300 font-semibold">Limite de atletas</label>
          <input
            type="number"
            min={5}
            max={200}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300 font-semibold">Filtrar por posição</label>
          <select
            className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300 font-semibold">Período</label>
          <select
            className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
            value={period}
            onChange={(event) => setPeriod(event.target.value as RankingPeriod)}
          >
            <option value="all">Histórico completo</option>
            <option value="year">Ano atual</option>
            <option value="quarter">Quadrimestre atual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        {isCustomPeriod && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300 font-semibold">Início</label>
              <input
                type="date"
                className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300 font-semibold">Fim</label>
              <input
                type="date"
                className="bg-[#101214] border border-neutral-700 rounded px-3 py-2 text-white text-sm"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
              />
            </div>
          </div>
        )}
        <div className="md:col-span-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={!canExport}
            className={`w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-semibold transition ${
              canExport
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {exportando ? "Gerando..." : "Exportar rankings"}
          </button>
          {feedback && (
            <span className={`text-sm ${feedback.ok ? "text-green-300" : "text-red-300"}`}>
              {feedback.message}
            </span>
          )}
          {!tenantSlug && (
            <span className="text-xs text-yellow-400">
              Faça login em um racha válido para gerar o arquivo com os dados corretos.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

export default function RelatoriosPage() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? null;
  const [periodo, setPeriodo] = useState<PeriodoType>("semana");
  const metrics = MOCKS[periodo];
  const relatorioRef = useRef<HTMLDivElement>(null);

  async function baixarImagemRelatorio() {
    if (!relatorioRef.current) return;
    const canvas = await html2canvas(relatorioRef.current, {
      useCORS: true,
      backgroundColor: "#181b20",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `relatorio-engajamento-${periodo}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <>
      <Head>
        <title>Relatórios de Engajamento | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Visualize métricas detalhadas do engajamento do seu racha: acessos, jogadores, visualizações e tempo médio. Painel profissional do Fut7Pro."
        />
        <meta
          name="keywords"
          content="relatórios racha, engajamento fut7, métricas futebol, dashboard fut7pro, analytics racha"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 bg-fundo min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-cyan-400 text-3xl" />
              <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
                Relatórios de Engajamento
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={baixarImagemRelatorio}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm shadow transition"
              >
                <FaCamera /> Baixar Relatório
              </button>
              <button
                onClick={() => compartilharRelatorio(periodo)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow transition"
              >
                <FaShareAlt /> Compartilhar
              </button>
            </div>
          </div>

          <div ref={relatorioRef} className="bg-[#181b20] p-4 rounded-2xl shadow-lg">
            <p className="text-gray-300 mb-8">
              Acompanhe as principais métricas do seu racha: acessos, engajamento, tempo médio e
              movimentações.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {PERIODOS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm border ${
                    periodo === p.value
                      ? "bg-cyan-500 text-white border-cyan-600"
                      : "bg-[#181b20] text-gray-300 border-[#23272f] hover:bg-cyan-900"
                  } transition`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaEye className="text-cyan-300 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.acessos}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Acessos</div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaUsers className="text-yellow-400 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.jogadores}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Jogadores únicos
                </div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaUserCheck className="text-green-400 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.engajamento}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Engajamentos
                </div>
              </div>
              <div className="bg-[#21272c] rounded-xl p-6 flex flex-col items-center shadow">
                <FaClock className="text-cyan-200 text-2xl mb-1" />
                <div className="text-2xl font-bold text-white">{metrics.tempo}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  Tempo médio
                </div>
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6 mb-10">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-cyan-400 mr-2" />
                <span className="text-white font-bold">
                  Evolução do Engajamento ({PERIODOS.find((p) => p.value === periodo)?.label})
                </span>
              </div>
              <div className="w-full h-48 flex items-center justify-center text-gray-500 bg-[#181B20] rounded-lg">
                <span className="text-lg font-semibold opacity-60">[GRÁFICO DE ENG. AQUI]</span>
              </div>
            </div>

            <div className="bg-[#23272F] rounded-xl shadow p-6">
              <div className="flex items-center mb-4">
                <FaArrowRight className="text-yellow-400 mr-2" />
                <span className="text-white font-bold">Movimentações Recentes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-[#23272F]">
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Evento</th>
                      <th className="py-2 px-3">Jogador</th>
                      <th className="py-2 px-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#181B20]">
                      <td className="py-2 px-3 text-gray-300">06/07/2025</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">Acesso ao painel</td>
                      <td className="py-2 px-3 text-white">Matheus Silva</td>
                      <td className="py-2 px-3 text-gray-400">Mobile - 7m31s</td>
                    </tr>
                    <tr className="border-b border-[#181B20]">
                      <td className="py-2 px-3 text-gray-300">06/07/2025</td>
                      <td className="py-2 px-3 text-yellow-400 font-semibold">Ranking acessado</td>
                      <td className="py-2 px-3 text-white">Lucas Rocha</td>
                      <td className="py-2 px-3 text-gray-400">Desktop - 3m45s</td>
                    </tr>
                    <tr className="border-b border-[#181B20]">
                      <td className="py-2 px-3 text-gray-300">05/07/2025</td>
                      <td className="py-2 px-3 text-green-400 font-semibold">Perfil visualizado</td>
                      <td className="py-2 px-3 text-white">Pedro Alves</td>
                      <td className="py-2 px-3 text-gray-400">Mobile - 1m58s</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-gray-300">05/07/2025</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">Acesso ao painel</td>
                      <td className="py-2 px-3 text-white">Carlos Freitas</td>
                      <td className="py-2 px-3 text-gray-400">Desktop - 6m12s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <RankingExportForm tenantSlug={tenantSlug} />
          <ExportDiagnosticsCard tenantSlug={tenantSlug} />
        </div>
      </main>
    </>
  );
}
