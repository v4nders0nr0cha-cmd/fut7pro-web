"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { FaDownload, FaHistory, FaPlayCircle, FaRedoAlt, FaShieldAlt } from "react-icons/fa";
import { useSuperAdminAccessCompensations } from "@/hooks/useSuperAdminAccessCompensations";
import type {
  AccessCompensationApplyResponse,
  AccessCompensationFilters,
  AccessCompensationHistoryItem,
  AccessCompensationPreviewResponse,
  AccessCompensationReasonCategory,
  AccessCompensationScopeType,
  AccessCompensationType,
  ApplyAccessCompensationPayload,
  PreviewAccessCompensationPayload,
  SubscriptionStatus,
} from "@/types/access-compensation";

type TenantListItem = {
  id: string;
  name?: string;
  slug?: string;
  isVitrine?: boolean;
  subscription?: {
    planKey?: string;
    status?: SubscriptionStatus;
  } | null;
};

type TenantListResponse = {
  results?: TenantListItem[];
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Falha ao carregar dados");
  }
  return response.json();
};

const SCOPE_OPTIONS: Array<{ value: AccessCompensationScopeType; label: string }> = [
  { value: "SINGLE", label: "Racha específico" },
  { value: "MULTIPLE", label: "Vários rachas" },
  { value: "GLOBAL", label: "Todos os rachas elegíveis" },
];

const STATUS_OPTIONS: Array<{ value: SubscriptionStatus; label: string }> = [
  { value: "active", label: "Ativo" },
  { value: "trialing", label: "Trial" },
  { value: "past_due", label: "Inadimplente" },
  { value: "paused", label: "Pausado" },
  { value: "expired", label: "Expirado" },
  { value: "canceled", label: "Cancelado" },
];

const TYPE_OPTIONS: Array<{ value: AccessCompensationType; label: string }> = [
  { value: "INCIDENT", label: "Incidente operacional" },
  { value: "COURTESY", label: "Cortesia" },
  { value: "BILLING_FIX", label: "Ajuste de cobrança" },
  { value: "MANUAL_ADJUSTMENT", label: "Ajuste manual" },
];

const REASON_OPTIONS: Array<{ value: AccessCompensationReasonCategory; label: string }> = [
  { value: "SYSTEM_UNAVAILABILITY", label: "Indisponibilidade do sistema" },
  { value: "LOGIN_FAILURE", label: "Falha de login" },
  { value: "BILLING_ERROR", label: "Erro de cobrança" },
  { value: "CRITICAL_BUG", label: "Bug crítico" },
  { value: "EXTRAORDINARY_MAINTENANCE", label: "Manutenção extraordinária" },
  { value: "COMMERCIAL_COURTESY", label: "Cortesia comercial" },
  { value: "OTHER", label: "Outro" },
];

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function formatDay(value: number) {
  return `${value} dia${value === 1 ? "" : "s"}`;
}

function clean(value?: string) {
  const next = String(value || "").trim();
  return next || undefined;
}

function generateClientRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `comp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeCsvCell(value: unknown) {
  const raw = String(value ?? "");
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const trimmed = normalized.trimStart();
  const startsWithFormula =
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@");
  return startsWithFormula ? `'${normalized}` : normalized;
}

function statusLabel(value?: string) {
  const map: Record<string, string> = {
    active: "Ativo",
    trialing: "Trial",
    past_due: "Inadimplente",
    paused: "Pausado",
    expired: "Expirado",
    canceled: "Cancelado",
    APPLIED: "Aplicada",
    REVERTED: "Revertida",
  };
  return map[value || ""] || value || "-";
}

function reasonLabel(value?: string) {
  return REASON_OPTIONS.find((item) => item.value === value)?.label || value || "-";
}

export default function SuperAdminAccessCompensationsPage() {
  const [scopeType, setScopeType] = useState<AccessCompensationScopeType>("SINGLE");
  const [singleTenantId, setSingleTenantId] = useState("");
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [tenantSearch, setTenantSearch] = useState("");
  const [eligibilitySearch, setEligibilitySearch] = useState("");
  const [days, setDays] = useState<number>(3);
  const [compType, setCompType] = useState<AccessCompensationType>("INCIDENT");
  const [reasonCategory, setReasonCategory] =
    useState<AccessCompensationReasonCategory>("SYSTEM_UNAVAILABILITY");
  const [reasonDescription, setReasonDescription] = useState("");
  const [incidentCode, setIncidentCode] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [confirmationText, setConfirmationText] = useState("");
  const [preview, setPreview] = useState<AccessCompensationPreviewResponse | null>(null);
  const [previewSignature, setPreviewSignature] = useState<string>("");
  const [applyRequestId, setApplyRequestId] = useState<string>("");
  const [lastApplyResult, setLastApplyResult] = useState<AccessCompensationApplyResponse | null>(
    null
  );
  const [statusFilters, setStatusFilters] = useState<SubscriptionStatus[]>([]);
  const [planFilters, setPlanFilters] = useState<string[]>([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyPaid, setOnlyPaid] = useState(false);
  const [onlyTrial, setOnlyTrial] = useState(false);
  const [onlyExpiredRecently, setOnlyExpiredRecently] = useState(false);
  const [expiredRecentlyDays, setExpiredRecentlyDays] = useState(15);
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [affectedIncidentCode, setAffectedIncidentCode] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  const [historyReasonCategory, setHistoryReasonCategory] = useState("");
  const [historyPage, setHistoryPage] = useState(1);

  const { data: tenantsData, isLoading: loadingTenants } = useSWR<
    TenantListResponse | TenantListItem[]
  >("/api/superadmin/tenants", fetcher, { revalidateOnFocus: false });

  const tenants = useMemo(() => {
    const source = Array.isArray(tenantsData)
      ? tenantsData
      : Array.isArray((tenantsData as TenantListResponse | undefined)?.results)
        ? (tenantsData as TenantListResponse).results || []
        : [];
    return source.filter(
      (tenant) => !tenant.isVitrine && (tenant.slug || "").toLowerCase() !== "vitrine"
    );
  }, [tenantsData]);

  const filteredTenants = useMemo(() => {
    const search = tenantSearch.trim().toLowerCase();
    if (!search) return tenants;
    return tenants.filter((tenant) => {
      const name = String(tenant.name || "").toLowerCase();
      const slug = String(tenant.slug || "").toLowerCase();
      return name.includes(search) || slug.includes(search);
    });
  }, [tenantSearch, tenants]);

  const availablePlanKeys = useMemo(() => {
    const keys = new Set<string>();
    tenants.forEach((tenant) => {
      const key = clean(tenant.subscription?.planKey);
      if (key) keys.add(key);
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [tenants]);

  const historyFilters = useMemo(
    () => ({
      page: historyPage,
      pageSize: 20,
      search: clean(historySearch),
      status: clean(historyStatus),
      reasonCategory: clean(historyReasonCategory),
    }),
    [historyPage, historyReasonCategory, historySearch, historyStatus]
  );

  const {
    summary,
    history,
    isLoading: loadingCompensations,
    error,
    previewCompensation,
    applyCompensation,
    revertCompensation,
  } = useSuperAdminAccessCompensations(historyFilters);

  const filtersPayload = useMemo<AccessCompensationFilters>(() => {
    const payload: AccessCompensationFilters = {};
    if (statusFilters.length) payload.statuses = [...statusFilters].sort();
    if (planFilters.length) payload.planKeys = [...planFilters].sort();
    if (onlyActive) payload.onlyActive = true;
    if (onlyPaid) payload.onlyPaid = true;
    if (onlyTrial) payload.onlyTrial = true;
    if (onlyExpiredRecently) {
      payload.onlyExpiredRecently = true;
      payload.expiredRecentlyDays = expiredRecentlyDays;
    }
    if (clean(dueDateFrom)) payload.dueDateFrom = clean(dueDateFrom);
    if (clean(dueDateTo)) payload.dueDateTo = clean(dueDateTo);
    if (clean(createdFrom)) payload.createdFrom = clean(createdFrom);
    if (clean(createdTo)) payload.createdTo = clean(createdTo);
    if (clean(affectedIncidentCode)) payload.incidentCode = clean(affectedIncidentCode);
    if (clean(eligibilitySearch)) payload.search = clean(eligibilitySearch);
    return payload;
  }, [
    affectedIncidentCode,
    createdFrom,
    createdTo,
    dueDateFrom,
    dueDateTo,
    expiredRecentlyDays,
    onlyActive,
    onlyExpiredRecently,
    onlyPaid,
    onlyTrial,
    planFilters,
    statusFilters,
    eligibilitySearch,
  ]);

  const previewPayload = useMemo<PreviewAccessCompensationPayload>(() => {
    const payload: PreviewAccessCompensationPayload = {
      scopeType,
      days,
      filters: filtersPayload,
    };
    if (scopeType === "SINGLE" && clean(singleTenantId)) {
      payload.tenantId = clean(singleTenantId);
    }
    if (scopeType === "MULTIPLE" && selectedTenantIds.length) {
      payload.tenantIds = [...selectedTenantIds].sort();
    }
    return payload;
  }, [days, filtersPayload, scopeType, selectedTenantIds, singleTenantId]);

  const currentSignature = useMemo(() => JSON.stringify(previewPayload), [previewPayload]);
  const requiresTypedConfirmation = preview?.safety?.requiresTypedConfirmation === true;
  const requiredConfirmationKeyword = preview?.safety?.massConfirmationKeyword || "";
  const hasValidTypedConfirmation =
    !requiresTypedConfirmation ||
    confirmationText.trim().toUpperCase() === requiredConfirmationKeyword.toUpperCase();
  const applyDisabled =
    !preview ||
    preview?.totals?.tenants < 1 ||
    previewSignature !== currentSignature ||
    !applyRequestId ||
    !clean(reasonDescription) ||
    !hasValidTypedConfirmation;

  const toggleStatusFilter = (status: SubscriptionStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
    );
  };

  const togglePlanFilter = (planKey: string) => {
    setPlanFilters((prev) =>
      prev.includes(planKey) ? prev.filter((item) => item !== planKey) : [...prev, planKey]
    );
  };

  const toggleTenant = (tenantId: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(tenantId) ? prev.filter((item) => item !== tenantId) : [...prev, tenantId]
    );
  };

  const handleSimulate = async () => {
    const result = await previewCompensation(previewPayload);
    if (!result) return;
    setPreview(result);
    setPreviewSignature(currentSignature);
    setApplyRequestId(generateClientRequestId());
    setLastApplyResult(null);
    if (historyPage !== 1) setHistoryPage(1);
  };

  const handleApply = async () => {
    const payload: ApplyAccessCompensationPayload = {
      ...previewPayload,
      clientRequestId: applyRequestId,
      type: compType,
      reasonCategory,
      reasonDescription: reasonDescription.trim(),
      incidentCode: clean(incidentCode),
      notifyCustomer,
      confirmationText: clean(confirmationText),
    };
    const result = await applyCompensation(payload);
    if (!result) return;
    setLastApplyResult(result);
    setConfirmationText("");
    setApplyRequestId("");
    setPreview(null);
    setPreviewSignature("");
  };

  const handleRevert = async (item: AccessCompensationHistoryItem) => {
    const reason = window.prompt("Motivo da reversão:");
    if (!reason || !reason.trim()) return;
    const notify = window.confirm("Notificar o cliente sobre a reversão?");
    await revertCompensation(item.id, {
      reasonDescription: reason.trim(),
      notifyCustomer: notify,
    });
  };

  const exportHistoryCsv = () => {
    const rows = [
      [
        "Data",
        "Racha",
        "Slug",
        "Dias",
        "Tipo",
        "Motivo",
        "Incidente",
        "Status",
        "Acesso Antes",
        "Acesso Depois",
      ],
      ...(history?.items || []).map((item) => [
        formatDate(item.appliedAt),
        item.tenantName,
        item.tenantSlug,
        String(item.days),
        item.type,
        item.reasonCategory,
        item.incidentCode || "",
        item.status,
        formatDate(item.previousAccessUntil),
        formatDate(item.newAccessUntil),
      ]),
    ];
    const csv = rows
      .map((line) => line.map((cell) => `"${sanitizeCsvCell(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "compensacoes-acesso-historico.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>Compensações de Acesso | SuperAdmin Fut7Pro</title>
      </Head>

      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4">
          <h1 className="text-2xl font-bold text-yellow-300">Compensações de Acesso</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Módulo oficial para compensação de assinatura por tenant, com simulação, aplicação
            auditável e reversão.
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
            <ResumoCard title="Rachas ativos" value={summary?.overview.activeTenants ?? 0} />
            <ResumoCard title="Rachas trial" value={summary?.overview.trialTenants ?? 0} />
            <ResumoCard title="Rachas vencidos" value={summary?.overview.expiredTenants ?? 0} />
            <ResumoCard title="Rachas pagantes" value={summary?.overview.paidTenants ?? 0} />
            <ResumoCard
              title="Compensações 30d"
              value={summary?.overview.adjustmentsLast30Days ?? 0}
            />
            <ResumoCard
              title="Dias distribuídos 30d"
              value={summary?.overview.daysGrantedLast30Days ?? 0}
            />
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Nova compensação</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase text-zinc-400">Escopo</span>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={scopeType}
                onChange={(event) =>
                  setScopeType(event.target.value as AccessCompensationScopeType)
                }
              >
                {SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase text-zinc-400">Dias a conceder</span>
              <input
                type="number"
                min={1}
                max={90}
                value={days}
                onChange={(event) =>
                  setDays(Math.max(1, Math.min(90, Number(event.target.value || 1))))
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            {scopeType === "SINGLE" && (
              <label className="space-y-1">
                <span className="text-xs uppercase text-zinc-400">Racha alvo</span>
                <select
                  value={singleTenantId}
                  onChange={(event) => setSingleTenantId(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="">Selecione um racha</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name || tenant.slug} ({tenant.slug})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {scopeType === "MULTIPLE" && (
              <div className="space-y-3">
                <input
                  value={tenantSearch}
                  onChange={(event) => setTenantSearch(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  placeholder="Buscar racha por nome ou slug"
                />
                <div className="max-h-44 overflow-auto rounded-lg border border-zinc-800">
                  {filteredTenants.map((tenant) => (
                    <label
                      key={tenant.id}
                      className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2 text-sm last:border-b-0"
                    >
                      <span>
                        {tenant.name || tenant.slug}{" "}
                        <span className="text-xs text-zinc-500">({tenant.slug})</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedTenantIds.includes(tenant.id)}
                        onChange={() => toggleTenant(tenant.id)}
                      />
                    </label>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  Selecionados: {selectedTenantIds.length} racha(s)
                </p>
              </div>
            )}

            {scopeType === "GLOBAL" && (
              <p className="text-sm text-zinc-400">
                A compensação será aplicada para todos os rachas elegíveis pelos filtros abaixo.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <p className="text-xs uppercase text-zinc-400">Filtros de elegibilidade</p>
            <input
              value={eligibilitySearch}
              onChange={(event) => setEligibilitySearch(event.target.value)}
              className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Buscar por nome ou slug (filtro de elegibilidade)"
            />

            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {STATUS_OPTIONS.map((statusOption) => (
                <label key={statusOption.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={statusFilters.includes(statusOption.value)}
                    onChange={() => toggleStatusFilter(statusOption.value)}
                  />
                  <span>{statusOption.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(event) => setOnlyActive(event.target.checked)}
                />
                Apenas ativos
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyPaid}
                  onChange={(event) => setOnlyPaid(event.target.checked)}
                />
                Apenas pagantes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyTrial}
                  onChange={(event) => setOnlyTrial(event.target.checked)}
                />
                Apenas trial
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyExpiredRecently}
                  onChange={(event) => setOnlyExpiredRecently(event.target.checked)}
                />
                Vencidos recentemente
              </label>
              <label className="space-y-1">
                <span className="text-xs text-zinc-500">Dias de janela</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={expiredRecentlyDays}
                  onChange={(event) =>
                    setExpiredRecentlyDays(
                      Math.max(1, Math.min(90, Number(event.target.value || 1)))
                    )
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  disabled={!onlyExpiredRecently}
                />
              </label>
            </div>

            <div className="mt-3">
              <p className="text-xs text-zinc-500">Filtrar por plano</p>
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {availablePlanKeys.map((planKey) => (
                  <label key={planKey} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={planFilters.includes(planKey)}
                      onChange={() => togglePlanFilter(planKey)}
                    />
                    <span>{planKey}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="date"
                value={dueDateFrom}
                onChange={(event) => setDueDateFrom(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Vencimento de"
              />
              <input
                type="date"
                value={dueDateTo}
                onChange={(event) => setDueDateTo(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Vencimento até"
              />
              <input
                type="date"
                value={createdFrom}
                onChange={(event) => setCreatedFrom(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Criação de"
              />
              <input
                type="date"
                value={createdTo}
                onChange={(event) => setCreatedTo(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder="Criação até"
              />
              <input
                value={affectedIncidentCode}
                onChange={(event) => setAffectedIncidentCode(event.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 md:col-span-2"
                placeholder="Incidente afetado (filtro), ex: INC-2026-004"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase text-zinc-400">Tipo da compensação</span>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={compType}
                onChange={(event) => setCompType(event.target.value as AccessCompensationType)}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase text-zinc-400">Categoria do motivo</span>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={reasonCategory}
                onChange={(event) =>
                  setReasonCategory(event.target.value as AccessCompensationReasonCategory)
                }
              >
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-1">
            <span className="text-xs uppercase text-zinc-400">Descrição obrigatória</span>
            <textarea
              value={reasonDescription}
              onChange={(event) => setReasonDescription(event.target.value)}
              className="h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Explique claramente o motivo da compensação..."
            />
          </label>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <input
              value={incidentCode}
              onChange={(event) => setIncidentCode(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Incidente vinculado (opcional), ex: INC-2026-004"
            />
            <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(event) => setNotifyCustomer(event.target.checked)}
              />
              <span>Notificar cliente</span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={loadingCompensations}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              <FaPlayCircle /> Simular compensação
            </button>
            <button
              onClick={handleApply}
              disabled={applyDisabled || loadingCompensations}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaShieldAlt /> Aplicar compensação
            </button>
          </div>

          {requiresTypedConfirmation && (
            <label className="mt-3 block space-y-1">
              <span className="text-xs uppercase text-zinc-400">
                Confirmação obrigatória ({requiredConfirmationKeyword})
              </span>
              <input
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                placeholder={`Digite ${requiredConfirmationKeyword}`}
              />
            </label>
          )}

          {preview && previewSignature !== currentSignature && (
            <p className="mt-3 text-sm text-amber-300">
              O formulário foi alterado após a simulação. Execute nova simulação antes de aplicar.
            </p>
          )}

          {lastApplyResult && (
            <div className="mt-4 rounded-lg border border-emerald-600/40 bg-emerald-900/20 p-3 text-sm text-emerald-200">
              {lastApplyResult.idempotentReplay
                ? "Operação reaproveitada (idempotência)."
                : "Compensação aplicada com sucesso:"}{" "}
              {lastApplyResult.totalTenantsAffected} racha(s),{" "}
              {lastApplyResult.totalDaysDistributed} dia(s) distribuídos.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Preview de impacto</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Revise antes de aplicar. Se editar qualquer campo do formulário, simule novamente.
          </p>
          <div className="mt-3 text-sm text-zinc-300">
            {preview ? (
              <>
                <p>Rachas afetados: {preview.totals.tenants}</p>
                <p>Total de dias distribuídos: {preview.totals.totalDaysDistributed}</p>
              </>
            ) : (
              <p>Nenhuma simulação executada.</p>
            )}
          </div>
          {preview?.rows?.length > 0 && (
            <div className="mt-3 max-h-[360px] overflow-auto rounded-lg border border-zinc-800">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-zinc-950">
                  <tr>
                    <th className="px-3 py-2 text-left">Racha</th>
                    <th className="px-3 py-2 text-left">Plano</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Acesso atual até</th>
                    <th className="px-3 py-2 text-left">Novo acesso até</th>
                    <th className="px-3 py-2 text-left">Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.tenantId} className="border-t border-zinc-800">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{row.tenantName}</div>
                        <div className="text-xs text-zinc-400">{row.tenantSlug}</div>
                      </td>
                      <td className="px-3 py-2">{row.planKey}</td>
                      <td className="px-3 py-2">{statusLabel(row.subscriptionStatus)}</td>
                      <td className="px-3 py-2">{formatDate(row.currentAccessUntil)}</td>
                      <td className="px-3 py-2">{formatDate(row.newAccessUntil)}</td>
                      <td className="px-3 py-2">{formatDay(row.daysGranted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-zinc-100">
              <FaHistory /> Histórico de compensações
            </h2>
            <button
              onClick={exportHistoryCsv}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2 text-sm font-semibold hover:bg-zinc-600"
            >
              <FaDownload /> Exportar CSV
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={historySearch}
              onChange={(event) => {
                setHistorySearch(event.target.value);
                setHistoryPage(1);
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Buscar por racha, incidente ou motivo"
            />
            <select
              value={historyStatus}
              onChange={(event) => {
                setHistoryStatus(event.target.value);
                setHistoryPage(1);
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            >
              <option value="">Status: todos</option>
              <option value="APPLIED">Aplicada</option>
              <option value="REVERTED">Revertida</option>
            </select>
            <select
              value={historyReasonCategory}
              onChange={(event) => {
                setHistoryReasonCategory(event.target.value);
                setHistoryPage(1);
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            >
              <option value="">Motivo: todos</option>
              {REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 overflow-auto rounded-lg border border-zinc-800">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-950">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Racha</th>
                  <th className="px-3 py-2 text-left">Dias</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Incidente</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Ação</th>
                </tr>
              </thead>
              <tbody>
                {(history?.items || []).map((item) => (
                  <tr key={item.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2">{formatDate(item.appliedAt)}</td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">{item.tenantName}</div>
                      <div className="text-xs text-zinc-400">{item.tenantSlug}</div>
                    </td>
                    <td className="px-3 py-2">{formatDay(item.days)}</td>
                    <td className="px-3 py-2">{reasonLabel(item.reasonCategory)}</td>
                    <td className="px-3 py-2">{item.incidentCode || "-"}</td>
                    <td className="px-3 py-2">{statusLabel(item.status)}</td>
                    <td className="px-3 py-2">
                      {item.status === "APPLIED" ? (
                        <button
                          onClick={() => handleRevert(item)}
                          className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-1 text-xs font-semibold hover:bg-rose-600"
                        >
                          <FaRedoAlt /> Reverter
                        </button>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!history?.items?.length && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-zinc-500">
                      {loadingCompensations || loadingTenants ? "Carregando..." : "Sem registros."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-zinc-400">
            <span>
              Página {history?.page || 1} de {history?.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryPage((prev) => Math.max(prev - 1, 1))}
                disabled={(history?.page || 1) <= 1}
                className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setHistoryPage((prev) => Math.min(prev + 1, history?.totalPages || prev + 1))
                }
                disabled={(history?.page || 1) >= (history?.totalPages || 1)}
                className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function ResumoCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-center">
      <div className="text-xs uppercase text-zinc-500">{title}</div>
      <div className="mt-1 text-xl font-bold text-zinc-100">{value}</div>
    </div>
  );
}
