"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaKey, FaUserShield } from "react-icons/fa";
import { Role } from "@/common/enums";

export interface Admin {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  superadmin: boolean;
  active: boolean;
  status?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  permissions: string[];
  tenantId?: string;
  tenantNome?: string;
  tenantSlug?: string;
}

interface AdminsTableProps {
  admins?: Admin[];
  isLoading?: boolean;
  pendingId?: string | null;
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
  onView?: (admin: Admin) => void;
  onResetPassword?: (admin: Admin) => void;
}

const roleLabels: Record<string, string> = {
  ATLETA: "Atleta",
  ADMIN: "Admin",
  SUPERADMIN: "SuperAdmin",
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-Presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  GERENTE: "Gerente",
  SUPORTE: "Suporte",
  AUDITORIA: "Auditoria",
  FINANCEIRO: "Financeiro",
  MARKETING: "Marketing",
};

export default function AdminsTable({
  admins = [],
  isLoading = false,
  pendingId,
  onEdit,
  onDelete,
  onView,
  onResetPassword,
}: AdminsTableProps) {
  const [adminsState, setAdminsState] = useState<Admin[]>(admins);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);

  useEffect(() => {
    setAdminsState(admins);
    setLoading(isLoading);
  }, [admins, isLoading]);

  const handleAction = (action: string, admin: Admin) => {
    switch (action) {
      case "edit":
        onEdit?.(admin);
        break;
      case "delete":
        onDelete?.(admin);
        break;
      case "view":
        onView?.(admin);
        break;
      case "reset-password":
        onResetPassword?.(admin);
        break;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-3 shadow-lg">
      <div className="hidden grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.9fr)_minmax(180px,0.75fr)] gap-3 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 lg:grid">
        <span>Administrador</span>
        <span>Racha</span>
        <span>Cargo</span>
        <span>Operação</span>
        <span className="text-right">Ações</span>
      </div>

      {adminsState.map((admin) => {
        const isBusy = pendingId === admin.id || pendingId === admin.userId;
        const isLocked = admin.superadmin;
        const roleKey = String(admin.role || "").toUpperCase();
        const isVitrine = admin.tenantSlug?.toLowerCase() === "vitrine";
        const roleBadgeClass =
          roleKey === "SUPERADMIN"
            ? "bg-red-100 text-red-800"
            : roleKey === "PRESIDENTE"
              ? "bg-yellow-100 text-yellow-800"
              : roleKey === "VICE_PRESIDENTE"
                ? "bg-blue-100 text-blue-800"
                : roleKey === "DIRETOR_FUTEBOL" || roleKey === "DIRETOR_FINANCEIRO"
                  ? "bg-emerald-100 text-emerald-800"
                  : roleKey === Role.GERENTE
                    ? "bg-blue-100 text-blue-800"
                    : roleKey === Role.SUPORTE
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800";

        return (
          <article
            key={admin.id}
            className="rounded-2xl border border-gray-800 bg-gray-950/45 p-4 transition-colors hover:border-yellow-400/30 hover:bg-gray-900"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.9fr)_minmax(180px,0.75fr)] lg:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400">
                  <FaUserShield className="h-4 w-4 text-gray-900" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{admin.name}</div>
                  <div className="break-all text-xs text-gray-400">{admin.email}</div>
                  {admin.superadmin && (
                    <div className="mt-1 text-xs font-semibold text-yellow-400">SuperAdmin</div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 lg:hidden">
                  Racha
                </p>
                <p className="truncate text-sm text-gray-200">
                  {admin.tenantNome || admin.tenantSlug || "--"}
                </p>
                {admin.tenantSlug ? (
                  <p className="truncate text-xs text-gray-500">@{admin.tenantSlug}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 lg:hidden">
                  Cargo
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass}`}
                >
                  {roleLabels[roleKey] || admin.role}
                </span>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold lg:ml-0 lg:block lg:w-fit ${
                    admin.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {admin.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 lg:hidden">
                  Operação
                </p>
                <button
                  onClick={() => setShowPermissions(showPermissions === admin.id ? null : admin.id)}
                  className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
                  type="button"
                >
                  {admin.permissions.length} permissões
                </button>
                <p className="text-xs text-gray-400">Criado em {formatDate(admin.createdAt)}</p>
              </div>

              <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                <button
                  onClick={() => handleAction("view", admin)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-400/20 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Ver detalhes"
                  disabled={isBusy}
                  type="button"
                >
                  <FaEye className="h-3.5 w-3.5" /> Detalhes
                </button>
                <button
                  onClick={() => handleAction("edit", admin)}
                  className="inline-flex items-center gap-1 rounded-lg border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Editar"
                  disabled={isBusy}
                  type="button"
                >
                  <FaEdit className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleAction("reset-password", admin)}
                  className="inline-flex items-center gap-1 rounded-lg border border-purple-400/20 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Resetar senha"
                  disabled={isBusy || isLocked}
                  type="button"
                >
                  <FaKey className="h-3.5 w-3.5" /> Senha
                </button>
                {!admin.superadmin && (
                  <button
                    onClick={() => handleAction("delete", admin)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    title={isVitrine ? "Racha vitrine nao pode ser alterado." : "Remover do racha"}
                    disabled={isBusy || isVitrine}
                    type="button"
                  >
                    <FaTrash className="h-3.5 w-3.5" /> Remover
                  </button>
                )}
              </div>
            </div>

            {showPermissions === admin.id && (
              <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/80 p-4">
                <div className="mb-2 text-sm font-semibold text-white">
                  Permissões de {admin.name}
                </div>
                <div className="grid max-h-52 gap-2 overflow-y-auto text-xs text-gray-300 sm:grid-cols-2 xl:grid-cols-3">
                  {admin.permissions.length ? (
                    admin.permissions.map((permission) => (
                      <div key={permission} className="rounded-lg bg-gray-950/60 px-3 py-2">
                        {permission}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-gray-950/60 px-3 py-2 text-gray-400">
                      Sem matriz oficial para este cargo.
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
