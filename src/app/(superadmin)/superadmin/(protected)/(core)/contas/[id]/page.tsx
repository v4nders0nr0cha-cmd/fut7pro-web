"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { FaArrowLeft, FaBan, FaCheck, FaTrash, FaUserShield } from "react-icons/fa";
import { useBranding } from "@/hooks/useBranding";
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

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Falha ao carregar conta");
  }
  return response.json();
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

export default function SuperAdminContaDetalhePage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const [pendingAction, setPendingAction] = useState<"activate" | "disable" | "delete" | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<Usuario>(id ? `/api/superadmin/usuarios/${id}` : null, fetcher);

  async function handleDisable() {
    if (!user?.id) return;
    const reason = window.prompt(
      "Motivo do bloqueio (opcional). Esta conta global sera desativada:"
    );
    setPendingAction("disable");
    setActionError(null);
    const response = await fetch(`/api/superadmin/usuarios/${user.id}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason?.trim() || undefined }),
    });
    if (!response.ok) {
      const text = await response.text();
      setActionError(text || "Falha ao desativar conta.");
      setPendingAction(null);
      return;
    }
    await mutate();
    setPendingAction(null);
  }

  async function handleActivate() {
    if (!user?.id) return;
    setPendingAction("activate");
    setActionError(null);
    const response = await fetch(`/api/superadmin/usuarios/${user.id}/activate`, {
      method: "POST",
    });
    if (!response.ok) {
      const text = await response.text();
      setActionError(text || "Falha ao ativar conta.");
      setPendingAction(null);
      return;
    }
    await mutate();
    setPendingAction(null);
  }

  async function handleDelete() {
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

    setPendingAction("delete");
    setActionError(null);
    const response = await fetch(`/api/superadmin/usuarios/${user.id}`, { method: "DELETE" });
    if (!response.ok) {
      const text = await response.text();
      setActionError(text || "Falha ao excluir conta.");
      setPendingAction(null);
      return;
    }
    router.push("/superadmin/contas");
    router.refresh();
  }

  return (
    <>
      <Head>
        <title>{brandText("Detalhes da Conta Global | Fut7Pro SuperAdmin")}</title>
        <meta
          name="description"
          content={brandText(
            "Detalhes completos da conta global, vinculos por racha e status de acesso no painel SuperAdmin."
          )}
        />
      </Head>
      <div className="w-full min-h-screen">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/superadmin/contas"
              className="inline-flex items-center text-sm text-gray-400 hover:text-white"
            >
              <FaArrowLeft className="mr-2" /> Voltar
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-white">Detalhes da conta</h1>
          </div>
          {user && !user.superadmin && (
            <div className="flex gap-2">
              {user.disabledAt ? (
                <button
                  onClick={handleActivate}
                  disabled={pendingAction !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                >
                  <FaCheck /> Ativar conta
                </button>
              ) : (
                <button
                  onClick={handleDisable}
                  disabled={pendingAction !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                >
                  <FaBan /> Desativar conta
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={pendingAction !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-700/90 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                <FaTrash /> Excluir conta
              </button>
            </div>
          )}
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-600/60 bg-red-900/30 px-4 py-3 text-sm text-red-200">
            {actionError}
          </div>
        )}

        {isLoading && <div className="text-gray-300">Carregando conta...</div>}
        {error && <div className="text-red-400">Falha ao carregar dados.</div>}

        {user && (
          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center">
                  <FaUserShield className="h-5 w-5 text-gray-900" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {user.nome || user.name || "Usuario"}
                  </div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <div>
                  <span className="text-gray-400">Apelido:</span> {user.nickname || "--"}
                </div>
                <div>
                  <span className="text-gray-400">Provider:</span>{" "}
                  {resolveProvider(user.authProvider)}
                </div>
                <div>
                  <span className="text-gray-400">Verificacao:</span>{" "}
                  {user.emailVerifiedAt ? "Verificado" : "Nao verificado"}
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>{" "}
                  {user.disabledAt ? "Desativada" : "Ativa"}
                </div>
                {user.disabledAt && (
                  <div>
                    <span className="text-gray-400">Motivo:</span> {user.disabledReason || "--"}
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Ultimo login:</span>{" "}
                  {formatDate(user.lastLoginAt)}
                </div>
                <div>
                  <span className="text-gray-400">Criado em:</span> {formatDate(user.criadoEm)}
                </div>
                <div>
                  <span className="text-gray-400">Atualizado em:</span>{" "}
                  {formatDate(user.atualizadoEm)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Resumo de vinculos</h2>
                <div className="text-sm text-gray-300">
                  {user.memberships?.length || 0} rachas ·{" "}
                  {user.superadmin ? "SuperAdmin" : summarizeRoles(user.memberships)}
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Vinculos por racha</h2>
                {(user.memberships || []).length === 0 ? (
                  <div className="text-sm text-gray-400">Nenhum vinculo encontrado.</div>
                ) : (
                  <div className="space-y-3">
                    {(user.memberships || []).map((membership) => (
                      <div
                        key={membership.id || `${membership.tenantId}-${membership.role}`}
                        className="flex flex-col gap-2 rounded-lg border border-gray-700 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {membership.tenantNome || membership.tenantSlug || "Racha"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {membership.tenantSlug || "--"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-300">
                          {ROLE_LABELS[String(membership.role || "ATLETA").toUpperCase()] ||
                            membership.role ||
                            "Atleta"}
                        </div>
                        <div className="text-xs text-gray-300">
                          Status: {membership.status || "--"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
