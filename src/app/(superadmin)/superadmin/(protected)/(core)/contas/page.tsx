"use client";

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FaBan,
  FaCheck,
  FaChevronDown,
  FaEye,
  FaFilter,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";
import { useBranding } from "@/hooks/useBranding";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import {
  Fut7DestructiveDialog,
  Fut7PromptDialog,
  Fut7SuccessDialog,
  showFut7Toast,
} from "@/components/ui/feedback";
import {
  ACCOUNT_ROLE_LABELS,
  ACCOUNT_ROLE_OPTIONS,
  DEFAULT_ACCOUNT_FILTERS,
  filterSuperAdminAccounts,
  getAccountDeletionBlockers,
  getAccountFilterChips,
  getAccountMemberships,
  getAccountTenantCount,
  parseAccountFiltersFromSearchParams,
  writeAccountFiltersToSearchParams,
  type AccountFilters,
} from "@/lib/superadmin-account-filters";
import type {
  Usuario,
  UsuarioDeletionReason,
  UsuarioMembership,
  UsuarioRelationship,
  UsuarioRelationshipSummary,
} from "@/types/superadmin";

type SuccessFeedback = {
  title: string;
  description?: ReactNode;
};

type BulkDeleteBlockedReason = {
  code?: string;
  message?: string;
  count?: number;
};

type BulkDeleteResult = {
  selectedCount?: number;
  deletedCount?: number;
  blockedCount?: number;
  deleted?: Array<{ id: string; email?: string | null; name?: string | null }>;
  blocked?: Array<{
    id: string;
    email?: string | null;
    name?: string | null;
    reasons?: BulkDeleteBlockedReason[];
  }>;
};

type BulkDeletePreview = {
  selectedCount?: number;
  eligibleCount?: number;
  blockedCount?: number;
  eligible?: Array<{ id: string; email?: string | null; name?: string | null }>;
  blocked?: Array<{
    id: string;
    email?: string | null;
    name?: string | null;
    reasons?: BulkDeleteBlockedReason[];
  }>;
};

type UserRelationshipsResponse = {
  user?: { id?: string; email?: string | null; name?: string | null } | null;
  eligibleForDeletion?: boolean;
  reasons?: UsuarioDeletionReason[];
  summary?: UsuarioRelationshipSummary | null;
  relationships?: UsuarioRelationship[];
};

type PendingUnlink = {
  user: Usuario;
  tenantId: string;
  tenantNome: string;
};

const QUICK_FILTERS: Array<{
  key: string;
  label: string;
  patch: Partial<AccountFilters>;
}> = [
  { key: "active", label: "Ativas", patch: { status: "active" } },
  { key: "disabled", label: "Desativadas", patch: { status: "disabled" } },
  { key: "noTenant", label: "Sem racha", patch: { tenantCount: "0", operational: "noTenant" } },
  { key: "never", label: "Nunca acessaram", patch: { lastLogin: "never" } },
  { key: "inactive30", label: "Sem login ha 30 dias", patch: { inactivity: "30" } },
  { key: "inactive60", label: "Sem login ha 60 dias", patch: { inactivity: "60" } },
  { key: "inactive90", label: "Sem login ha 90 dias", patch: { inactivity: "90" } },
];

function formatDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function resolveProvider(provider?: string) {
  if (!provider) return "Email/Senha";
  if (provider.toLowerCase() === "google") return "Google";
  if (provider.toLowerCase() === "credentials") return "Email/Senha";
  return provider;
}

function summarizeRoleCounts(user: Usuario) {
  const memberships = user.memberships;
  const counter = new Map<string, number>();
  (memberships || []).forEach((membership) => {
    const key = String(membership.role || "ATLETA").toUpperCase();
    counter.set(key, (counter.get(key) || 0) + 1);
  });

  if (counter.size === 0 && (user.relationshipSummary?.athleteCount || 0) > 0) {
    counter.set("ATLETA", user.relationshipSummary?.athleteCount || 0);
  }

  if (counter.size === 0 && (user.relationshipSummary?.adminCount || 0) > 0) {
    counter.set("ADMIN", user.relationshipSummary?.adminCount || 0);
  }

  return Array.from(counter.entries()).map(([role, count]) => ({
    role,
    label: ACCOUNT_ROLE_LABELS[role] || role,
    count,
  }));
}

function summarizeTenants(user: Usuario) {
  const linkedTenants =
    Array.isArray(user.linkedTenants) && user.linkedTenants.length > 0
      ? user.linkedTenants.map(
          (tenant) => tenant.tenantNome || tenant.tenantSlug || tenant.tenantId
        )
      : null;
  const memberships = user.memberships;
  if (
    (!memberships || memberships.length === 0) &&
    (!linkedTenants || linkedTenants.length === 0)
  ) {
    return "--";
  }
  const names = Array.from(
    new Set(
      (
        linkedTenants ||
        memberships.map(
          (membership) => membership.tenantNome || membership.tenantSlug || membership.tenantId
        )
      ).filter(Boolean)
    )
  ) as string[];
  if (names.length === 0) return "--";
  const visible = names.slice(0, 2).join(", ");
  const remaining = names.length - 2;
  return remaining > 0 ? `${visible} +${remaining}` : visible;
}

function getAccountDeletionConfirmation(user?: Usuario | null) {
  const email = String(user?.email || "")
    .trim()
    .toLowerCase();
  if (email) return email;
  return `ID:${user?.id || "CONTA-SEM-EMAIL"}`;
}

function parseResponseBody(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function getErrorMessage(body: any, fallback: string) {
  if (body?.message) return Array.isArray(body.message) ? body.message.join("; ") : body.message;
  if (body?.error) return body.error;
  if (typeof body === "string" && body.trim()) return body;
  return fallback;
}

function pluralizeAccount(count: number) {
  return count === 1 ? "conta" : "contas";
}

function buildBulkDeleteDescription(result: BulkDeleteResult) {
  const selected = result.selectedCount ?? 0;
  const deleted = result.deletedCount ?? 0;
  const blocked = result.blockedCount ?? 0;
  const blockedItems = result.blocked || [];
  const examples = blockedItems.slice(0, 4);

  return (
    <div className="space-y-3">
      <p>
        {selected} {pluralizeAccount(selected)} selecionada{selected === 1 ? "" : "s"}. {deleted}{" "}
        excluida{deleted === 1 ? "" : "s"} com sucesso. {blocked} impedida
        {blocked === 1 ? "" : "s"} por regra de seguranca.
      </p>
      {examples.length > 0 ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/85">
            Contas impedidas
          </p>
          <ul className="mt-2 space-y-2 text-xs leading-5 text-zinc-300">
            {examples.map((item) => {
              const reason = item.reasons?.[0]?.message || "Possui vinculos ativos.";
              return (
                <li key={item.id}>
                  <strong className="text-zinc-100">{item.email || item.name || item.id}</strong>:{" "}
                  {reason}
                </li>
              );
            })}
          </ul>
          {blockedItems.length > examples.length ? (
            <p className="mt-2 text-xs text-zinc-400">
              +{blockedItems.length - examples.length} conta(s) impedida(s) no mesmo resultado.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function resolveRelationshipTypeLabel(relationship: UsuarioRelationship) {
  switch (relationship.type) {
    case "DIRECT_TENANT_LINK":
      return "Conta principal";
    case "MEMBERSHIP":
      return "Membership";
    case "ATHLETE":
      return "Atleta";
    case "ADMIN":
      return "Admin legado";
    default:
      return relationship.label || relationship.type || "Vinculo";
  }
}

function resolveRelationshipRoleLabel(relationship: UsuarioRelationship) {
  const roleKey = String(relationship.role || "").toUpperCase();
  if (roleKey && ACCOUNT_ROLE_LABELS[roleKey]) {
    return ACCOUNT_ROLE_LABELS[roleKey];
  }
  return relationship.label || "--";
}

function groupRelationshipsByTenant(relationships: UsuarioRelationship[]) {
  const groups = new Map<
    string,
    {
      key: string;
      tenantId?: string;
      tenantNome: string;
      relationships: UsuarioRelationship[];
    }
  >();

  relationships.forEach((relationship) => {
    const key =
      relationship.tenantId ||
      relationship.tenantSlug ||
      relationship.tenantNome ||
      relationship.id;
    const existing = groups.get(key);
    if (existing) {
      existing.relationships.push(relationship);
      return;
    }
    groups.set(key, {
      key,
      tenantId: relationship.tenantId,
      tenantNome: relationship.tenantNome || relationship.tenantSlug || "Racha sem identificacao",
      relationships: [relationship],
    });
  });

  return Array.from(groups.values()).sort((left, right) =>
    left.tenantNome.localeCompare(right.tenantNome, "pt-BR")
  );
}

export default function SuperAdminContasPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);

  const { usuarios, isLoading, mutateUsuarios } = useSuperAdmin();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AccountFilters>(DEFAULT_ACCOUNT_FILTERS);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<SuccessFeedback | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [relationshipsState, setRelationshipsState] = useState<UserRelationshipsResponse | null>(
    null
  );
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [pendingUnlink, setPendingUnlink] = useState<PendingUnlink | null>(null);
  const [pendingDisableUser, setPendingDisableUser] = useState<Usuario | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<Usuario | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPreview, setBulkPreview] = useState<BulkDeletePreview | null>(null);
  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("q") || "");
    setFilters(parseAccountFiltersFromSearchParams(params));
    setFiltersHydrated(true);
  }, []);

  useEffect(() => {
    if (!filtersHydrated) return;
    const url = new URL(window.location.href);
    writeAccountFiltersToSearchParams(url.searchParams, search, filters);
    const nextSearch = url.searchParams.toString();
    const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [filtersHydrated, filters, search]);

  const usuariosVisiveis = useMemo(
    () => (usuarios || []).filter((user) => !user.superadmin),
    [usuarios]
  );

  const filtered = useMemo(
    () => filterSuperAdminAccounts(usuariosVisiveis, search, filters),
    [usuariosVisiveis, search, filters]
  );

  const userById = useMemo(
    () => new Map(usuariosVisiveis.map((user) => [user.id, user])),
    [usuariosVisiveis]
  );

  const selectedUsers = useMemo(
    () => selectedIds.map((id) => userById.get(id)).filter(Boolean) as Usuario[],
    [selectedIds, userById]
  );

  const selectableVisibleIds = useMemo(() => filtered.map((user) => user.id), [filtered]);
  const allVisibleSelected =
    selectableVisibleIds.length > 0 && selectableVisibleIds.every((id) => selectedIds.includes(id));
  const fallbackBlockedPreview = selectedUsers.filter(
    (user) => getAccountDeletionBlockers(user).length > 0
  );
  const selectedBlockedPreviewCount = bulkPreview?.blockedCount ?? fallbackBlockedPreview.length;
  const selectedEligiblePreview =
    bulkPreview?.eligibleCount ?? selectedUsers.length - fallbackBlockedPreview.length;

  useEffect(() => {
    setSelectedIds((previous) => {
      const next = previous.filter((id) => userById.has(id));
      return next.length === previous.length ? previous : next;
    });
  }, [userById]);

  useEffect(() => {
    if (!selectedIds.length) {
      setBulkPreview(null);
      setBulkPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    setBulkPreviewLoading(true);

    void (async () => {
      try {
        const response = await fetch("/api/superadmin/usuarios/bulk-delete/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selectedIds }),
          signal: controller.signal,
        });

        const body = parseResponseBody(await response.text()) as BulkDeletePreview & {
          message?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(getErrorMessage(body, "Erro ao pre-validar exclusao em massa."));
        }

        if (!controller.signal.aborted) {
          setBulkPreview(body);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Erro ao pre-validar exclusao em massa.";
        setBulkPreview(null);
        showFut7Toast({
          tone: "error",
          title: "Falha na pre-validacao",
          message,
        });
      } finally {
        if (!controller.signal.aborted) {
          setBulkPreviewLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [selectedIds]);

  const activeChips = useMemo(() => getAccountFilterChips(search, filters), [filters, search]);

  const totals = useMemo(() => {
    const total = usuariosVisiveis.length || 0;
    const disabled = usuariosVisiveis.filter((user) => user.disabledAt).length;
    const noTenant = usuariosVisiveis.filter((user) => getAccountTenantCount(user) === 0).length;
    const neverLogin = usuariosVisiveis.filter((user) => !user.lastLoginAt).length;
    return {
      total,
      disabled,
      active: total - disabled,
      noTenant,
      neverLogin,
      filtered: filtered.length,
    };
  }, [filtered.length, usuariosVisiveis]);

  function updateFilter<K extends keyof AccountFilters>(key: K, value: AccountFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearChip(key: keyof AccountFilters | "search") {
    if (key === "search") {
      setSearch("");
      return;
    }
    updateFilter(key, DEFAULT_ACCOUNT_FILTERS[key]);
  }

  function clearFilters() {
    setSearch("");
    setFilters(DEFAULT_ACCOUNT_FILTERS);
  }

  function applyQuickFilter(patch: Partial<AccountFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function handleSelectAllVisible(checked: boolean) {
    if (checked) {
      setSelectedIds((previous) => Array.from(new Set([...previous, ...selectableVisibleIds])));
      return;
    }
    setSelectedIds((previous) => previous.filter((id) => !selectableVisibleIds.includes(id)));
  }

  function handleSelectUser(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  }

  async function loadRelationships(user: Usuario) {
    setSelectedUser(user);
    setRelationshipsLoading(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/superadmin/usuarios/${user.id}/relationships`, {
        cache: "no-store",
      });
      const body = parseResponseBody(await response.text()) as UserRelationshipsResponse & {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Erro ao carregar vinculos da conta."));
      }

      setRelationshipsState({
        user: body.user ?? null,
        eligibleForDeletion: body.eligibleForDeletion ?? false,
        reasons: Array.isArray(body.reasons) ? body.reasons : [],
        summary: body.summary ?? null,
        relationships: Array.isArray(body.relationships) ? body.relationships : [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar vinculos.";
      setRelationshipsState(null);
      setActionError(message);
      showFut7Toast({
        tone: "error",
        title: "Falha ao carregar vinculos",
        message,
      });
    } finally {
      setRelationshipsLoading(false);
    }
  }

  async function confirmUnlink() {
    if (!pendingUnlink) return;

    setPendingId(pendingUnlink.user.id);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/superadmin/usuarios/${pendingUnlink.user.id}/unlink-tenant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId: pendingUnlink.tenantId }),
        }
      );

      const body = parseResponseBody(await response.text()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Erro ao desvincular conta do racha."));
      }

      await mutateUsuarios();
      setSuccessFeedback({
        title: "Conta desvinculada com sucesso",
        description: `${pendingUnlink.user.email} perdeu o acesso ao racha ${pendingUnlink.tenantNome}.`,
      });
      const currentUser = pendingUnlink.user;
      setPendingUnlink(null);
      await loadRelationships(currentUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao desvincular conta.";
      setActionError(message);
      showFut7Toast({
        tone: "error",
        title: "Falha ao desvincular conta",
        message,
      });
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDisable(user: Usuario, reason: string) {
    if (!user?.id) return;

    setPendingId(user.id);
    setActionError(null);
    setPendingDisableUser(null);

    try {
      const response = await fetch(`/api/superadmin/usuarios/${user.id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason?.trim() || undefined }),
      });

      const body = parseResponseBody(await response.text());
      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Erro ao desativar conta."));
      }

      await mutateUsuarios();
      setSuccessFeedback({
        title: "Conta bloqueada com sucesso",
        description: `${user.email} nao conseguira acessar ate ser reativada.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao desativar conta.";
      setActionError(message);
      showFut7Toast({ tone: "error", title: "Falha ao bloquear conta", message });
    } finally {
      setPendingId(null);
    }
  }

  async function handleActivate(user: Usuario) {
    if (!user?.id) return;
    setPendingId(user.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/superadmin/usuarios/${user.id}/activate`, {
        method: "POST",
      });

      const body = parseResponseBody(await response.text());
      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Erro ao ativar conta."));
      }

      await mutateUsuarios();
      setSuccessFeedback({
        title: "Conta reativada com sucesso",
        description: `${user.email} voltou a ficar apta para acesso.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao ativar conta.";
      setActionError(message);
      showFut7Toast({ tone: "error", title: "Falha ao ativar conta", message });
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete(user: Usuario) {
    if (!user?.id) return;

    setPendingId(user.id);
    setActionError(null);
    setPendingDeleteUser(null);

    try {
      const response = await fetch(`/api/superadmin/usuarios/${user.id}`, {
        method: "DELETE",
      });

      const body = parseResponseBody(await response.text());
      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Erro ao excluir conta."));
      }

      await mutateUsuarios();
      setSelectedIds((previous) => previous.filter((id) => id !== user.id));
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
        setRelationshipsState(null);
      }
      setSuccessFeedback({
        title: "Conta excluida com sucesso",
        description: `${user.email} foi removida da base global.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha de rede ao excluir conta.";
      setActionError(message);
      showFut7Toast({ tone: "error", title: "Falha ao excluir conta", message });
    } finally {
      setPendingId(null);
    }
  }

  async function confirmBulkDelete() {
    if (!selectedIds.length) return;

    setPendingBulkDelete(true);
    setActionError(null);

    try {
      const response = await fetch("/api/superadmin/usuarios/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedIds }),
      });

      const body = parseResponseBody(await response.text()) as BulkDeleteResult & {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Erro ao excluir contas em massa."));
      }

      await mutateUsuarios();
      const deletedIds = new Set((body.deleted || []).map((item) => item.id));
      setSelectedIds((previous) => previous.filter((id) => !deletedIds.has(id)));
      setBulkDeleteOpen(false);

      const deletedCount = body.deletedCount ?? 0;
      const blockedCount = body.blockedCount ?? 0;

      if (deletedCount > 0) {
        setSuccessFeedback({
          title:
            deletedCount === 1
              ? "Conta excluida com sucesso"
              : `${deletedCount} contas excluidas com sucesso`,
          description: buildBulkDeleteDescription(body),
        });
        return;
      }

      const message =
        blockedCount > 0
          ? `${blockedCount} conta(s) impedida(s) por vinculos ativos.`
          : "Nenhuma conta foi excluida.";
      setActionError(message);
      showFut7Toast({
        tone: "warning",
        title: "Nenhuma conta foi excluida",
        message,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir contas em massa.";
      setActionError(message);
      showFut7Toast({ tone: "error", title: "Falha na exclusao em massa", message });
    } finally {
      setPendingBulkDelete(false);
    }
  }

  return (
    <>
      <Head>
        <title>{brandText("Contas Globais | Fut7Pro SuperAdmin")}</title>
        <meta
          name="description"
          content={brandText(
            "Controle completo das contas globais do Fut7Pro, com roles por racha, status e auditoria de acessos."
          )}
        />
      </Head>
      <div className="w-full min-h-screen">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-white">Contas Globais</h1>
            <p className="text-sm text-gray-300">
              Controle central de contas globais, vinculos por racha, status e acessos.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-gray-200 sm:grid-cols-2 xl:grid-cols-5">
            <ResumoPill label="Total" value={totals.total} />
            <ResumoPill label="Exibindo" value={totals.filtered} />
            <ResumoPill label="Ativas" value={totals.active} />
            <ResumoPill label="Sem racha" value={totals.noTenant} />
            <ResumoPill label="Nunca login" value={totals.neverLogin} />
          </div>
        </div>

        <section className="mb-4 rounded-lg border border-gray-800 bg-gray-900 p-3 shadow-lg">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex min-h-[42px] flex-1 items-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3">
              <FaSearch className="shrink-0 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail, racha, funcao, acesso ou status"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAdvancedOpen((current) => !current)}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-yellow-400/25 bg-yellow-500/10 px-3 text-sm font-bold text-yellow-200 hover:bg-yellow-500/15"
              >
                <FaFilter className="h-3.5 w-3.5" />
                Filtros avancados
                <FaChevronDown
                  className={`h-3 w-3 transition ${advancedOpen ? "rotate-180" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={activeChips.length === 0}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm font-semibold text-gray-200 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaTimes className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => applyQuickFilter(item.patch)}
                className="rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:border-yellow-400/40 hover:bg-yellow-500/10 hover:text-yellow-100"
              >
                {item.label}
              </button>
            ))}
          </div>

          {advancedOpen ? (
            <div className="mt-3 grid gap-2 border-t border-gray-800 pt-3 md:grid-cols-2 xl:grid-cols-4">
              <FilterInput
                label="Nome"
                value={filters.name}
                onChange={(value) => updateFilter("name", value)}
                placeholder="Nome ou apelido"
              />
              <FilterInput
                label="E-mail"
                value={filters.email}
                onChange={(value) => updateFilter("email", value)}
                placeholder="usuario@email.com"
              />
              <FilterInput
                label="Racha"
                value={filters.tenant}
                onChange={(value) => updateFilter("tenant", value)}
                placeholder="Nome, slug ou ID"
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(value) => updateFilter("status", value as AccountFilters["status"])}
                options={[
                  ["", "Todos"],
                  ["active", "Ativa"],
                  ["disabled", "Desativada"],
                ]}
              />
              <FilterSelect
                label="Verificacao"
                value={filters.verification}
                onChange={(value) =>
                  updateFilter("verification", value as AccountFilters["verification"])
                }
                options={[
                  ["", "Todas"],
                  ["verified", "Verificado"],
                  ["unverified", "Nao verificado"],
                ]}
              />
              <FilterSelect
                label="Tipo de acesso"
                value={filters.provider}
                onChange={(value) => updateFilter("provider", value as AccountFilters["provider"])}
                options={[
                  ["", "Todos"],
                  ["google", "Google"],
                  ["credentials", "Email/senha"],
                ]}
              />
              <FilterSelect
                label="Funcao"
                value={filters.role}
                onChange={(value) => updateFilter("role", value)}
                options={[
                  ["", "Todas"],
                  ...ACCOUNT_ROLE_OPTIONS.map(
                    (role) => [role, ACCOUNT_ROLE_LABELS[role]] as [string, string]
                  ),
                ]}
              />
              <FilterSelect
                label="Rachas vinculados"
                value={filters.tenantCount}
                onChange={(value) =>
                  updateFilter("tenantCount", value as AccountFilters["tenantCount"])
                }
                options={[
                  ["", "Todos"],
                  ["0", "0"],
                  ["1", "1"],
                  ["2plus", "2+"],
                ]}
              />
              <FilterSelect
                label="Ultimo login"
                value={filters.lastLogin}
                onChange={(value) =>
                  updateFilter("lastLogin", value as AccountFilters["lastLogin"])
                }
                options={[
                  ["", "Todos"],
                  ["today", "Hoje"],
                  ["7d", "Ultimos 7 dias"],
                  ["15d", "Ultimos 15 dias"],
                  ["30d", "Ultimos 30 dias"],
                  ["60d", "Ultimos 60 dias"],
                  ["90d", "Ultimos 90 dias"],
                  ["never", "Nunca acessou"],
                ]}
              />
              <FilterSelect
                label="Inatividade"
                value={filters.inactivity}
                onChange={(value) =>
                  updateFilter("inactivity", value as AccountFilters["inactivity"])
                }
                options={[
                  ["", "Todas"],
                  ["30", "Sem login ha 30 dias"],
                  ["60", "Sem login ha 60 dias"],
                  ["90", "Sem login ha 90 dias"],
                  ["120", "Sem login ha 120 dias"],
                ]}
              />
              <FilterInput
                label="Criada de"
                type="date"
                value={filters.createdFrom}
                onChange={(value) => updateFilter("createdFrom", value)}
              />
              <FilterInput
                label="Criada ate"
                type="date"
                value={filters.createdTo}
                onChange={(value) => updateFilter("createdTo", value)}
              />
              <FilterSelect
                label="Segmento operacional"
                value={filters.operational}
                onChange={(value) =>
                  updateFilter("operational", value as AccountFilters["operational"])
                }
                options={[
                  ["", "Todos"],
                  ["abandoned", "Potencialmente abandonadas"],
                  ["noTenant", "Sem racha"],
                  ["disabledLong", "Desativadas ha muito tempo"],
                  ["unverifiedNoLogin", "Nao verificadas sem login"],
                ]}
              />
            </div>
          ) : null}

          {activeChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.key}-${chip.label}`}
                  type="button"
                  onClick={() => clearChip(chip.key)}
                  className="inline-flex items-center gap-2 rounded-md border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-100 hover:bg-yellow-500/15"
                >
                  {chip.label}
                  <FaTimes className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {selectedIds.length > 0 ? (
          <section className="sticky top-2 z-20 mb-3 rounded-lg border border-yellow-400/25 bg-gray-950/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedIds.length} {pluralizeAccount(selectedIds.length)} selecionada
                  {selectedIds.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-gray-400">
                  {bulkPreviewLoading
                    ? "Pre-validacao server-side em andamento..."
                    : `Pre-validacao: ${selectedEligiblePreview} elegivel${
                        selectedEligiblePreview === 1 ? "" : "s"
                      } para exclusao, ${selectedBlockedPreviewCount} bloqueada${
                        selectedBlockedPreviewCount === 1 ? "" : "s"
                      } por vinculo real.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-200 hover:bg-gray-700"
                >
                  Limpar selecao
                </button>
                <button
                  type="button"
                  onClick={() => setBulkDeleteOpen(true)}
                  disabled={pendingBulkDelete}
                  className="inline-flex items-center gap-2 rounded-md border border-rose-400/25 bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaTrash className="h-3.5 w-3.5" />
                  Excluir selecionadas
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {actionError ? (
          <div className="mb-4 rounded-lg border border-red-600/60 bg-red-900/30 px-4 py-3 text-sm text-red-200 flex items-center justify-between">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-red-200 hover:text-white"
            >
              Fechar
            </button>
          </div>
        ) : null}

        <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-900 p-3 shadow-lg">
          <div className="hidden grid-cols-[32px_minmax(0,1.28fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(136px,0.55fr)_minmax(178px,0.72fr)] gap-3 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 xl:grid">
            <label className="flex items-center" title="Selecionar contas visiveis">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) => handleSelectAllVisible(event.target.checked)}
                className="h-4 w-4 rounded border-gray-700 bg-gray-950"
                aria-label="Selecionar contas visiveis"
              />
            </label>
            <span>Conta</span>
            <span>Acesso</span>
            <span>Rachas</span>
            <span>Funcoes</span>
            <span>Ultimo login</span>
            <span className="text-right">Acoes</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Carregando contas...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Nenhuma conta encontrada com os filtros atuais.
            </div>
          ) : (
            filtered.map((user) => {
              const displayName = user.nome || user.name || "Usuario";
              const nickname = user.nickname ? `(${user.nickname})` : "";
              const memberships = getAccountMemberships(user);
              const membershipsCount = getAccountTenantCount(user);
              const roleCounts = user.superadmin
                ? [{ role: "SUPERADMIN", label: "SuperAdmin", count: 1 }]
                : summarizeRoleCounts(user);
              const tenantsSummary = summarizeTenants(user);
              const statusLabel = user.disabledAt ? "Desativada" : "Ativa";
              const isBusy = pendingId === user.id;
              const canManage = !user.superadmin;
              const emailVerified = Boolean(user.emailVerifiedAt || user.emailVerified);
              const deletionBlockers = getAccountDeletionBlockers(user);

              return (
                <article
                  key={user.id}
                  className={`rounded-lg border px-3 py-3 transition-colors hover:border-yellow-400/30 hover:bg-gray-900 ${
                    selectedIds.includes(user.id)
                      ? "border-yellow-400/35 bg-yellow-500/[0.05]"
                      : "border-gray-800 bg-gray-950/45"
                  }`}
                >
                  <div className="grid gap-3 xl:grid-cols-[32px_minmax(0,1.28fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(136px,0.55fr)_minmax(178px,0.72fr)] xl:items-center">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 xl:block">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-950"
                        aria-label={`Selecionar ${user.email}`}
                      />
                      <span className="xl:hidden">Selecionar</span>
                    </label>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400">
                        <FaUserShield className="h-4 w-4 text-gray-900" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {displayName} {nickname}
                        </div>
                        <div className="break-all text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>

                    <div className="min-w-0 text-sm text-gray-300">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 xl:hidden">
                        Acesso
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200">
                          {resolveProvider(user.authProvider)}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            emailVerified
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-yellow-500/15 text-yellow-200"
                          }`}
                        >
                          {emailVerified ? "Verificado" : "Nao verificado"}
                        </span>
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-semibold ${
                            user.disabledAt
                              ? "bg-red-500/15 text-red-200"
                              : "bg-green-500/15 text-green-200"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 text-sm text-gray-300">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 xl:hidden">
                        Rachas
                      </p>
                      <div className="font-semibold text-white">{membershipsCount}</div>
                      <div className="truncate text-xs text-gray-400">{tenantsSummary}</div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 xl:hidden">
                        Funcoes
                      </p>
                      <div className="flex max-h-16 flex-wrap gap-1.5 overflow-hidden">
                        {roleCounts.length > 0 ? (
                          roleCounts.map((item) => (
                            <span
                              key={item.role}
                              className="rounded-md border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-200"
                            >
                              {item.label}
                              {item.count > 1 ? ` (${item.count})` : ""}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Sem vinculo</span>
                        )}
                      </div>
                      {deletionBlockers.length ? (
                        <p className="mt-1 truncate text-[11px] text-amber-200/80">
                          Protegida: {deletionBlockers.join(", ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-sm text-gray-300">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 xl:hidden">
                        Ultimo login
                      </p>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nunca acessou"}
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                      <button
                        onClick={() => void loadRelationships(user)}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-blue-400/20 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Ver vinculos"
                        disabled={isBusy}
                        type="button"
                      >
                        <FaEye className="h-3.5 w-3.5" /> Vinculos
                      </button>
                      <Link
                        href={`/superadmin/contas/${user.id}`}
                        className="inline-flex min-h-[32px] items-center rounded-md border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/20"
                        title="Detalhes da conta"
                      >
                        Detalhes
                      </Link>
                      {canManage &&
                        (user.disabledAt ? (
                          <button
                            onClick={() => void handleActivate(user)}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-green-400/20 bg-green-500/10 px-2.5 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Ativar conta"
                            disabled={isBusy}
                            type="button"
                          >
                            <FaCheck className="h-3.5 w-3.5" /> Ativar
                          </button>
                        ) : (
                          <button
                            onClick={() => setPendingDisableUser(user)}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-red-400/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Desativar conta"
                            disabled={isBusy}
                            type="button"
                          >
                            <FaBan className="h-3.5 w-3.5" /> Bloquear
                          </button>
                        ))}
                      {canManage ? (
                        <button
                          onClick={() => setPendingDeleteUser(user)}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-rose-400/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Excluir conta"
                          disabled={isBusy}
                          type="button"
                        >
                          <FaTrash className="h-3.5 w-3.5" /> Excluir
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {selectedUser ? (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/60"
            onClick={() => {
              setSelectedUser(null);
              setRelationshipsState(null);
            }}
          >
            <div
              className="w-full max-w-4xl rounded-xl bg-zinc-900 p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Vinculos do usuario</h3>
                  <p className="text-sm text-gray-400">
                    {selectedUser.nome || selectedUser.name} • {selectedUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setRelationshipsState(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <ResumoPill
                  label="Rachas"
                  value={
                    relationshipsState?.summary?.tenantCount ?? getAccountTenantCount(selectedUser)
                  }
                />
                <ResumoPill
                  label="Memberships"
                  value={
                    relationshipsState?.summary?.membershipCount ??
                    (selectedUser.memberships || []).length
                  }
                />
                <ResumoPill
                  label="Atletas"
                  value={relationshipsState?.summary?.athleteCount ?? 0}
                />
                <ResumoPill label="Admins" value={relationshipsState?.summary?.adminCount ?? 0} />
              </div>

              {relationshipsState?.reasons && relationshipsState.reasons.length > 0 ? (
                <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-200/80">
                    Bloqueios para exclusao global
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-amber-50">
                    {relationshipsState.reasons.map((reason, index) => (
                      <li key={`${reason.code || "reason"}-${index}`}>• {reason.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="max-h-[420px] space-y-3 overflow-y-auto">
                {relationshipsLoading ? (
                  <div className="text-sm text-gray-400">Carregando vinculos reais...</div>
                ) : !relationshipsState || (relationshipsState.relationships || []).length === 0 ? (
                  <div className="text-sm text-gray-400">Nenhum vinculo encontrado.</div>
                ) : (
                  groupRelationshipsByTenant(relationshipsState.relationships || []).map(
                    (group) => {
                      const groupBlockReason = group.relationships.find(
                        (relationship) => relationship.unlinkBlockedReason
                      )?.unlinkBlockedReason;
                      const canUnlink = group.relationships.some(
                        (relationship) => relationship.unlinkable
                      );

                      return (
                        <section
                          key={group.key}
                          className="rounded-lg border border-gray-700 bg-zinc-950/60 p-4"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-white">
                                {group.tenantNome}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {group.relationships.length} vinculo
                                {group.relationships.length === 1 ? "" : "s"} encontrado
                                {group.relationships.length === 1 ? "" : "s"}.
                              </p>
                            </div>
                            <div className="flex flex-col items-start gap-2 lg:items-end">
                              {canUnlink && group.tenantId ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingUnlink({
                                      user: selectedUser,
                                      tenantId: group.tenantId || "",
                                      tenantNome: group.tenantNome,
                                    })
                                  }
                                  disabled={pendingId === selectedUser.id}
                                  className="inline-flex min-h-[32px] items-center gap-2 rounded-md border border-rose-400/25 bg-rose-500/12 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                  Desvincular deste racha
                                </button>
                              ) : groupBlockReason ? (
                                <p className="max-w-md text-right text-xs text-amber-200/80">
                                  {groupBlockReason}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {group.relationships.map((relationship) => (
                              <div
                                key={relationship.id}
                                className="rounded-lg border border-gray-800 bg-zinc-900/80 px-3 py-3"
                              >
                                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-md border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">
                                        {resolveRelationshipTypeLabel(relationship)}
                                      </span>
                                      {relationship.blocksDeletion ? (
                                        <span className="rounded-md border border-amber-400/20 bg-amber-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200">
                                          Bloqueia exclusao global
                                        </span>
                                      ) : null}
                                      {relationship.unlinkRequiresTransfer ? (
                                        <span className="rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-200">
                                          Exige governanca ativa
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-white">
                                      {resolveRelationshipRoleLabel(relationship)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                      Status: {relationship.status || "--"}
                                    </p>
                                  </div>
                                  {relationship.unlinkBlockedReason ? (
                                    <p className="max-w-sm text-xs text-amber-200/80">
                                      {relationship.unlinkBlockedReason}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    }
                  )
                )}
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setRelationshipsState(null);
                  }}
                  className="rounded-lg bg-zinc-700 px-4 py-2 text-white transition hover:bg-zinc-800"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <Fut7PromptDialog
          open={Boolean(pendingDisableUser)}
          title={`Desativar ${pendingDisableUser?.email || "conta global"}?`}
          eyebrow="Controle de acesso"
          description="A conta global sera bloqueada para novos acessos. Informe um motivo para facilitar auditoria e suporte."
          label="Motivo do bloqueio"
          placeholder="Ex.: solicitacao do cliente, suspeita de acesso indevido, conta duplicada..."
          multiline
          confirmLabel="Desativar conta"
          cancelLabel="Cancelar"
          loading={pendingId === pendingDisableUser?.id}
          onClose={() => setPendingDisableUser(null)}
          onConfirm={(reason) => {
            if (pendingDisableUser) void confirmDisable(pendingDisableUser, reason);
          }}
        />
        <Fut7DestructiveDialog
          open={Boolean(pendingDeleteUser)}
          title={`Excluir ${pendingDeleteUser?.email || "conta global"}?`}
          description="Esta e uma exclusao permanente da conta global. O backend impede remocao quando ainda ha vinculo com racha, atleta ou admin."
          confirmLabel="Excluir conta"
          cancelLabel="Cancelar"
          confirmationText={getAccountDeletionConfirmation(pendingDeleteUser)}
          confirmationLabel="Digite o identificador abaixo para confirmar"
          loading={pendingId === pendingDeleteUser?.id}
          impactItems={[
            "A conta global sera removida definitivamente somente se estiver elegivel.",
            "Contas com racha, membership, atleta ou admin vinculado sao bloqueadas pelo backend.",
            "Essa acao nao deve substituir bloqueio temporario de acesso.",
          ]}
          onClose={() => setPendingDeleteUser(null)}
          onConfirm={() => {
            if (pendingDeleteUser) void confirmDelete(pendingDeleteUser);
          }}
        />
        <Fut7DestructiveDialog
          open={bulkDeleteOpen}
          title={`Excluir ${selectedIds.length} conta(s) global(is)?`}
          description="Esta acao e sensivel. O backend exclui somente contas elegiveis e devolve quais foram impedidas por vinculos operacionais."
          confirmLabel="Excluir contas"
          cancelLabel="Cancelar"
          confirmationText="EXCLUIR CONTAS GLOBAIS"
          confirmationLabel="Digite a frase abaixo para confirmar"
          loading={pendingBulkDelete}
          impactItems={[
            `${selectedIds.length} conta(s) selecionada(s).`,
            bulkPreviewLoading
              ? "Pre-validacao server-side em andamento."
              : `${selectedEligiblePreview} conta(s) elegivel(is) pela mesma regra do backend.`,
            bulkPreviewLoading
              ? "A lista final sera atualizada assim que a analise terminar."
              : `${selectedBlockedPreviewCount} conta(s) bloqueada(s) por vinculo real antes da exclusao.`,
            "A validacao definitiva acontece no backend antes de qualquer exclusao.",
          ]}
          onClose={() => setBulkDeleteOpen(false)}
          onConfirm={() => void confirmBulkDelete()}
        />
        <Fut7DestructiveDialog
          open={Boolean(pendingUnlink)}
          title={`Desvincular ${pendingUnlink?.user.email || "conta global"} de ${pendingUnlink?.tenantNome || "racha"}?`}
          description="A conta global continuara existindo no Fut7Pro, mas perdera o acesso ao racha, aos papeis administrativos e ao vinculo de atleta desse contexto."
          confirmLabel="Desvincular conta"
          cancelLabel="Cancelar"
          confirmationText="DESVINCULAR CONTA DO RACHA"
          confirmationLabel="Digite a frase abaixo para confirmar"
          loading={pendingId === pendingUnlink?.user.id}
          impactItems={[
            "A conta perde o acesso ao painel admin e ao contexto publico desse racha.",
            "Todos os vinculos daquele racha sao removidos da conta global selecionada.",
            "Rachas reais nao podem ficar sem governanca ativa depois da operacao.",
          ]}
          onClose={() => setPendingUnlink(null)}
          onConfirm={() => void confirmUnlink()}
        />
        <Fut7SuccessDialog
          open={Boolean(successFeedback)}
          title={successFeedback?.title || ""}
          description={successFeedback?.description}
          primaryLabel="Fechar"
          onClose={() => setSuccessFeedback(null)}
        />
      </div>
    </>
  );
}

function ResumoPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-[38px] items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[38px] w-full rounded-lg border border-gray-800 bg-gray-950 px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-yellow-400/50"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[38px] w-full rounded-lg border border-gray-800 bg-gray-950 px-3 text-sm text-white outline-none focus:border-yellow-400/50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "all"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
