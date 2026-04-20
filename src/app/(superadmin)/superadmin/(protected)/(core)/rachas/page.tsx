"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  FaSearch,
  FaDownload,
  FaLock,
  FaUnlock,
  FaInfoCircle,
  FaUserShield,
  FaTrash,
} from "react-icons/fa";
import { format } from "date-fns";
import ModalDetalhesRacha from "@/components/superadmin/ModalDetalhesRacha";
import { useBranding } from "@/hooks/useBranding";
import { Fut7ConfirmDialog, Fut7DestructiveDialog, showFut7Toast } from "@/components/ui/feedback";
type TenantMembership = {
  status?: string | null;
  role?: string | null;
  createdAt?: string | null;
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    lastLoginAt?: string | null;
  } | null;
};

type TenantAdmin = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
  userId?: string | null;
  nome?: string | null;
};

type TenantCounts = {
  users?: number | null;
  athletes?: number | null;
  players?: number | null;
  matches?: number | null;
};

type TenantAboutPage = {
  data?: unknown;
} | null;

type TenantAccess = {
  status?: string | null;
  blocked?: boolean | null;
  reason?: string | null;
  statusRaw?: string | null;
  source?: string | null;
  daysRemaining?: number | null;
  effectiveAccessUntil?: string | null;
  canAccess?: boolean | null;
  compensationActive?: boolean | null;
};

type Tenant = {
  id: string;
  name?: string;
  slug?: string;
  isVitrine?: boolean | null;
  status?: string | null;
  planKey?: string | null;
  plan?: string | null;
  playersCount?: number | null;
  athletes?: number | null;
  adminsCount?: number | null;
  admins?: TenantAdmin[];
  memberships?: TenantMembership[] | null;
  aboutPage?: TenantAboutPage;
  _count?: TenantCounts | null;
  subscription?: {
    status?: string | null;
    planKey?: string | null;
    plan?: string | null;
    amount?: number | null;
    interval?: string | null;
    trialStart?: string | null;
    trialEnd?: string | null;
    firstPaymentAt?: string | null;
    currentPeriodEnd?: string | null;
  } | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  createdAt?: string | null;
  blocked?: boolean | null;
  access?: TenantAccess | null;
  accessStatus?: string | null;
  accessReason?: string | null;
  trialEndsAt?: string | null;
  lastActivityAt?: string | null;
  updatedAt?: string | null;
};

type TenantsResponse = { results?: Tenant[] };
type AccessAction = "block" | "unblock";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 401 || res.status === 403) {
    const authError = new Error("Sessao expirada") as Error & { status?: number };
    authError.status = res.status;
    throw authError;
  }
  const text = await res.text();
  if (!res.ok) {
    const error = new Error(text || `Request failed ${res.status}`) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
};

const STATUS_BADGES = {
  ATIVO: "bg-green-700 text-green-200",
  ALERTA: "bg-yellow-700 text-yellow-200",
  TRIAL: "bg-yellow-700 text-yellow-200",
  TRIAL_EXPIRADO: "bg-amber-800 text-amber-100",
  SEM_CONVERSAO: "bg-orange-800 text-orange-100",
  INADIMPLENTE_COM_HISTORICO: "bg-red-700 text-red-200",
  INADIMPLENTE: "bg-red-700 text-red-200",
  BLOQUEADO: "bg-gray-600 text-gray-200",
};

const STATUS_LABELS = {
  ATIVO: "Racha ativo e operando normalmente.",
  ALERTA: "Racha ativo com alerta de ciclo/período próximo do vencimento.",
  TRIAL: "Período de teste, com limitação de recursos.",
  TRIAL_EXPIRADO: "Trial encerrado sem conversão para pagamento.",
  SEM_CONVERSAO: "Nunca pagou e está fora do período de trial.",
  INADIMPLENTE_COM_HISTORICO: "Já pagou e está com cobrança em atraso.",
  INADIMPLENTE: "Pagamento em atraso, risco de bloqueio.",
  BLOQUEADO: "Acesso bloqueado por inadimplência ou infração.",
};

const ADMIN_MEMBERSHIP_ROLES = new Set([
  "ADMIN",
  "SUPERADMIN",
  "PRESIDENTE",
  "VICE_PRESIDENTE",
  "DIRETOR_FUTEBOL",
  "DIRETOR_FINANCEIRO",
]);

function normalizeStatus(params: {
  raw?: string | null;
  blocked?: boolean | null;
  trialEnd?: string | null;
  firstPaymentAt?: string | null;
}) {
  const { raw, blocked, trialEnd, firstPaymentAt } = params;
  const value = (raw || "").toUpperCase();
  const hasPaymentHistory = Boolean(firstPaymentAt);
  const trialEndsAt = trialEnd ? new Date(trialEnd) : null;
  const trialExpired =
    trialEndsAt instanceof Date &&
    !Number.isNaN(trialEndsAt.getTime()) &&
    trialEndsAt.getTime() < Date.now();

  if (blocked) return "BLOQUEADO";
  if (value.includes("ALERTA")) return "ALERTA";
  if (value.includes("INAD"))
    return hasPaymentHistory ? "INADIMPLENTE_COM_HISTORICO" : "SEM_CONVERSAO";
  if (value.includes("TRIALING")) {
    if (hasPaymentHistory) return "ATIVO";
    return trialExpired ? "TRIAL_EXPIRADO" : "TRIAL";
  }
  if (value.includes("EXPIRE"))
    return hasPaymentHistory ? "INADIMPLENTE_COM_HISTORICO" : "SEM_CONVERSAO";
  if (value.includes("TRIAL")) return trialExpired ? "TRIAL_EXPIRADO" : "TRIAL";
  if (value.includes("PAUSE")) return "BLOQUEADO";
  if (value.includes("BLOCK")) return "BLOQUEADO";
  if (value.includes("ATIVO") || value.includes("ACTIVE") || value.includes("PAID")) return "ATIVO";
  return value || "ATIVO";
}

function resolveTrialDays(trialStart?: string | null, trialEnd?: string | null) {
  if (!trialStart || !trialEnd) return null;
  const start = new Date(trialStart);
  const end = new Date(trialEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  // Date-only diff to avoid DST drift
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

function resolvePlanLabel(
  planKey?: string | null,
  status?: string | null,
  trialStart?: string | null,
  trialEnd?: string | null
) {
  const key = (planKey || "").toLowerCase();
  if (key.includes("vitrine")) return "Vitrine (Sem limite)";
  if (status && status.toUpperCase() === "TRIAL") {
    const trialDays = resolveTrialDays(trialStart, trialEnd) ?? 20;
    return `Trial (${trialDays} dias)`;
  }
  if (!key) return "Plano n/d";
  if (key.includes("marketing")) {
    return key.includes("year") || key.includes("anual")
      ? "Anual + Marketing"
      : "Mensal + Marketing";
  }
  if (key.includes("enterprise")) {
    return key.includes("year") || key.includes("anual") ? "Anual Enterprise" : "Mensal Enterprise";
  }
  if (key.includes("year") || key.includes("anual")) return "Anual Essencial";
  return "Mensal Essencial";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, "dd/MM/yyyy");
}

function daysSince(dateISO?: string | null) {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function isAdminMembershipRole(value?: string | null) {
  return value ? ADMIN_MEMBERSHIP_ROLES.has(value.toUpperCase()) : false;
}

function isApprovedAdminMembership(membership?: TenantMembership | null) {
  if (!membership) return false;
  if ((membership.status || "").toUpperCase() !== "APROVADO") return false;
  const role = membership.role || membership.user?.role;
  return isAdminMembershipRole(role);
}

function pickLatestDate(...values: Array<string | null | undefined>) {
  let latest: Date | null = null;
  for (const value of values) {
    if (!value) continue;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) continue;
    if (!latest || parsed.getTime() > latest.getTime()) {
      latest = parsed;
    }
  }
  return latest ? latest.toISOString() : null;
}

function resolveTenantLastActivity(tenant: Tenant) {
  const tenantScopedActivity = pickLatestDate(tenant.lastActivityAt);
  if (tenantScopedActivity) {
    return { value: tenantScopedActivity, source: "tenant" as const };
  }

  const fallbackActivity = pickLatestDate(tenant.updatedAt, tenant.createdAt);
  return {
    value: fallbackActivity,
    source: "fallback" as const,
  };
}

function cleanValue(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function resolveMembershipOwner(memberships?: TenantMembership[] | null) {
  if (!Array.isArray(memberships) || memberships.length === 0) return null;
  const approved = memberships.find(isApprovedAdminMembership) || memberships[0];
  const user = approved?.user;
  if (!user) return null;
  const name = cleanValue(user.name);
  const email = cleanValue(user.email);
  if (!name && !email) return null;
  return { name, email };
}

function resolveAboutOwner(aboutPage?: TenantAboutPage | null) {
  if (!aboutPage) return null;
  const raw =
    typeof aboutPage === "object" && aboutPage !== null
      ? ((aboutPage as { data?: unknown }).data ?? aboutPage)
      : aboutPage;
  if (!raw) return null;
  let data: any = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object") return null;
  const presidente = (data as any).presidente;
  if (!presidente || typeof presidente !== "object") return null;
  const name = cleanValue((presidente as any).nome || (presidente as any).name);
  const email = cleanValue((presidente as any).email);
  if (!name && !email) return null;
  return { name, email };
}

function resolveTenantOwner(tenant: Tenant) {
  const directName = cleanValue(tenant.ownerName);
  const directEmail = cleanValue(tenant.ownerEmail);
  if (directName || directEmail) return { name: directName, email: directEmail };

  const membershipOwner = resolveMembershipOwner(tenant.memberships);
  if (membershipOwner) return membershipOwner;

  const admin = Array.isArray(tenant.admins) ? tenant.admins[0] : null;
  const adminName = cleanValue((admin as any)?.name || (admin as any)?.nome || null);
  const adminEmail = cleanValue((admin as any)?.email || null);
  if (adminName || adminEmail) return { name: adminName, email: adminEmail };

  const aboutOwner = resolveAboutOwner(tenant.aboutPage);
  if (aboutOwner) return aboutOwner;

  return { name: null, email: null };
}

function isBlockedRacha(racha?: { status?: string | null; bloqueado?: boolean | null } | null) {
  return Boolean(racha?.bloqueado) || racha?.status === "BLOQUEADO";
}

async function signInAdminWithTokens(payload: {
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    tenantId?: string | null;
    tenantSlug?: string | null;
  } | null;
}) {
  if (!payload?.accessToken) {
    throw new Error("Token de acesso ausente para login.");
  }

  const csrfResponse = await fetch("/api/auth/csrf", { cache: "no-store" });
  if (!csrfResponse.ok) {
    throw new Error("Falha ao preparar login do admin.");
  }
  const csrfData = await csrfResponse.json().catch(() => null);
  const csrfToken = csrfData?.csrfToken;
  if (!csrfToken) {
    throw new Error("CSRF token ausente para login do admin.");
  }

  const params = new URLSearchParams();
  params.set("csrfToken", csrfToken);
  params.set("callbackUrl", "/admin/dashboard");
  params.set("json", "true");
  params.set("accessToken", payload.accessToken);

  if (payload.refreshToken) params.set("refreshToken", payload.refreshToken);
  if (payload.user?.id) params.set("id", payload.user.id);
  if (payload.user?.email) params.set("email", payload.user.email);
  if (payload.user?.name) params.set("name", payload.user.name);
  if (payload.user?.role) params.set("role", payload.user.role);
  if (payload.user?.tenantId) params.set("tenantId", payload.user.tenantId);
  if (payload.user?.tenantSlug) params.set("tenantSlug", payload.user.tenantSlug);

  const res = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));
  const responseUrl = typeof data?.url === "string" ? data.url : "";
  const errorParam = responseUrl
    ? new URL(responseUrl, window.location.origin).searchParams.get("error")
    : null;

  if (!res.ok || data?.error || errorParam) {
    const msg =
      data?.error || errorParam || data?.message || "Falha ao autenticar no painel admin.";
    throw new Error(msg);
  }

  return data;
}

export default function RachasCadastradosPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);
  const brandLabel = brandText("Fut7Pro");
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroInatividade, setFiltroInatividade] = useState("");
  const [modalRacha, setModalRacha] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [accessDialog, setAccessDialog] = useState<{ action: AccessAction; ids: string[] } | null>(
    null
  );

  const { data, isLoading, error, mutate } = useSWR<TenantsResponse | Tenant[]>(
    "/api/superadmin/tenants",
    fetcher,
    { revalidateOnFocus: false }
  );

  const tenants: Tenant[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as TenantsResponse).results)) return (data as TenantsResponse).results!;
    return [];
  }, [data]);

  const rachas = useMemo(
    () =>
      tenants
        .map((t) => {
          const subscription = t.subscription as any;
          const access = t.access as TenantAccess | null | undefined;
          const isVitrine = Boolean(t.isVitrine) || (t.slug || "").toLowerCase() === "vitrine";
          const status = isVitrine
            ? "ATIVO"
            : normalizeStatus({
                raw: access?.status ?? t.accessStatus ?? subscription?.status ?? t.status,
                blocked:
                  typeof access?.blocked === "boolean" ? access.blocked : (t.blocked ?? false),
                trialEnd: subscription?.trialEnd ?? t.trialEndsAt ?? null,
                firstPaymentAt: subscription?.firstPaymentAt ?? null,
              });
          const planLabel = isVitrine
            ? "Vitrine (Sem limite)"
            : resolvePlanLabel(
                subscription?.planKey ?? t.planKey ?? t.plan ?? subscription?.plan,
                status,
                subscription?.trialStart ?? null,
                subscription?.trialEnd ?? null
              );
          const owner = resolveTenantOwner(t);
          const admin = owner.name || owner.email || "--";
          const atividade = resolveTenantLastActivity(t);
          const ultimaAtividade = atividade.value;

          return {
            id: t.id,
            nome: t.name || t.slug || "Racha sem nome",
            presidente: admin || "--",
            plano: planLabel,
            status,
            ativo:
              status === "ATIVO" ||
              status === "ALERTA" ||
              status === "TRIAL" ||
              status === "INADIMPLENTE_COM_HISTORICO",
            atletas:
              t.playersCount ??
              t.athletes ??
              t.adminsCount ??
              (t as any)?._count?.athletes ??
              (t as any)?._count?.players ??
              (t as any)?._count?.users ??
              0,
            criadoEm: t.createdAt || "",
            ultimaAtividade,
            diasInativo: daysSince(ultimaAtividade),
            tipoInatividade: atividade.source,
            bloqueado: status === "BLOQUEADO",
            isVitrine,
            historico: [
              { acao: "Criado", criadoEm: t.createdAt || "" },
              { acao: "Ultima atualizacao", criadoEm: t.updatedAt || "" },
            ].filter((h) => h.criadoEm),
            ultimoLogBloqueio:
              status === "BLOQUEADO"
                ? {
                    detalhes: access?.reason || t.accessReason || "Bloqueado no backend",
                    criadoEm: t.updatedAt,
                  }
                : null,
          };
        })
        .sort((a, b) => {
          const aTime = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
          const bTime = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
          return bTime - aTime;
        }),
    [tenants]
  );

  const rachasFiltrados = useMemo(() => {
    const busca = search.toLowerCase();
    return rachas.filter((r) => {
      const matchNome = r.nome.toLowerCase().includes(busca);
      const matchPresidente = (r.presidente || "").toLowerCase().includes(busca);
      const filtro = filtroStatus.toUpperCase();
      const matchStatus = filtro ? r.status === filtro : true;
      const dias = r.diasInativo ?? null;
      const cutoff =
        filtroInatividade === "90"
          ? 90
          : filtroInatividade === "180"
            ? 180
            : filtroInatividade === "365"
              ? 365
              : filtroInatividade === "730"
                ? 730
                : filtroInatividade === "1095"
                  ? 1095
                  : null;
      const matchInatividade = cutoff ? dias !== null && dias >= cutoff : true;
      return (matchNome || matchPresidente) && matchStatus && matchInatividade;
    });
  }, [rachas, search, filtroStatus, filtroInatividade]);

  const rachasParaResumo = useMemo(() => rachas.filter((r) => !r.isVitrine), [rachas]);
  const total = rachasParaResumo.length;
  const ativos = rachasParaResumo.filter((r) => r.status === "ATIVO").length;
  const trials = rachasParaResumo.filter((r) => r.status === "TRIAL").length;
  const semConversao = rachasParaResumo.filter(
    (r) => r.status === "TRIAL_EXPIRADO" || r.status === "SEM_CONVERSAO"
  ).length;
  const inadimplentesComHistorico = rachasParaResumo.filter(
    (r) => r.status === "INADIMPLENTE_COM_HISTORICO" || r.status === "INADIMPLENTE"
  ).length;
  const bloqueados = rachasParaResumo.filter((r) => r.status === "BLOQUEADO" || r.bloqueado).length;
  const hoje = format(new Date(), "yyyy-MM-dd");
  const novosHoje = rachasParaResumo.filter((r) => (r.criadoEm || "").startsWith(hoje)).length;

  const rachaPorId = useMemo(() => new Map(rachas.map((r) => [r.id, r])), [rachas]);
  const rachasEditaveis = useMemo(
    () => rachasFiltrados.filter((r) => !r.isVitrine),
    [rachasFiltrados]
  );
  const selectedRachas = useMemo(
    () => selectedIds.map((id) => rachaPorId.get(id)).filter(Boolean),
    [selectedIds, rachaPorId]
  );
  const selectedBlockedCount = selectedRachas.filter((r) => isBlockedRacha(r)).length;
  const selectedUnblockedCount = selectedRachas.filter((r) => !isBlockedRacha(r)).length;
  const deleteTargets = useMemo(
    () => deleteIds.map((id) => rachaPorId.get(id)).filter(Boolean),
    [deleteIds, rachaPorId]
  );
  const deleteLabel =
    deleteTargets.length === 1
      ? deleteTargets[0]?.nome || "este racha"
      : `${deleteTargets.length} rachas`;
  const accessTargets = useMemo(
    () => (accessDialog?.ids ?? []).map((id) => rachaPorId.get(id)).filter(Boolean),
    [accessDialog?.ids, rachaPorId]
  );
  const accessLabel =
    accessTargets.length === 1
      ? accessTargets[0]?.nome || "este racha"
      : `${accessTargets.length} rachas`;

  function handleSelecionarTodos(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedIds(e.target.checked ? rachasEditaveis.map((r) => r.id) : []);
  }
  function handleSelecionar(id: string, canSelect = true) {
    if (!canSelect) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function statusLabel(status: string) {
    if (status === "ATIVO") return "Ativo";
    if (status === "ALERTA") return "Alerta";
    if (status === "TRIAL") return "Trial";
    if (status === "TRIAL_EXPIRADO") return "Trial expirado";
    if (status === "SEM_CONVERSAO") return "Sem conversao";
    if (status === "INADIMPLENTE_COM_HISTORICO") return "Inadimplente c/ historico";
    if (status === "INADIMPLENTE") return "Inadimplente";
    if (status === "BLOQUEADO") return "Bloqueado";
    return status;
  }

  function openAccessDialog(action: AccessAction, selected: string[]) {
    if (!selected.length) return;
    const editable = selected.filter((id) => !rachaPorId.get(id)?.isVitrine);
    if (editable.length !== selected.length) {
      showFut7Toast({
        tone: "warning",
        title: "Racha vitrine protegido",
        message: "Rachas vitrine não podem ser alterados pelo SuperAdmin.",
      });
    }
    if (!editable.length) return;
    const targets = editable.filter((id) => {
      const racha = rachaPorId.get(id);
      return action === "block" ? !isBlockedRacha(racha) : isBlockedRacha(racha);
    });

    if (!targets.length) {
      showFut7Toast({
        tone: "info",
        title:
          action === "block"
            ? "Nenhum racha liberado selecionado"
            : "Nenhum racha bloqueado selecionado",
        message:
          action === "block"
            ? "Selecione rachas liberados para aplicar bloqueio manual."
            : "Selecione rachas bloqueados para remover o bloqueio manual.",
      });
      return;
    }

    setAccessDialog({ action, ids: targets });
  }

  async function confirmAccessChange() {
    if (!accessDialog?.ids.length) return;

    const action = accessDialog.action;
    const ids = accessDialog.ids;
    const isBlock = action === "block";
    const actionLabel = isBlock ? "Bloquear" : "Desbloquear";
    const reason = isBlock
      ? "Bloqueio manual confirmado pelo SuperAdmin"
      : "Desbloqueio manual confirmado pelo SuperAdmin";

    setPendingAction(actionLabel);
    try {
      await Promise.all(
        ids.map(async (id) => {
          const resp = await fetch(
            `/api/superadmin/tenants/${id}/${isBlock ? "block" : "unblock"}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reason, confirmed: true }),
            }
          );
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            throw new Error(
              (data as any)?.error ||
                (data as any)?.message ||
                `Falha ao ${isBlock ? "bloquear" : "desbloquear"} racha.`
            );
          }
        })
      );
      setAccessDialog(null);
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      await mutate();
      showFut7Toast({
        tone: "success",
        title: isBlock ? "Racha bloqueado" : "Racha desbloqueado",
        message:
          ids.length === 1
            ? `A operação em ${accessLabel} foi concluída.`
            : `${ids.length} rachas foram atualizados com sucesso.`,
      });
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : `Falha ao ${isBlock ? "bloquear" : "desbloquear"} racha(s).`;
      showFut7Toast({
        tone: "error",
        title: isBlock ? "Falha ao bloquear racha(s)" : "Falha ao desbloquear racha(s)",
        message: msg,
      });
    } finally {
      setPendingAction(null);
    }
  }

  function handleAviso(selected: string[]) {
    if (!selected.length) return;
    const editable = selected.filter((id) => !rachaPorId.get(id)?.isVitrine);
    if (editable.length !== selected.length) {
      showFut7Toast({
        tone: "warning",
        title: "Racha vitrine protegido",
        message: "Rachas vitrine não podem ser alterados pelo SuperAdmin.",
      });
    }
    if (!editable.length) return;
    setPendingAction("Aviso");
    Promise.all(
      editable.map((id) =>
        fetch(`/api/superadmin/tenants/${id}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Aviso do Superadmin",
            message: "Contato iniciado pelo superadmin. Favor checar o painel.",
          }),
        })
      )
    )
      .then(() => mutate())
      .catch(() =>
        showFut7Toast({
          tone: "error",
          title: "Falha ao enviar aviso",
          message: "Tente novamente ou verifique os logs da operação.",
        })
      )
      .finally(() => setPendingAction(null));
  }

  function handleDelete(selected: string[]) {
    if (!selected.length) return;
    const editable = selected.filter((id) => !rachaPorId.get(id)?.isVitrine);
    if (editable.length !== selected.length) {
      showFut7Toast({
        tone: "warning",
        title: "Racha vitrine protegido",
        message: "Rachas vitrine não podem ser alterados pelo SuperAdmin.",
      });
    }
    if (!editable.length) return;
    setDeleteIds(editable);
  }

  async function confirmDelete() {
    if (!deleteIds.length) return;
    setPendingAction("Excluir");
    try {
      await Promise.all(
        deleteIds.map(async (id) => {
          const resp = await fetch(`/api/superadmin/tenants/${id}`, { method: "DELETE" });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            const requestId = resp.headers.get("x-request-id") || (data as any)?.requestId;
            const message =
              (data as any)?.error ||
              (data as any)?.message ||
              "Falha ao excluir racha. A operação foi registrada para auditoria.";
            throw new Error(requestId ? `${message} RequestId: ${requestId}` : message);
          }
        })
      );
      setSelectedIds([]);
      setDeleteIds([]);
      mutate();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Falha ao excluir racha(s).";
      showFut7Toast({
        tone: "error",
        title: "Falha ao excluir racha(s)",
        message: msg,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleImpersonate(tenant: any) {
    if (!tenant?.id) return;
    const popup = window.open("", "_blank", "noopener");
    setPendingAction("Impersonate");
    try {
      const resp = await fetch(`/api/superadmin/tenants/${tenant.id}/impersonate`, {
        method: "POST",
      });
      const data = await resp.json().catch(() => ({}) as any);
      if (!resp.ok) {
        const msg = (data as any)?.message || "Falha ao impersonar admin.";
        throw new Error(msg);
      }

      await signInAdminWithTokens({
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
        user: data?.user,
      });

      if (popup) {
        popup.location.href = "/admin/dashboard";
      } else {
        window.open("/admin/dashboard", "_blank", "noopener");
      }
    } catch (error) {
      if (popup) popup.close();
      const msg = error instanceof Error ? error.message : String(error);
      showFut7Toast({
        tone: "error",
        title: "Não foi possível acessar como admin",
        message: msg,
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <Head>
        <title>{`Gestão de Rachas - Painel SuperAdmin | ${brandLabel}`}</title>
        <meta
          name="description"
          content={`Administre todos os rachas SaaS na plataforma ${brandLabel}: veja status, planos, atletas, bloqueie, exporte, filtre e otimize sua gestão multi-tenant.`}
        />
        <meta
          name="keywords"
          content={`gestão de racha, plataforma saas, administrar racha, superadmin, futebol 7, controle de clubes, exportar csv, bloqueio de clientes, status racha, ${brandLabel}`}
        />
      </Head>
      <div className="w-full min-h-screen">
        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-900/40 px-4 py-2 text-sm text-red-100">
            Falha ao carregar rachas. Verifique a API /superadmin/tenants.
          </div>
        )}

        {/* RESUMO NO TOPO */}
        <div className="mb-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          <ResumoCard title="Total" value={total} />
          <ResumoCard title="Ativos" value={ativos} badge="bg-green-700" />
          <ResumoCard title="Trials" value={trials} badge="bg-yellow-700" />
          <ResumoCard title="Sem Conversao" value={semConversao} badge="bg-orange-700" />
          <ResumoCard
            title="Inad. c/ Historico"
            value={inadimplentesComHistorico}
            badge="bg-red-700"
          />
          <ResumoCard title="Bloqueados" value={bloqueados} badge="bg-gray-700" />
          <ResumoCard title="Novos Hoje" value={novosHoje} badge="bg-blue-700" />
          <ResumoCard
            title="Trial Expirado"
            value={rachasParaResumo.filter((r) => r.status === "TRIAL_EXPIRADO").length}
            badge="bg-amber-700"
          />
        </div>

        {/* BUSCA E FILTRO */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex w-full min-w-0 items-center rounded-lg bg-zinc-900 px-3 py-2 lg:w-auto lg:min-w-[280px]">
            <FaSearch className="text-zinc-500 mr-2" />
            <input
              className="min-w-0 w-full bg-transparent text-sm text-zinc-100 outline-none"
              placeholder="Buscar por nome, presidente ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar racha"
            />
          </div>
          <select
            className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-100 sm:w-auto"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            aria-label="Filtrar status"
          >
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativos</option>
            <option value="TRIAL">Trial</option>
            <option value="TRIAL_EXPIRADO">Trial expirado</option>
            <option value="SEM_CONVERSAO">Sem conversao</option>
            <option value="INADIMPLENTE_COM_HISTORICO">Inadimplente c/ historico</option>
            <option value="BLOQUEADO">Bloqueados</option>
          </select>
          <select
            className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-100 sm:w-auto"
            value={filtroInatividade}
            onChange={(e) => setFiltroInatividade(e.target.value)}
            aria-label="Filtrar por inatividade"
            title="Sem login/atualizacao ha pelo menos X dias"
          >
            <option value="">Todas as inatividades</option>
            <option value="90">Inativos ha 3+ meses</option>
            <option value="180">Inativos ha 6+ meses</option>
            <option value="365">Inativos ha 12+ meses</option>
            <option value="730">Inativos ha 24+ meses</option>
            <option value="1095">Inativos ha 36+ meses</option>
          </select>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-bold text-black shadow opacity-60 cursor-not-allowed sm:w-auto"
            disabled
            title="Export em desenvolvimento (aguarda endpoint oficial)"
          >
            <FaDownload /> Exportar .CSV
          </button>
        </div>

        {/* ACOES EM MASSA */}
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            className="bg-blue-900 text-zinc-100 px-3 py-1 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIds.length === 0}
          >
            Acessar como Admin
          </button>
          <button
            className="bg-red-900 text-zinc-100 px-3 py-1 rounded shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedUnblockedCount === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && openAccessDialog("block", selectedIds)}
          >
            Bloquear
          </button>
          <button
            className="bg-emerald-800 text-zinc-100 px-3 py-1 rounded shadow hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedBlockedCount === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && openAccessDialog("unblock", selectedIds)}
          >
            Desbloquear
          </button>
          <button
            className="bg-zinc-600 text-zinc-100 px-3 py-1 rounded shadow hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIds.length === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && handleAviso(selectedIds)}
          >
            Enviar Aviso
          </button>
          <button
            className="bg-rose-900 text-zinc-100 px-3 py-1 rounded shadow hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIds.length === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && handleDelete(selectedIds)}
          >
            Excluir
          </button>
        </div>

        {/* TABELA */}
        <div className="overflow-visible rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <table className="w-full table-fixed text-xs text-zinc-100 xl:text-sm">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
              <col className="w-[9%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[5%]" />
            </colgroup>
            <thead className="bg-zinc-950/60">
              <tr>
                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === rachasEditaveis.length && rachasEditaveis.length > 0
                    }
                    onChange={handleSelecionarTodos}
                  />
                </th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Nome
                </th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Presidente
                </th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Plano
                </th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Status
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Atletas
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Criado em
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Ultima atividade
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Acoes
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-300 xl:px-3">
                  Bloqueio
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-zinc-400">
                    Carregando rachas...
                  </td>
                </tr>
              )}
              {!isLoading &&
                rachasFiltrados.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800 duration-100">
                    <td className="px-2 py-2 xl:px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => handleSelecionar(r.id, !r.isVitrine)}
                        disabled={Boolean(r.isVitrine)}
                        title={r.isVitrine ? "Racha vitrine nao pode ser alterado." : undefined}
                      />
                    </td>
                    <td className="break-words px-2 py-2 font-semibold xl:px-3">{r.nome}</td>
                    <td className="break-words px-2 py-2 text-zinc-300 xl:px-3">{r.presidente}</td>
                    <td className="break-words px-2 py-2 text-zinc-300 xl:px-3">{r.plano}</td>
                    <td className="px-2 py-2 xl:px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold cursor-default ${STATUS_BADGES[r.status as keyof typeof STATUS_BADGES] || "bg-gray-700 text-zinc-300"}`}
                        title={STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center xl:px-3">{r.atletas ?? 0}</td>
                    <td className="px-2 py-2 text-center xl:px-3">
                      {r.criadoEm ? formatDate(r.criadoEm) : "--"}
                    </td>
                    <td className="px-2 py-2 text-center xl:px-3">
                      {r.ultimaAtividade ? formatDate(r.ultimaAtividade) : "--"}
                      {typeof r.diasInativo === "number" ? (
                        <span className="block text-xs text-zinc-400">
                          {r.diasInativo} dias sem{" "}
                          {r.tipoInatividade === "tenant" ? "atividade real" : "atualizacao"}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 text-center xl:px-3">
                      <div className="flex flex-col items-stretch justify-center gap-1">
                        <button
                          className="flex items-center justify-center gap-1 rounded bg-blue-700 px-2 py-1 text-[11px] font-bold hover:bg-blue-900"
                          onClick={() => setModalRacha(r)}
                          title="Detalhes e Acoes"
                        >
                          <FaInfoCircle /> Detalhes
                        </button>
                        <button
                          className="flex items-center justify-center gap-1 rounded bg-green-800 px-2 py-1 text-[11px] font-bold hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleImpersonate(r)}
                          title="Acessar Painel Admin como Presidente"
                          disabled={Boolean(pendingAction)}
                        >
                          <FaUserShield /> Admin
                        </button>
                        {(() => {
                          const blocked = isBlockedRacha(r);
                          return (
                            <button
                              className={`flex items-center justify-center gap-1 rounded px-2 py-1 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                                blocked
                                  ? "bg-emerald-800 hover:bg-emerald-700"
                                  : "bg-red-700 hover:bg-red-900"
                              }`}
                              title={
                                r.isVitrine
                                  ? "Racha vitrine nao pode ser alterado."
                                  : blocked
                                    ? "Desbloquear Racha"
                                    : "Bloquear Racha"
                              }
                              disabled={Boolean(pendingAction) || Boolean(r.isVitrine)}
                              onClick={() =>
                                openAccessDialog(blocked ? "unblock" : "block", [r.id])
                              }
                            >
                              {blocked ? <FaUnlock /> : <FaLock />}
                              {blocked ? "Desbloquear" : "Bloquear"}
                            </button>
                          );
                        })()}
                        <button
                          className="flex items-center justify-center gap-1 rounded bg-rose-800 px-2 py-1 text-[11px] font-bold hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            r.isVitrine ? "Racha vitrine nao pode ser alterado." : "Excluir Racha"
                          }
                          disabled={Boolean(pendingAction) || Boolean(r.isVitrine)}
                          onClick={() => handleDelete([r.id])}
                        >
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center xl:px-3">
                      {isBlockedRacha(r) ? (
                        <span className="flex flex-col items-center gap-1 text-red-400 font-bold">
                          <FaLock /> Sim
                        </span>
                      ) : (
                        <span className="text-green-400 font-bold">Nao</span>
                      )}
                    </td>
                  </tr>
                ))}
              {!isLoading && rachasFiltrados.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-zinc-400">
                    Nenhum racha encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL DETALHES DO RACHA */}
        {modalRacha && (
          <ModalDetalhesRacha
            racha={modalRacha}
            onClose={() => setModalRacha(null)}
            onRefresh={() => mutate()}
          />
        )}
        <Fut7ConfirmDialog
          open={Boolean(accessDialog)}
          title={
            accessDialog?.action === "unblock"
              ? `Desbloquear ${accessLabel}?`
              : `Bloquear ${accessLabel}?`
          }
          eyebrow="Controle operacional"
          tone={accessDialog?.action === "unblock" ? "default" : "warning"}
          description={
            accessDialog?.action === "unblock"
              ? "O racha voltará a acessar o painel e os recursos administrativos conforme a regra atual de assinatura, compensação e lifecycle."
              : "O racha ficará sem acesso operacional ao painel Admin até que o bloqueio manual seja removido pelo SuperAdmin."
          }
          confirmLabel={accessDialog?.action === "unblock" ? "Desbloquear racha" : "Bloquear racha"}
          cancelLabel="Cancelar"
          loading={
            pendingAction === (accessDialog?.action === "unblock" ? "Desbloquear" : "Bloquear")
          }
          impactItems={
            accessDialog?.action === "unblock"
              ? [
                  "O bloqueio manual será removido do histórico de acesso.",
                  "A UI será revalidada para refletir o estado liberado ou a regra de assinatura vigente.",
                  "A ação ficará registrada nos logs do SuperAdmin.",
                ]
              : [
                  "O Admin do racha perderá acesso ao painel operacional.",
                  "O bloqueio manual tem prioridade sobre assinatura e compensação ativa.",
                  "A ação ficará registrada nos logs do SuperAdmin.",
                ]
          }
          onClose={() => setAccessDialog(null)}
          onConfirm={() => void confirmAccessChange()}
        />
        <Fut7DestructiveDialog
          open={deleteIds.length > 0}
          title={`Excluir ${deleteLabel}?`}
          description="Esta ação remove dados do racha selecionado. As contas globais dos usuários não serão apagadas, mas o tenant deixa de existir na operação normal."
          confirmLabel="Excluir racha"
          cancelLabel="Cancelar"
          confirmationText="EXCLUIR RACHA"
          confirmationLabel="Digite a frase abaixo para confirmar"
          loading={pendingAction === "Excluir"}
          impactItems={[
            "Dados do racha selecionado serão removidos pelo backend.",
            "Contas globais dos usuários não serão apagadas.",
            "Rachas vitrine continuam protegidos e não entram nesta ação.",
          ]}
          onClose={() => setDeleteIds([])}
          onConfirm={() => void confirmDelete()}
        />
      </div>
    </>
  );
}

function ResumoCard({ title, value, badge }: { title: string; value: number; badge?: string }) {
  return (
    <div className="flex min-w-[90px] flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-3 text-center shadow-sm sm:min-w-[110px] sm:px-4 sm:py-4">
      <span className="text-zinc-400 text-xs uppercase">{title}</span>
      <span className={`text-2xl font-bold ${badge || ""}`}>{value}</span>
    </div>
  );
}
