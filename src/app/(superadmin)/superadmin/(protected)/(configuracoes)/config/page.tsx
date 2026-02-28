"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  FaArrowRight,
  FaCheckCircle,
  FaCogs,
  FaDatabase,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaHistory,
  FaInfoCircle,
  FaKey,
  FaLink,
  FaSave,
  FaServer,
  FaShieldAlt,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useBranding } from "@/hooks/useBranding";
import type { PlanCatalog } from "@/lib/api/billing";

const OFFICIAL_YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Fut7Pro_app";
const DOMAIN_REGEX = /^(?!https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

type SuperAdminConfigLog = {
  createdAt?: string | null;
  message?: string | null;
};

type SuperAdminConfigResponse = {
  empresa?: string | null;
  logoUrl?: string | null;
  suporteEmail?: string | null;
  dominioPrincipal?: string | null;
  planoAtual?: string | null;
  vencimento?: string | null;
  webhookUrl?: string | null;
  apiKey?: string | null;
  alertaFinanceiro?: boolean | null;
  alertaUsuarioNovo?: boolean | null;
  alertaIncidentes?: boolean | null;
  backupAtivo?: boolean | null;
  centralAjudaConfig?: unknown;
  logs?: SuperAdminConfigLog[];
};

type DashboardData = {
  userCount?: number;
  adminCount?: number;
  tenantCount?: number;
  matchCount?: number;
  lastUpdated?: string;
};

type FinanceSummary = {
  receitaTotal?: number;
  mrr?: number;
  arr?: number;
  ticketMedio?: number;
  churn?: number;
  ativos?: number;
  inadimplentes?: number;
};

type FinanceData = {
  resumo?: FinanceSummary;
};

type SystemStats = {
  apiVersion?: string;
  nodeVersion?: string;
  uptime?: number;
  environment?: string;
  memoryUsage?: {
    rss?: number;
    heapTotal?: number;
    heapUsed?: number;
    external?: number;
  };
};

type HelpCenterConfig = {
  youtubeChannelUrl: string;
  youtubeChannelLabel: string;
  showVideos: boolean;
};

type FormState = {
  empresa: string;
  suporteEmail: string;
  dominioPrincipal: string;
  logoUrl: string;
  webhookUrl: string;
  apiKey: string;
  alertas: {
    financeiro: boolean;
    usuarioNovo: boolean;
    incidentes: boolean;
  };
  backupAtivo: boolean;
  centralAjuda: HelpCenterConfig;
  centralAjudaRaw: Record<string, unknown>;
};

const DEFAULT_FORM: FormState = {
  empresa: "",
  suporteEmail: "",
  dominioPrincipal: "",
  logoUrl: "",
  webhookUrl: "",
  apiKey: "",
  alertas: {
    financeiro: true,
    usuarioNovo: true,
    incidentes: true,
  },
  backupAtivo: false,
  centralAjuda: {
    youtubeChannelUrl: OFFICIAL_YOUTUBE_CHANNEL_URL,
    youtubeChannelLabel: "Canal oficial Fut7Pro",
    showVideos: false,
  },
  centralAjudaRaw: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function toText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function isAbsoluteUrl(value: string) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase();
}

function formatCurrency(value?: number | null) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatInteger(value?: number | null) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function formatDateOnly(value?: string | null) {
  if (!value) return "Não definido";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não definido";
  return date.toLocaleDateString("pt-BR");
}

function formatPercent(value?: number | null) {
  const numeric = Number(value ?? 0);
  return `${numeric.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatUptime(value?: number) {
  const totalSeconds = Math.max(0, Math.floor(Number(value ?? 0)));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(value?: number) {
  const bytes = Math.max(0, Number(value ?? 0));
  const units = ["B", "KB", "MB", "GB"];
  let current = bytes;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  const digits = current >= 10 ? 1 : 2;
  return `${current.toFixed(digits)} ${units[unitIndex]}`;
}

function maskApiKey(value: string) {
  const clean = value.trim();
  if (!clean) return "Não configurada";
  if (clean.length <= 8) return "********";
  return `${clean.slice(0, 4)}••••${clean.slice(-4)}`;
}

function parseHelpCenterConfig(
  rawConfig: unknown,
  fallbackChannelLabel: string
): { values: HelpCenterConfig; raw: Record<string, unknown> } {
  const raw = isRecord(rawConfig) ? rawConfig : {};
  const youtubeChannelUrl = toText(raw.youtubeChannelUrl, OFFICIAL_YOUTUBE_CHANNEL_URL);
  const safeYoutubeUrl = isAbsoluteUrl(youtubeChannelUrl)
    ? youtubeChannelUrl
    : OFFICIAL_YOUTUBE_CHANNEL_URL;
  const youtubeChannelLabel = toText(raw.youtubeChannelLabel, fallbackChannelLabel);

  return {
    values: {
      youtubeChannelUrl: safeYoutubeUrl,
      youtubeChannelLabel: youtubeChannelLabel || fallbackChannelLabel,
      showVideos: toBoolean(raw.showVideos, false),
    },
    raw,
  };
}

function readApiMessage(payload: unknown) {
  if (!isRecord(payload)) return null;
  const message = payload.message;
  if (typeof message === "string" && message.trim()) return message;
  const error = payload.error;
  if (typeof error === "string" && error.trim()) return error;
  return null;
}

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new Error(readApiMessage(payload) || `Falha na requisição (${response.status})`);
  }

  return (payload ?? {}) as T;
}

const configSchema = z.object({
  empresa: z
    .string()
    .trim()
    .min(2, "Informe o nome da empresa")
    .max(80, "Use no máximo 80 caracteres"),
  suporteEmail: z.string().trim().email("E-mail de suporte inválido"),
  dominioPrincipal: z
    .string()
    .trim()
    .regex(DOMAIN_REGEX, "Domínio inválido. Use apenas domínio, sem http:// ou https://"),
  logoUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || isAbsoluteUrl(value),
      "A logo deve ser uma URL completa (https://...)"
    ),
  webhookUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || isAbsoluteUrl(value),
      "Webhook inválido. Use URL completa (https://...)"
    ),
  apiKey: z
    .string()
    .trim()
    .refine((value) => !value || value.length >= 12, "A API Key deve ter pelo menos 12 caracteres"),
  alertas: z.object({
    financeiro: z.boolean(),
    usuarioNovo: z.boolean(),
    incidentes: z.boolean(),
  }),
  backupAtivo: z.boolean(),
  centralAjuda: z.object({
    youtubeChannelUrl: z
      .string()
      .trim()
      .refine(
        (value) => !value || isAbsoluteUrl(value),
        "URL do canal inválida. Use URL completa (https://...)"
      ),
    youtubeChannelLabel: z
      .string()
      .trim()
      .min(3, "Informe o rótulo do canal")
      .max(80, "Use no máximo 80 caracteres"),
    showVideos: z.boolean(),
  }),
});

function HealthRow({
  label,
  hasError,
  isLoading,
}: {
  label: string;
  hasError: boolean;
  isLoading: boolean;
}) {
  const statusLabel = hasError ? "Falha" : isLoading ? "Carregando" : "Operacional";
  const statusClass = hasError
    ? "bg-red-500/10 text-red-300 border-red-500/30"
    : isLoading
      ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-[#141824] px-4 py-3">
      <span className="text-sm text-gray-200">{label}</span>
      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClass}`}>
        {statusLabel}
      </span>
    </li>
  );
}

export default function ConfigPage() {
  const { nome: brandingName, logo: brandingLogo } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const fallbackLogo = brandingLogo || "/images/logos/logo_fut7pro.png";

  const {
    data: configData,
    error: configError,
    mutate: mutateConfig,
  } = useSWR<SuperAdminConfigResponse>("/api/superadmin/config", fetcher, {
    revalidateOnFocus: false,
  });
  const { data: dashboardData, error: dashboardError } = useSWR<DashboardData>(
    "/api/superadmin/dashboard",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: financeiroData, error: financeiroError } = useSWR<FinanceData>(
    "/api/superadmin/financeiro",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: systemStatsData, error: systemStatsError } = useSWR<SystemStats>(
    "/api/superadmin/system-stats",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: planosData, error: planosError } = useSWR<PlanCatalog>(
    "/api/superadmin/planos",
    fetcher,
    { revalidateOnFocus: false }
  );

  const [form, setForm] = useState<FormState>({
    ...DEFAULT_FORM,
    empresa: brand,
    centralAjuda: {
      ...DEFAULT_FORM.centralAjuda,
      youtubeChannelLabel: `Canal oficial ${brand}`,
    },
  });
  const [initialConfig, setInitialConfig] = useState<SuperAdminConfigResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!configData) return;

    const helpCenter = parseHelpCenterConfig(
      configData.centralAjudaConfig,
      `Canal oficial ${brand}`
    );
    const configLogo = toText(configData.logoUrl);

    setInitialConfig(configData);
    setForm({
      empresa: toText(configData.empresa, brand),
      suporteEmail: toText(configData.suporteEmail),
      dominioPrincipal: normalizeDomain(toText(configData.dominioPrincipal)),
      logoUrl: isAbsoluteUrl(configLogo) ? configLogo : "",
      webhookUrl: toText(configData.webhookUrl),
      apiKey: toText(configData.apiKey),
      alertas: {
        financeiro: Boolean(configData.alertaFinanceiro ?? true),
        usuarioNovo: Boolean(configData.alertaUsuarioNovo ?? true),
        incidentes: Boolean(configData.alertaIncidentes ?? true),
      },
      backupAtivo: Boolean(configData.backupAtivo ?? false),
      centralAjuda: helpCenter.values,
      centralAjudaRaw: helpCenter.raw,
    });
    setFieldErrors({});
  }, [brand, configData]);

  const isInitialLoading = !configData && !configError;
  const financeSummary = financeiroData?.resumo;

  const catalogSummary = useMemo(() => {
    const plans = planosData?.plans ?? [];
    const activePlans = plans.filter((plan) => plan.active !== false);

    return {
      total: activePlans.length,
      monthly: activePlans.filter((plan) => plan.interval === "month").length,
      yearly: activePlans.filter((plan) => plan.interval === "year").length,
      trialDaysDefault: planosData?.meta?.trialDaysDefault ?? 0,
    };
  }, [planosData]);

  const previewLogo = form.logoUrl || toText(configData?.logoUrl) || fallbackLogo;
  const currentPlanLabel = toText(configData?.planoAtual, "Não definido");
  const currentPlanExpiresAt = formatDateOnly(configData?.vencimento);

  function validateForm() {
    const parsed = configSchema.safeParse({
      empresa: form.empresa,
      suporteEmail: form.suporteEmail,
      dominioPrincipal: normalizeDomain(form.dominioPrincipal),
      logoUrl: form.logoUrl,
      webhookUrl: form.webhookUrl,
      apiKey: form.apiKey,
      alertas: form.alertas,
      backupAtivo: form.backupAtivo,
      centralAjuda: form.centralAjuda,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errors[issue.path.join(".")] = issue.message;
      }
      setFieldErrors(errors);
      return null;
    }

    setFieldErrors({});
    return parsed.data;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateForm();
    if (!validated) {
      toast.error("Corrija os campos destacados antes de salvar.");
      return;
    }

    const payload: Record<string, unknown> = {
      empresa: validated.empresa,
      suporteEmail: validated.suporteEmail,
      dominioPrincipal: validated.dominioPrincipal,
      webhookUrl: validated.webhookUrl || null,
      apiKey: validated.apiKey || null,
      alertaFinanceiro: validated.alertas.financeiro,
      alertaUsuarioNovo: validated.alertas.usuarioNovo,
      alertaIncidentes: validated.alertas.incidentes,
      backupAtivo: validated.backupAtivo,
      centralAjudaConfig: {
        ...form.centralAjudaRaw,
        youtubeChannelUrl: validated.centralAjuda.youtubeChannelUrl || OFFICIAL_YOUTUBE_CHANNEL_URL,
        youtubeChannelLabel: validated.centralAjuda.youtubeChannelLabel,
        showVideos: validated.centralAjuda.showVideos,
        updatedAt: new Date().toISOString(),
      },
    };

    const currentLogo = toText(initialConfig?.logoUrl);
    if (validated.logoUrl) {
      payload.logoUrl = validated.logoUrl;
    } else if (isAbsoluteUrl(currentLogo)) {
      payload.logoUrl = null;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/superadmin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(readApiMessage(body) || "Falha ao salvar configurações");
      }

      const updated = body as SuperAdminConfigResponse;
      await mutateConfig(updated, false);
      toast.success("Configurações globais atualizadas com sucesso.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao salvar.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  const endpointHealth = [
    {
      label: "Configuração global",
      hasError: Boolean(configError),
      isLoading: !configData && !configError,
    },
    {
      label: "Dashboard executivo",
      hasError: Boolean(dashboardError),
      isLoading: !dashboardData && !dashboardError,
    },
    {
      label: "Financeiro consolidado",
      hasError: Boolean(financeiroError),
      isLoading: !financeiroData && !financeiroError,
    },
    {
      label: "Catálogo de planos",
      hasError: Boolean(planosError),
      isLoading: !planosData && !planosError,
    },
    {
      label: "Saúde de infraestrutura",
      hasError: Boolean(systemStatsError),
      isLoading: !systemStatsData && !systemStatsError,
    },
  ];

  return (
    <>
      <Head>
        <title>{`Configurações SuperAdmin | ${brand}`}</title>
        <meta
          name="description"
          content={`Gerencie identidade, segurança, integrações e governança operacional da plataforma ${brand}.`}
        />
      </Head>
      <Toaster />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-20 md:px-8 md:pt-6">
        <section className="rounded-2xl border border-[#2a3042] bg-[#171b28] p-6 shadow-xl">
          <div className="flex flex-col gap-3">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-white md:text-3xl">
              <FaCogs className="text-yellow-400" />
              Configurações Operacionais do SuperAdmin
            </h1>
            <p className="max-w-4xl text-sm text-gray-300 md:text-base">
              Central de configuração global da operação SaaS. Esta tela controla identidade da
              plataforma, segurança, integrações e políticas de alerta com persistência no backend.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Link
              href="/superadmin/planos"
              className="rounded-xl border border-[#2f354a] bg-[#101421] px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-300"
            >
              <span className="flex items-center justify-between gap-3">
                Gerenciar catálogo de planos
                <FaArrowRight />
              </span>
            </Link>
            <Link
              href="/superadmin/financeiro"
              className="rounded-xl border border-[#2f354a] bg-[#101421] px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-300"
            >
              <span className="flex items-center justify-between gap-3">
                Acompanhar faturamento
                <FaArrowRight />
              </span>
            </Link>
            <Link
              href="/superadmin/dashboard"
              className="rounded-xl border border-[#2f354a] bg-[#101421] px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-300"
            >
              <span className="flex items-center justify-between gap-3">
                Ver visão executiva
                <FaArrowRight />
              </span>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <FaUsers className="text-yellow-400" /> Base operacional
            </h2>
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <p>Rachas ativos: {formatInteger(dashboardData?.tenantCount)}</p>
              <p>Admins aprovados: {formatInteger(dashboardData?.adminCount)}</p>
              <p>Usuários totais: {formatInteger(dashboardData?.userCount)}</p>
              <p>Partidas registradas: {formatInteger(dashboardData?.matchCount)}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <FaDatabase className="text-yellow-400" /> Receita consolidada
            </h2>
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <p>MRR: {formatCurrency(financeSummary?.mrr)}</p>
              <p>ARR: {formatCurrency(financeSummary?.arr)}</p>
              <p>Receita total: {formatCurrency(financeSummary?.receitaTotal)}</p>
              <p>Ticket médio: {formatCurrency(financeSummary?.ticketMedio)}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <FaInfoCircle className="text-yellow-400" /> Governança comercial
            </h2>
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <p>Planos ativos: {formatInteger(catalogSummary.total)}</p>
              <p>Mensais: {formatInteger(catalogSummary.monthly)}</p>
              <p>Anuais: {formatInteger(catalogSummary.yearly)}</p>
              <p>Trial padrão: {formatInteger(catalogSummary.trialDaysDefault)} dias</p>
            </div>
          </article>

          <article className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <FaServer className="text-yellow-400" /> Infraestrutura
            </h2>
            <div className="mt-3 space-y-1 text-sm text-gray-300">
              <p>Ambiente: {toText(systemStatsData?.environment, "N/D")}</p>
              <p>Versão API: {toText(systemStatsData?.apiVersion, "N/D")}</p>
              <p>Uptime: {formatUptime(systemStatsData?.uptime)}</p>
              <p>Memória heap: {formatBytes(systemStatsData?.memoryUsage?.heapUsed)}</p>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
            <FaCheckCircle />
            Saúde das integrações e módulos críticos
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {endpointHealth.map((item) => (
              <HealthRow
                key={item.label}
                label={item.label}
                hasError={item.hasError}
                isLoading={item.isLoading}
              />
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-400">
            Última atualização do dashboard: {formatDateTime(dashboardData?.lastUpdated)}
          </p>
        </section>

        {configError && (
          <section className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            Erro ao carregar a configuração global. Revise a autenticação SuperAdmin e a
            disponibilidade da API.
          </section>
        )}

        {isInitialLoading && (
          <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] px-4 py-5 text-sm text-gray-200">
            <span className="inline-flex items-center gap-2">
              <FaSpinner className="animate-spin text-yellow-400" />
              Carregando configuração global...
            </span>
          </section>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-6 shadow-xl">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaInfoCircle />
              Identidade e suporte institucional
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Nome da empresa</span>
                <input
                  className={`input-superadmin ${fieldErrors.empresa ? "border-red-500" : ""}`}
                  value={form.empresa}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      empresa: event.target.value,
                    }))
                  }
                  autoComplete="off"
                />
                {fieldErrors.empresa && (
                  <span className="text-xs text-red-400">{fieldErrors.empresa}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">E-mail de suporte</span>
                <input
                  type="email"
                  className={`input-superadmin ${fieldErrors.suporteEmail ? "border-red-500" : ""}`}
                  value={form.suporteEmail}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      suporteEmail: event.target.value,
                    }))
                  }
                  autoComplete="off"
                />
                {fieldErrors.suporteEmail && (
                  <span className="text-xs text-red-400">{fieldErrors.suporteEmail}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Domínio principal da plataforma</span>
                <input
                  className={`input-superadmin ${fieldErrors.dominioPrincipal ? "border-red-500" : ""}`}
                  value={form.dominioPrincipal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      dominioPrincipal: event.target.value,
                    }))
                  }
                  autoComplete="off"
                  placeholder="app.fut7pro.com.br"
                />
                {fieldErrors.dominioPrincipal && (
                  <span className="text-xs text-red-400">{fieldErrors.dominioPrincipal}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Logo institucional (URL pública)</span>
                <input
                  className={`input-superadmin ${fieldErrors.logoUrl ? "border-red-500" : ""}`}
                  value={form.logoUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      logoUrl: event.target.value,
                    }))
                  }
                  autoComplete="off"
                  placeholder="https://cdn.seudominio.com/logo.png"
                />
                {fieldErrors.logoUrl && (
                  <span className="text-xs text-red-400">{fieldErrors.logoUrl}</span>
                )}
                {!form.logoUrl && toText(configData?.logoUrl).startsWith("/") && (
                  <span className="text-xs text-yellow-300">
                    Logo atual usando caminho legado interno. Defina uma URL https para padronizar.
                  </span>
                )}
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-[#2d3449] bg-[#101421] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Pré-visualização da marca
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={previewLogo}
                  alt={`Logo ${brand}`}
                  className="h-14 w-14 rounded-lg border border-[#353d54] bg-[#0b0f19] object-cover"
                />
                <div className="text-sm text-gray-200">
                  <p className="font-semibold">{form.empresa || brand}</p>
                  <p className="text-xs text-gray-400">
                    {form.suporteEmail || "Sem e-mail definido"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-6 shadow-xl">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaLink />
              Segurança e integrações globais
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Webhook principal</span>
                <input
                  className={`input-superadmin ${fieldErrors.webhookUrl ? "border-red-500" : ""}`}
                  value={form.webhookUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      webhookUrl: event.target.value,
                    }))
                  }
                  autoComplete="off"
                  placeholder="https://api.seudominio.com/webhooks/fut7pro"
                />
                {fieldErrors.webhookUrl && (
                  <span className="text-xs text-red-400">{fieldErrors.webhookUrl}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">API Key global</span>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    className={`input-superadmin pr-12 ${fieldErrors.apiKey ? "border-red-500" : ""}`}
                    value={form.apiKey}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        apiKey: event.target.value,
                      }))
                    }
                    autoComplete="off"
                    placeholder="sk_live_..."
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-yellow-300"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    aria-label={showApiKey ? "Ocultar API Key" : "Mostrar API Key"}
                  >
                    {showApiKey ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {fieldErrors.apiKey && (
                  <span className="text-xs text-red-400">{fieldErrors.apiKey}</span>
                )}
                <span className="text-xs text-gray-400">
                  Estado atual: {maskApiKey(form.apiKey)}
                </span>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded-lg border border-[#2d3449] bg-[#101421] px-3 py-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-500"
                  checked={form.alertas.financeiro}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      alertas: { ...prev.alertas, financeiro: event.target.checked },
                    }))
                  }
                />
                Alertas financeiros
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-[#2d3449] bg-[#101421] px-3 py-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-500"
                  checked={form.alertas.usuarioNovo}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      alertas: { ...prev.alertas, usuarioNovo: event.target.checked },
                    }))
                  }
                />
                Alerta de novo usuário
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-[#2d3449] bg-[#101421] px-3 py-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-500"
                  checked={form.alertas.incidentes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      alertas: { ...prev.alertas, incidentes: event.target.checked },
                    }))
                  }
                />
                Alertas de incidentes
              </label>
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2 rounded-lg border border-[#2d3449] bg-[#101421] px-3 py-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-500"
                  checked={form.backupAtivo}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      backupAtivo: event.target.checked,
                    }))
                  }
                />
                Backup automático habilitado
              </label>
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
              <FaExclamationTriangle className="mt-0.5 shrink-0" />A rotação de chaves e políticas
              avançadas deve ser feita com processo de change management e registro em trilha de
              auditoria.
            </p>
          </section>

          <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-6 shadow-xl">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaShieldAlt />
              Central de ajuda (configuração global)
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">URL do canal oficial</span>
                <input
                  className={`input-superadmin ${fieldErrors["centralAjuda.youtubeChannelUrl"] ? "border-red-500" : ""}`}
                  value={form.centralAjuda.youtubeChannelUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      centralAjuda: {
                        ...prev.centralAjuda,
                        youtubeChannelUrl: event.target.value,
                      },
                    }))
                  }
                  autoComplete="off"
                  placeholder={OFFICIAL_YOUTUBE_CHANNEL_URL}
                />
                {fieldErrors["centralAjuda.youtubeChannelUrl"] && (
                  <span className="text-xs text-red-400">
                    {fieldErrors["centralAjuda.youtubeChannelUrl"]}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Rótulo do canal</span>
                <input
                  className={`input-superadmin ${fieldErrors["centralAjuda.youtubeChannelLabel"] ? "border-red-500" : ""}`}
                  value={form.centralAjuda.youtubeChannelLabel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      centralAjuda: {
                        ...prev.centralAjuda,
                        youtubeChannelLabel: event.target.value,
                      },
                    }))
                  }
                  autoComplete="off"
                />
                {fieldErrors["centralAjuda.youtubeChannelLabel"] && (
                  <span className="text-xs text-red-400">
                    {fieldErrors["centralAjuda.youtubeChannelLabel"]}
                  </span>
                )}
              </label>
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2 rounded-lg border border-[#2d3449] bg-[#101421] px-3 py-2 text-sm text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-500"
                  checked={form.centralAjuda.showVideos}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      centralAjuda: {
                        ...prev.centralAjuda,
                        showVideos: event.target.checked,
                      },
                    }))
                  }
                />
                Exibir vídeos na central de ajuda dos admins
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-6 shadow-xl">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
              <FaKey />
              Governança de planos e cobrança
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#2d3449] bg-[#101421] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Plano atual (histórico)
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{currentPlanLabel}</p>
                <p className="mt-1 text-xs text-gray-400">Vencimento: {currentPlanExpiresAt}</p>
              </div>
              <div className="rounded-lg border border-[#2d3449] bg-[#101421] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Risco de churn</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatPercent(financeSummary?.churn)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Inadimplentes: {formatInteger(financeSummary?.inadimplentes)} | Ativos:{" "}
                  {formatInteger(financeSummary?.ativos)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Alteração de catálogo e preços deve ser feita na área{" "}
              <Link href="/superadmin/planos" className="text-yellow-300 hover:underline">
                Planos
              </Link>
              . A cobrança por tenant é acompanhada em{" "}
              <Link href="/superadmin/financeiro" className="text-yellow-300 hover:underline">
                Financeiro
              </Link>
              .
            </p>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {isSaving ? "Salvando..." : "Salvar configurações globais"}
            </button>
          </div>
        </form>

        <section className="rounded-2xl border border-[#2a3042] bg-[#151a27] p-6 shadow-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-400">
            <FaHistory />
            Histórico de alterações
          </h2>
          <ul className="space-y-2 text-sm text-gray-200">
            {(configData?.logs ?? []).map((log, index) => (
              <li
                key={`${log.createdAt ?? "log"}-${index}`}
                className="rounded-lg border border-[#2d3449] bg-[#101421] px-4 py-3"
              >
                <p className="font-semibold text-white">
                  {toText(log.message, "Configuração atualizada")}
                </p>
                <p className="mt-1 text-xs text-gray-400">{formatDateTime(log.createdAt)}</p>
              </li>
            ))}
            {(configData?.logs ?? []).length === 0 && (
              <li className="rounded-lg border border-[#2d3449] bg-[#101421] px-4 py-3 text-gray-400">
                Nenhum log recente encontrado.
              </li>
            )}
          </ul>
        </section>
      </main>

      <style jsx>{`
        .input-superadmin {
          width: 100%;
          border-radius: 10px;
          border: 1.5px solid #2d3449;
          background: #101421;
          color: #fff;
          font-size: 0.95rem;
          padding: 10px 12px;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-superadmin:focus {
          border-color: #facc15;
        }

        .border-red-500 {
          border-color: #ef4444 !important;
        }
      `}</style>
    </>
  );
}
