"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  FaSearch,
  FaDownload,
  FaLock,
  FaInfoCircle,
  FaHistory,
  FaUserShield,
  FaTrash,
} from "react-icons/fa";
import { format } from "date-fns";
import ModalDetalhesRacha from "@/components/superadmin/ModalDetalhesRacha";
import { useBranding } from "@/hooks/useBranding";
type TenantMembership = {
  status?: string | null;
  role?: string | null;
  createdAt?: string | null;
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
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

type Tenant = {
  id: string;
  name?: string;
  slug?: string;
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
  } | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  createdAt?: string | null;
  blocked?: boolean | null;
  trialEndsAt?: string | null;
  lastLoginAt?: string | null;
  updatedAt?: string | null;
};

type TenantsResponse = { results?: Tenant[] };

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
};

const STATUS_BADGES = {
  ATIVO: "bg-green-700 text-green-200",
  TRIAL: "bg-yellow-700 text-yellow-200",
  INADIMPLENTE: "bg-red-700 text-red-200",
  BLOQUEADO: "bg-gray-600 text-gray-200",
};

const STATUS_LABELS = {
  ATIVO: "Racha ativo e operando normalmente.",
  TRIAL: "Periodo de teste, com limitacao de recursos.",
  INADIMPLENTE: "Pagamento em atraso, risco de bloqueio.",
  BLOQUEADO: "Acesso bloqueado por inadimplencia ou infracao.",
};

function normalizeStatus(raw?: string | null, blocked?: boolean | null) {
  const value = (raw || "").toUpperCase();
  if (blocked) return "BLOQUEADO";
  if (value.includes("INAD")) return "INADIMPLENTE";
  if (value.includes("TRIAL")) return "TRIAL";
  if (value.includes("TRIALING")) return "TRIAL";
  if (value.includes("PAUSE")) return "BLOQUEADO";
  if (value.includes("EXPIRE")) return "INADIMPLENTE";
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

function cleanValue(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function resolveMembershipOwner(memberships?: TenantMembership[] | null) {
  if (!Array.isArray(memberships) || memberships.length === 0) return null;
  const approved =
    memberships.find((m) => (m.status || "").toUpperCase() === "APROVADO") || memberships[0];
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
      tenants.map((t) => {
        const subscription = t.subscription as any;
        const status = normalizeStatus(subscription?.status ?? t.status, t.blocked);
        const planLabel = resolvePlanLabel(
          subscription?.planKey ?? t.planKey ?? t.plan ?? subscription?.plan,
          status,
          subscription?.trialStart ?? null,
          subscription?.trialEnd ?? null
        );
        const owner = resolveTenantOwner(t);
        const admin = owner.name || owner.email || "--";
        const ultimaAtividade = t.lastLoginAt || t.updatedAt || t.createdAt || null;

        return {
          id: t.id,
          nome: t.name || t.slug || "Racha sem nome",
          presidente: admin || "--",
          plano: planLabel,
          status,
          ativo: status === "ATIVO" || status === "TRIAL",
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
          bloqueado: status === "BLOQUEADO",
          historico: [
            { acao: "Criado", criadoEm: t.createdAt || "" },
            { acao: "Ultima atualizacao", criadoEm: t.updatedAt || "" },
          ].filter((h) => h.criadoEm),
          ultimoLogBloqueio: t.blocked
            ? { detalhes: "Bloqueado no backend", criadoEm: t.updatedAt }
            : null,
        };
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

  const total = rachas.length;
  const ativos = rachas.filter((r) => r.status === "ATIVO").length;
  const trials = rachas.filter((r) => r.status === "TRIAL").length;
  const inadimplentes = rachas.filter((r) => r.status === "INADIMPLENTE").length;
  const bloqueados = rachas.filter((r) => r.status === "BLOQUEADO" || r.bloqueado).length;
  const hoje = format(new Date(), "yyyy-MM-dd");
  const novosHoje = rachas.filter((r) => (r.criadoEm || "").startsWith(hoje)).length;

  function handleSelecionarTodos(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedIds(e.target.checked ? rachasFiltrados.map((r) => r.id) : []);
  }
  function handleSelecionar(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function statusLabel(status: string) {
    if (status === "ATIVO") return "Ativo";
    if (status === "TRIAL") return "Trial";
    if (status === "INADIMPLENTE") return "Inadimplente";
    if (status === "BLOQUEADO") return "Bloqueado";
    return status;
  }

  function handleBlock(selected: string[]) {
    if (!selected.length) return;
    const reason = "Bloqueio manual pelo superadmin";
    setPendingAction("Bloquear");
    Promise.all(
      selected.map((id) =>
        fetch(`/api/superadmin/tenants/${id}/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        })
      )
    )
      .then(() => mutate())
      .catch(() => alert("Falha ao bloquear racha(s)."))
      .finally(() => setPendingAction(null));
  }

  function handleAviso(selected: string[]) {
    if (!selected.length) return;
    setPendingAction("Aviso");
    Promise.all(
      selected.map((id) =>
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
      .catch(() => alert("Falha ao enviar aviso."))
      .finally(() => setPendingAction(null));
  }

  async function handleDelete(selected: string[]) {
    if (!selected.length) return;
    const label = selected.length === 1 ? "este racha" : `${selected.length} rachas`;
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${label}? Esta acao remove todos os dados do racha.`
    );
    if (!confirmed) return;
    setPendingAction("Excluir");
    try {
      await Promise.all(
        selected.map(async (id) => {
          const resp = await fetch(`/api/superadmin/tenants/${id}`, { method: "DELETE" });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            throw new Error((data as any)?.error || (data as any)?.message || "Falha ao excluir.");
          }
        })
      );
      setSelectedIds([]);
      mutate();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Falha ao excluir racha(s).";
      alert(msg);
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
      alert(`Nao foi possivel acessar como admin: ${msg}`);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <Head>
        <title>{`Gestao de Rachas - Painel SuperAdmin | ${brandLabel}`}</title>
        <meta
          name="description"
          content={`Administre todos os rachas SaaS na plataforma ${brandLabel}: veja status, planos, atletas, bloqueie, exporte, filtre e otimize sua gestao multi-tenant.`}
        />
        <meta
          name="keywords"
          content={`gestao de racha, plataforma saas, administrar racha, superadmin, futebol 7, controle de clubes, exportar csv, bloqueio de clientes, status racha, ${brandLabel}`}
        />
      </Head>
      <div className="w-full min-h-screen">
        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-900/40 px-4 py-2 text-sm text-red-100">
            Falha ao carregar rachas. Verifique a API /superadmin/tenants.
          </div>
        )}

        {/* RESUMO NO TOPO */}
        <div className="mb-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <ResumoCard title="Total" value={total} />
          <ResumoCard title="Ativos" value={ativos} badge="bg-green-700" />
          <ResumoCard title="Trials" value={trials} badge="bg-yellow-700" />
          <ResumoCard title="Inadimplentes" value={inadimplentes} badge="bg-red-700" />
          <ResumoCard title="Bloqueados" value={bloqueados} badge="bg-gray-700" />
          <ResumoCard title="Novos Hoje" value={novosHoje} badge="bg-blue-700" />
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
            <option value="Ativo">Ativos</option>
            <option value="Trial">Trial</option>
            <option value="Inadimplente">Inadimplentes</option>
            <option value="Bloqueado">Bloqueados</option>
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
            disabled={selectedIds.length === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && handleBlock(selectedIds)}
          >
            Bloquear
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
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <table className="min-w-[980px] w-full text-sm text-zinc-100">
            <thead className="bg-zinc-950/60">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === rachasFiltrados.length && rachasFiltrados.length > 0
                    }
                    onChange={handleSelecionarTodos}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Nome
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Presidente
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Plano
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Atletas
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Criado em
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Ultima atividade
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
                  Acoes
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:px-4 sm:py-3">
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
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => handleSelecionar(r.id)}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold sm:px-4 sm:py-3">{r.nome}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{r.presidente}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">{r.plano}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold cursor-default ${STATUS_BADGES[r.status as keyof typeof STATUS_BADGES] || "bg-gray-700 text-zinc-300"}`}
                        title={STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center sm:px-4 sm:py-3">{r.atletas ?? 0}</td>
                    <td className="px-3 py-2 text-center sm:px-4 sm:py-3">
                      {r.criadoEm ? formatDate(r.criadoEm) : "--"}
                    </td>
                    <td className="px-3 py-2 text-center sm:px-4 sm:py-3">
                      {r.ultimaAtividade ? formatDate(r.ultimaAtividade) : "--"}
                      {typeof r.diasInativo === "number" ? (
                        <span className="block text-xs text-zinc-400">
                          {r.diasInativo} dias sem login
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-center sm:px-4 sm:py-3">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          className="flex items-center gap-1 rounded bg-blue-700 px-3 py-1 text-[11px] font-bold hover:bg-blue-900 sm:text-xs"
                          onClick={() => setModalRacha(r)}
                          title="Detalhes e Acoes"
                        >
                          <FaInfoCircle /> Detalhes
                        </button>
                        <button
                          className="flex items-center gap-1 rounded bg-green-800 px-3 py-1 text-[11px] font-bold hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                          onClick={() => handleImpersonate(r)}
                          title="Acessar Painel Admin como Presidente"
                          disabled={Boolean(pendingAction)}
                        >
                          <FaUserShield /> Login como Admin
                        </button>
                        <button
                          className="flex items-center gap-1 rounded bg-red-700 px-3 py-1 text-[11px] font-bold hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                          title="Bloquear Racha"
                          disabled={Boolean(pendingAction)}
                          onClick={() => handleBlock([r.id])}
                        >
                          <FaLock /> Bloquear
                        </button>
                        <button
                          className="flex items-center gap-1 rounded bg-rose-800 px-3 py-1 text-[11px] font-bold hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                          title="Excluir Racha"
                          disabled={Boolean(pendingAction)}
                          onClick={() => handleDelete([r.id])}
                        >
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center sm:px-4 sm:py-3">
                      {r.status === "BLOQUEADO" || r.bloqueado ? (
                        <span className="flex items-center gap-1 text-red-400 font-bold">
                          <FaLock /> Bloqueado
                        </span>
                      ) : (
                        <span className="text-green-400 font-bold">Liberado</span>
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
