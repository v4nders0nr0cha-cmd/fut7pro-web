"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  FaDatabase,
  FaPlayCircle,
  FaSyncAlt,
  FaClock,
  FaBug,
  FaLifeRing,
  FaExternalLinkAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { useRacha } from "@/context/RachaContext";

type FeedbackTone = "success" | "error";
type DiagnosticsStatusTone = "success" | "warning" | "danger" | "neutral";

type DiagnosticsRecord = {
  id: string;
  createdAt: string | null;
  statusRaw: string;
  statusLabel: string;
  statusTone: DiagnosticsStatusTone;
  message: string;
  location: string | null;
};

type FetchError = Error & { status?: number };

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(source: Record<string, unknown> | null, keys: string[]): string {
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickNumber(source: Record<string, unknown> | null, keys: string[]): number | null {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function pickDateValue(source: Record<string, unknown> | null): string | null {
  if (!source) return null;
  const raw = pickString(source, [
    "createdAt",
    "created_at",
    "timestamp",
    "executedAt",
    "updatedAt",
    "date",
  ]);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function resolveStatus(rawStatus: string): {
  label: string;
  tone: DiagnosticsStatusTone;
} {
  const normalized = rawStatus.toLowerCase();

  if (
    normalized.includes("success") ||
    normalized.includes("sucesso") ||
    normalized.includes("ok") ||
    normalized.includes("done") ||
    normalized.includes("conclu")
  ) {
    return { label: "Concluído", tone: "success" };
  }
  if (
    normalized.includes("pending") ||
    normalized.includes("pendente") ||
    normalized.includes("running") ||
    normalized.includes("process") ||
    normalized.includes("queue")
  ) {
    return { label: "Em andamento", tone: "warning" };
  }
  if (
    normalized.includes("error") ||
    normalized.includes("erro") ||
    normalized.includes("failed") ||
    normalized.includes("falh")
  ) {
    return { label: "Falhou", tone: "danger" };
  }
  return { label: "Executado", tone: "neutral" };
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asObject(payload);
  if (!root) return [];

  const directKeys = ["history", "data", "results", "items", "records", "diagnostics"];
  for (const key of directKeys) {
    const value = root[key];
    if (Array.isArray(value)) return value;
    const nested = asObject(value);
    if (!nested) continue;
    for (const nestedKey of directKeys) {
      const nestedValue = nested[nestedKey];
      if (Array.isArray(nestedValue)) return nestedValue;
    }
  }

  const isSingleRecord =
    Boolean(pickDateValue(root)) ||
    Boolean(pickString(root, ["status", "state", "result"])) ||
    Boolean(pickString(root, ["message", "detail", "descricao"]));
  return isSingleRecord ? [root] : [];
}

function normalizeArtifactLocation(value: string | null, id: string): string | null {
  if (value && value.startsWith("/admin/relatorios/diagnostics/")) {
    return `/api${value}`;
  }
  if (value && value.startsWith("/api/admin/relatorios/diagnostics/")) {
    return value;
  }
  if (value && /^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/admin/relatorios/diagnostics/")) {
        return `/api${parsed.pathname}${parsed.search || ""}`;
      }
    } catch {
      return value;
    }
    return value;
  }
  return value || `/api/admin/relatorios/diagnostics/${encodeURIComponent(id)}/artifact`;
}

function normalizeRecord(item: unknown, index: number): DiagnosticsRecord | null {
  const source = asObject(item);
  if (!source) return null;

  const createdAt = pickDateValue(source);
  const statusRaw = pickString(source, ["status", "state", "result"]) || "executado";
  const status = resolveStatus(statusRaw);
  const message =
    pickString(source, ["message", "detail", "descricao", "summary", "description"]) ||
    "Execução registrada no histórico.";
  const id = pickString(source, ["id", "_id", "uuid"]) || `record-${index}`;
  const rawLocation =
    pickString(source, ["location", "url", "fileUrl", "downloadUrl", "artifactUrl"]) || null;
  const location = normalizeArtifactLocation(rawLocation, id);

  return {
    id,
    createdAt,
    statusRaw,
    statusLabel: status.label,
    statusTone: status.tone,
    message,
    location,
  };
}

function normalizeHistory(payload: unknown): DiagnosticsRecord[] {
  const parsed = extractList(payload)
    .map((item, index) => normalizeRecord(item, index))
    .filter((item): item is DiagnosticsRecord => Boolean(item));

  return parsed.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

function extractApiMessage(payload: unknown): string {
  const root = asObject(payload);
  if (!root) return "";
  const direct = pickString(root, ["message", "detail", "descricao"]);
  if (direct) return direct;
  const nested = asObject(root.data);
  return pickString(nested, ["message", "detail", "descricao"]);
}

function extractSummary(payload: unknown) {
  const root = asObject(payload);
  const summaryRoot = asObject(root?.summary ?? null);
  if (!summaryRoot) {
    return {
      lastExecution: null as DiagnosticsRecord | null,
      success: null as number | null,
      warning: null as number | null,
      failed: null as number | null,
    };
  }

  const lastExecution = summaryRoot.lastExecution
    ? normalizeRecord(summaryRoot.lastExecution, 0)
    : null;
  const success = pickNumber(summaryRoot, ["successCount", "success", "concludedCount"]);
  const failed = pickNumber(summaryRoot, ["failedCount", "failureCount", "failed"]);
  const running = pickNumber(summaryRoot, ["runningCount", "running"]) || 0;
  const pending = pickNumber(summaryRoot, ["pendingCount", "pending"]);
  const warning = pending !== null ? pending : running;

  return {
    lastExecution,
    success,
    warning,
    failed,
  };
}

function formatDatePtBr(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("pt-BR");
}

function toneClassName(tone: DiagnosticsStatusTone): string {
  if (tone === "success") return "bg-green-700/40 text-green-300 border-green-500/60";
  if (tone === "warning") return "bg-yellow-700/35 text-yellow-300 border-yellow-500/60";
  if (tone === "danger") return "bg-red-700/35 text-red-300 border-red-500/60";
  return "bg-gray-700/35 text-gray-200 border-gray-500/50";
}

function isArtifactLink(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function diagnosticsFetcher(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      (body as Record<string, unknown> | null)?.message?.toString() ||
        (body as Record<string, unknown> | null)?.error?.toString() ||
        "Não foi possível carregar os diagnósticos."
    ) as FetchError;
    error.status = response.status;
    throw error;
  }

  return body;
}

function getReadableError(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getHistoryErrorText(error: FetchError | undefined): string {
  if (!error) return "";
  if (error.status === 401) {
    return "Sua sessão expirou. Faça login novamente para acessar o histórico.";
  }
  if (error.status === 403) {
    return "Você não tem permissão para consultar diagnósticos deste racha.";
  }
  if (error.status === 404) {
    return "Diagnóstico não encontrado para o racha ativo.";
  }
  return getReadableError(error, "Falha ao carregar o histórico.");
}

export default function BackupPage() {
  const { tenantSlug } = useRacha();
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; text: string } | null>(null);
  const { data, error, isLoading, isValidating, mutate } = useSWR<unknown, FetchError>(
    "/api/admin/relatorios/diagnostics?limit=30",
    diagnosticsFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const history = useMemo(() => normalizeHistory(data), [data]);
  const historyErrorText = getHistoryErrorText(error);
  const apiSummary = useMemo(() => extractSummary(data), [data]);
  const latest = apiSummary.lastExecution ?? history[0] ?? null;
  const apiMessage = useMemo(() => extractApiMessage(data), [data]);

  const summary = useMemo(() => {
    const computedSuccess = history.filter((item) => item.statusTone === "success").length;
    const computedWarning = history.filter((item) => item.statusTone === "warning").length;
    const computedFailed = history.filter((item) => item.statusTone === "danger").length;

    return {
      success: apiSummary.success ?? computedSuccess,
      warning: apiSummary.warning ?? computedWarning,
      failed: apiSummary.failed ?? computedFailed,
    };
  }, [history, apiSummary]);

  const handleRunDiagnostics = async () => {
    setIsRunning(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/relatorios/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "admin-config-backup" }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (body as Record<string, unknown> | null)?.message?.toString() ||
            (body as Record<string, unknown> | null)?.error?.toString() ||
            "Não foi possível iniciar o diagnóstico."
        );
      }

      setFeedback({
        tone: "success",
        text:
          extractApiMessage(body) ||
          "Diagnóstico executado com sucesso. O histórico foi atualizado.",
      });
      await mutate();
    } catch (err) {
      setFeedback({
        tone: "error",
        text: getReadableError(err, "Erro ao executar diagnóstico de backup."),
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Head>
        <title>Backup & Recuperação | Fut7Pro Admin</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta
          name="description"
          content="Monitore diagnósticos, execute backup operacional e acione recuperação assistida com segurança no painel Fut7Pro."
        />
        <meta
          name="keywords"
          content="Fut7Pro, backup, recuperação, diagnóstico, histórico, segurança, admin"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaDatabase /> Backup & Recuperação
        </h1>

        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
          <b className="text-yellow-300">Operação de proteção de dados em produção.</b>
          <br />
          Esta área executa diagnósticos operacionais do racha e consolida o histórico de execuções
          para auditoria.
          <span className="text-gray-300 block mt-2">
            Tenant ativo: <b>{tenantSlug || "não identificado"}</b>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Última execução
            </div>
            <div className="text-base text-gray-100 font-semibold">
              {latest ? formatDatePtBr(latest.createdAt) : "Sem registros"}
            </div>
          </div>
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Execuções concluídas
            </div>
            <div className="text-base text-green-300 font-semibold">{summary.success}</div>
          </div>
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Execuções com falha
            </div>
            <div className="text-base text-red-300 font-semibold">{summary.failed}</div>
          </div>
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Em andamento / pendente
            </div>
            <div className="text-base text-yellow-300 font-semibold">{summary.warning}</div>
          </div>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mb-8">
          <div className="font-bold text-yellow-300 mb-3">Ações Operacionais</div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-4 py-2 rounded transition disabled:opacity-60 flex items-center gap-2"
              onClick={handleRunDiagnostics}
              disabled={isRunning}
            >
              <FaPlayCircle />
              {isRunning ? "Executando..." : "Executar diagnóstico agora"}
            </button>
            <button
              type="button"
              className="bg-[#1d1d1d] hover:bg-[#2a2a2a] text-yellow-300 font-bold px-4 py-2 rounded transition border border-yellow-700 flex items-center gap-2"
              onClick={() => mutate()}
              disabled={isValidating}
            >
              <FaSyncAlt className={isValidating ? "animate-spin" : ""} />
              Atualizar histórico
            </button>
            <Link
              href="/admin/administracao/logs"
              className="bg-[#1d1d1d] hover:bg-[#2a2a2a] text-yellow-300 font-bold px-4 py-2 rounded transition border border-yellow-700 flex items-center gap-2"
            >
              <FaBug />
              Ver logs administrativos
            </Link>
          </div>
          {!!apiMessage && !feedback && (
            <p className="text-xs text-gray-400 mt-3">Mensagem da API: {apiMessage}</p>
          )}
        </div>

        {feedback && (
          <div
            className={`rounded-lg p-3 mb-8 text-sm font-semibold border ${
              feedback.tone === "success"
                ? "bg-green-900/40 border-green-600 text-green-200"
                : "bg-red-900/40 border-red-600 text-red-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mb-8">
          <div className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <FaClock />
            Histórico de Execuções
          </div>
          {isLoading && <div className="text-sm text-gray-300">Carregando histórico...</div>}
          {!isLoading && historyErrorText && (
            <div className="text-sm text-red-300 border border-red-600/60 bg-red-950/40 rounded p-3">
              {historyErrorText}
            </div>
          )}
          {!isLoading && !historyErrorText && history.length === 0 && (
            <div className="text-sm text-gray-400">Nenhuma execução registrada até o momento.</div>
          )}
          {!isLoading && !historyErrorText && history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-yellow-800 text-gray-300">
                    <th className="py-2 pr-3">Data e hora</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Detalhes</th>
                    <th className="py-2">Artefato</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-[#2a2a2a] align-top">
                      <td className="py-3 pr-3 text-gray-200">{formatDatePtBr(item.createdAt)}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${toneClassName(item.statusTone)}`}
                          title={item.statusRaw}
                        >
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-300">{item.message}</td>
                      <td className="py-3 text-gray-300">
                        {item.location && isArtifactLink(item.location) ? (
                          <a
                            href={item.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-yellow-300 underline hover:text-yellow-200"
                          >
                            Abrir
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mb-8">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-2">
            <FaLifeRing />
            Recuperação Assistida
          </div>
          <p className="text-sm text-gray-200 mb-3">
            A restauração de dados é feita com validação operacional para evitar inconsistências
            entre tenants.
          </p>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>
              1. Abra um chamado no suporte com o slug do racha, data da ocorrência e contexto do
              problema.
            </li>
            <li>2. A equipe valida integridade e disponibilidade dos artefatos do diagnóstico.</li>
            <li>3. A recuperação é executada de forma controlada e auditada.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/comunicacao/suporte"
              className="bg-yellow-400 hover:bg-yellow-500 text-[#232323] font-bold px-4 py-2 rounded transition"
            >
              Abrir chamado de recuperação
            </Link>
            <a
              href="mailto:suporte@fut7pro.com.br?subject=Recupera%C3%A7%C3%A3o%20de%20dados%20-%20Fut7Pro"
              className="bg-[#1d1d1d] hover:bg-[#2a2a2a] text-yellow-300 font-bold px-4 py-2 rounded transition border border-yellow-700"
            >
              suporte@fut7pro.com.br
            </a>
          </div>
        </div>

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-1">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Quando devo executar diagnóstico manual?</b> Antes de mudanças sensíveis no painel
              ou ao investigar inconsistências.
            </li>
            <li>
              <b>O histórico é por racha?</b> Sim. O histórico é multi-tenant e respeita o racha
              ativo do administrador.
            </li>
            <li>
              <b>Posso restaurar diretamente por arquivo nesta tela?</b> Não. A recuperação segue
              fluxo assistido para garantir segurança e rastreabilidade.
            </li>
            <li>
              <b>Onde acompanho ações administrativas?</b> Em{" "}
              <Link href="/admin/administracao/logs" className="underline text-yellow-400">
                Administração &gt; Logs/Admin
              </Link>
              .
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <Link href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                Abrir chamado
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
