"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaBan, FaCheck, FaEye, FaSearch, FaTrash, FaUsers, FaUserShield } from "react-icons/fa";
import { useBranding } from "@/hooks/useBranding";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Fut7DestructiveDialog, Fut7PromptDialog } from "@/components/ui/feedback";
import type { Usuario, UsuarioMembership } from "@/types/superadmin";

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-Presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ADMIN: "Admin",
  SUPERADMIN: "SuperAdmin",
  ATLETA: "Atleta",
};

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

function summarizeRoleCounts(memberships?: UsuarioMembership[]) {
  if (!memberships || memberships.length === 0) return [];
  const counter = new Map<string, number>();
  memberships.forEach((membership) => {
    const key = String(membership.role || "ATLETA").toUpperCase();
    counter.set(key, (counter.get(key) || 0) + 1);
  });
  return Array.from(counter.entries()).map(([role, count]) => ({
    role,
    label: ROLE_LABELS[role] || role,
    count,
  }));
}

function summarizeTenants(memberships?: UsuarioMembership[]) {
  if (!memberships || memberships.length === 0) return "--";
  const names = Array.from(
    new Set(
      memberships
        .map((membership) => membership.tenantNome || membership.tenantSlug || membership.tenantId)
        .filter(Boolean)
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

export default function SuperAdminContasPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);

  const { usuarios, isLoading, refreshAll } = useSuperAdmin();
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [pendingDisableUser, setPendingDisableUser] = useState<Usuario | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<Usuario | null>(null);

  const usuariosVisiveis = useMemo(
    () => (usuarios || []).filter((user) => !user.superadmin),
    [usuarios]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return usuariosVisiveis;
    return usuariosVisiveis.filter((user) => {
      const name = (user.nome || user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [usuariosVisiveis, search]);

  const totals = useMemo(() => {
    const total = usuariosVisiveis.length || 0;
    const disabled = usuariosVisiveis.filter((user) => user.disabledAt).length;
    return { total, disabled, active: total - disabled };
  }, [usuariosVisiveis]);

  async function handleDisable(user: Usuario) {
    if (!user?.id) return;
    setPendingDisableUser(user);
  }

  async function confirmDisable(user: Usuario, reason: string) {
    if (!user?.id) return;

    setPendingId(user.id);
    setActionError(null);
    setActionSuccess(null);
    setPendingDisableUser(null);

    const response = await fetch(`/api/superadmin/usuarios/${user.id}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason?.trim() || undefined }),
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || text || "Erro ao desativar conta.";
      setPendingId(null);
      setActionError(message);
      return;
    }

    await refreshAll();
    setActionSuccess("Conta desativada com sucesso.");
    setPendingId(null);
  }

  async function handleActivate(user: Usuario) {
    if (!user?.id) return;
    setPendingId(user.id);
    setActionError(null);
    setActionSuccess(null);

    const response = await fetch(`/api/superadmin/usuarios/${user.id}/activate`, {
      method: "POST",
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || text || "Erro ao ativar conta.";
      setPendingId(null);
      setActionError(message);
      return;
    }

    await refreshAll();
    setActionSuccess("Conta reativada com sucesso.");
    setPendingId(null);
  }

  async function handleDelete(user: Usuario) {
    if (!user?.id) return;
    setPendingDeleteUser(user);
  }

  async function confirmDelete(user: Usuario) {
    if (!user?.id) return;

    setPendingId(user.id);
    setActionError(null);
    setActionSuccess(null);
    setPendingDeleteUser(null);

    try {
      const response = await fetch(`/api/superadmin/usuarios/${user.id}`, {
        method: "DELETE",
      });

      const text = await response.text();
      let body: any = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }

      if (!response.ok) {
        const message = body?.message || body?.error || text || "Erro ao excluir conta.";
        setActionError(message);
        return;
      }

      await refreshAll();
      setActionSuccess("Conta excluida com sucesso.");
    } catch {
      setActionError("Falha de rede ao excluir conta.");
    } finally {
      setPendingId(null);
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
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">Contas Globais</h1>
            <p className="text-sm text-gray-300">
              Controle central de todas as contas globais, roles por racha e status de acesso.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou e-mail"
                className="bg-transparent text-sm text-white outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200">
              <FaUsers className="text-yellow-400" />
              <span>Total: {totals.total}</span>
              <span className="text-gray-500">|</span>
              <span>Ativas: {totals.active}</span>
              <span className="text-gray-500">|</span>
              <span>Desativadas: {totals.disabled}</span>
            </div>
          </div>
        </div>

        {actionError && (
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
        )}
        {actionSuccess && (
          <div className="mb-4 rounded-lg border border-emerald-600/60 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200 flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-200 hover:text-white"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-900 p-3 shadow-lg">
          <div className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)_minmax(0,0.85fr)_minmax(0,1.05fr)_minmax(145px,0.6fr)_minmax(190px,0.75fr)] gap-3 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 xl:grid">
            <span>Conta</span>
            <span>Acesso</span>
            <span>Rachas</span>
            <span>Funções</span>
            <span>Último login</span>
            <span className="text-right">Ações</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Carregando contas...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Nenhuma conta encontrada.
            </div>
          ) : (
            filtered.map((user) => {
              const displayName = user.nome || user.name || "Usuario";
              const nickname = user.nickname ? `(${user.nickname})` : "";
              const memberships = user.memberships || [];
              const membershipsCount = memberships.length;
              const roleCounts = user.superadmin
                ? [{ role: "SUPERADMIN", label: "SuperAdmin", count: 1 }]
                : summarizeRoleCounts(memberships);
              const tenantsSummary = summarizeTenants(memberships);
              const statusLabel = user.disabledAt ? "Desativada" : "Ativa";
              const isBusy = pendingId === user.id;
              const lastLogin = user.lastLoginAt || user.atualizadoEm || user.criadoEm;
              const canManage = !user.superadmin;
              const emailVerified = Boolean(user.emailVerifiedAt || user.emailVerified);

              return (
                <article
                  key={user.id}
                  className="rounded-lg border border-gray-800 bg-gray-950/45 px-3 py-3 transition-colors hover:border-yellow-400/30 hover:bg-gray-900"
                >
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)_minmax(0,0.85fr)_minmax(0,1.05fr)_minmax(145px,0.6fr)_minmax(190px,0.75fr)] xl:items-center">
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
                          {emailVerified ? "Verificado" : "Não verificado"}
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
                        Funções
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
                          <span className="text-xs text-gray-400">Sem vínculo</span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-300">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 xl:hidden">
                        Último login
                      </p>
                      {formatDate(lastLogin)}
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-blue-400/20 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Ver vinculos"
                        disabled={isBusy}
                        type="button"
                      >
                        <FaEye className="h-3.5 w-3.5" /> Vínculos
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
                            onClick={() => handleActivate(user)}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-green-400/20 bg-green-500/10 px-2.5 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Ativar conta"
                            disabled={isBusy}
                            type="button"
                          >
                            <FaCheck className="h-3.5 w-3.5" /> Ativar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisable(user)}
                            className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-red-400/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Desativar conta"
                            disabled={isBusy}
                            type="button"
                          >
                            <FaBan className="h-3.5 w-3.5" /> Bloquear
                          </button>
                        ))}
                      {canManage && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-rose-400/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Excluir conta"
                          disabled={isBusy}
                          type="button"
                        >
                          <FaTrash className="h-3.5 w-3.5" /> Excluir
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {selectedUser && (
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/60"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="w-full max-w-2xl bg-zinc-900 rounded-xl shadow-xl p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Vinculos do usuario</h3>
                  <p className="text-sm text-gray-400">
                    {selectedUser.nome || selectedUser.name} • {selectedUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                {(selectedUser.memberships || []).length === 0 ? (
                  <div className="text-sm text-gray-400">Nenhum vinculo encontrado.</div>
                ) : (
                  (selectedUser.memberships || []).map((membership) => (
                    <div
                      key={membership.id || `${membership.tenantId}-${membership.role}`}
                      className="flex items-center justify-between border border-gray-700 rounded-lg px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {membership.tenantNome || membership.tenantSlug || "Racha"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {ROLE_LABELS[String(membership.role || "ATLETA").toUpperCase()] ||
                            membership.role ||
                            "Atleta"}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Status: {membership.status || "--"}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
        <Fut7PromptDialog
          open={Boolean(pendingDisableUser)}
          title={`Desativar ${pendingDisableUser?.email || "conta global"}?`}
          eyebrow="Controle de acesso"
          description="A conta global será bloqueada para novos acessos. Informe um motivo para facilitar auditoria e suporte."
          label="Motivo do bloqueio"
          placeholder="Ex.: solicitação do cliente, suspeita de acesso indevido, conta duplicada..."
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
          description="Esta é uma exclusão permanente da conta global. Use somente quando houver certeza operacional e respaldo administrativo."
          confirmLabel="Excluir conta"
          cancelLabel="Cancelar"
          confirmationText={getAccountDeletionConfirmation(pendingDeleteUser)}
          confirmationLabel="Digite o identificador abaixo para confirmar"
          loading={pendingId === pendingDeleteUser?.id}
          impactItems={[
            "A conta global será removida definitivamente.",
            "Vínculos administrativos e de atleta associados podem ser impactados.",
            "Essa ação não deve substituir bloqueio temporário de acesso.",
          ]}
          onClose={() => setPendingDeleteUser(null)}
          onConfirm={() => {
            if (pendingDeleteUser) void confirmDelete(pendingDeleteUser);
          }}
        />
      </div>
    </>
  );
}
