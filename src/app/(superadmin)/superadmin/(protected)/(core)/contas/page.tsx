"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaBan, FaCheck, FaEye, FaSearch, FaTrash, FaUsers, FaUserShield } from "react-icons/fa";
import { useBranding } from "@/hooks/useBranding";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
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

function summarizeRoles(memberships?: UsuarioMembership[]) {
  if (!memberships || memberships.length === 0) return "--";
  const counter = new Map<string, number>();
  memberships.forEach((membership) => {
    const key = String(membership.role || "ATLETA").toUpperCase();
    counter.set(key, (counter.get(key) || 0) + 1);
  });
  return Array.from(counter.entries())
    .map(([role, count]) => `${ROLE_LABELS[role] || role} (${count})`)
    .join(", ");
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
    const reason = window.prompt(
      "Motivo do bloqueio (opcional). Esta conta global sera desativada:"
    );

    setPendingId(user.id);
    setActionError(null);
    setActionSuccess(null);

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

    const email = String(user.email || "")
      .trim()
      .toLowerCase();
    const confirmation = window.prompt(
      `Exclusao permanente.\nDigite o e-mail da conta para confirmar:\n${email}`
    );
    if (!confirmation) return;
    if (confirmation.trim().toLowerCase() !== email) {
      setActionError("Confirmacao invalida. Exclusao cancelada.");
      return;
    }

    setPendingId(user.id);
    setActionError(null);
    setActionSuccess(null);

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
      setPendingId(null);
      setActionError(message);
      return;
    }

    await refreshAll();
    setActionSuccess("Conta excluida com sucesso.");
    setPendingId(null);
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

        <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm text-left">
              <thead className="bg-gray-800 text-xs uppercase text-gray-300">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Conta</th>
                  <th className="px-4 py-3 sm:px-6">Provider</th>
                  <th className="px-4 py-3 sm:px-6">Verificacao</th>
                  <th className="px-4 py-3 sm:px-6">Status</th>
                  <th className="px-4 py-3 sm:px-6">Rachas</th>
                  <th className="px-4 py-3 sm:px-6">Funcoes</th>
                  <th className="px-4 py-3 sm:px-6">Ultimo login</th>
                  <th className="px-4 py-3 text-right sm:px-6">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-gray-400">
                      Carregando contas...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-6 text-center text-gray-400">
                      Nenhuma conta encontrada.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const displayName = user.nome || user.name || "Usuario";
                    const nickname = user.nickname ? `(${user.nickname})` : "";
                    const memberships = user.memberships || [];
                    const membershipsCount = memberships.length;
                    const rolesSummary = user.superadmin
                      ? "SuperAdmin"
                      : summarizeRoles(memberships);
                    const statusLabel = user.disabledAt ? "Desativada" : "Ativa";
                    const isBusy = pendingId === user.id;
                    const lastLogin = user.lastLoginAt || user.atualizadoEm || user.criadoEm;
                    const canManage = !user.superadmin;

                    return (
                      <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-yellow-400 flex items-center justify-center">
                              <FaUserShield className="h-4 w-4 text-gray-900" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {displayName} {nickname}
                              </div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 sm:px-6">
                          {resolveProvider(user.authProvider)}
                        </td>
                        <td className="px-4 py-3 text-gray-300 sm:px-6">
                          {user.emailVerifiedAt ? "Verificado" : "Nao verificado"}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.disabledAt
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 sm:px-6">{membershipsCount}</td>
                        <td className="px-4 py-3 text-gray-300 sm:px-6">
                          <span className="line-clamp-2 max-w-[280px]">{rolesSummary}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 sm:px-6">{formatDate(lastLogin)}</td>
                        <td className="px-4 py-3 text-right sm:px-6">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Ver vinculos"
                              disabled={isBusy}
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/superadmin/contas/${user.id}`}
                              className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Detalhes da conta"
                            >
                              Detalhes
                            </Link>
                            {canManage &&
                              (user.disabledAt ? (
                                <button
                                  onClick={() => handleActivate(user)}
                                  className="text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Ativar conta"
                                  disabled={isBusy}
                                >
                                  <FaCheck className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDisable(user)}
                                  className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Desativar conta"
                                  disabled={isBusy}
                                >
                                  <FaBan className="h-4 w-4" />
                                </button>
                              ))}
                            {canManage && (
                              <button
                                onClick={() => handleDelete(user)}
                                className="text-rose-400 hover:text-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Excluir conta"
                                disabled={isBusy}
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
      </div>
    </>
  );
}
