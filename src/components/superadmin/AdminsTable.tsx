"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaKey, FaUserShield } from "react-icons/fa";
import { Role, Permission } from "@/common/enums";

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
  permissions: Permission[];
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
  ATHLETE: "Athlete",
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

const permissionLabels: Record<Permission, string> = {
  RACHA_CREATE: "Criar Racha",
  RACHA_READ: "Ver Racha",
  RACHA_UPDATE: "Editar Racha",
  RACHA_DELETE: "Deletar Racha",
  RACHA_MANAGE_ADMINS: "Gerenciar Admins",
  USER_CREATE: "Criar Usuario",
  USER_READ: "Ver Usuario",
  USER_UPDATE: "Editar Usuario",
  USER_DELETE: "Deletar Usuario",
  USER_MANAGE_ROLES: "Gerenciar Roles",
  FINANCE_READ: "Ver Financeiro",
  FINANCE_CREATE: "Criar Financeiro",
  FINANCE_UPDATE: "Editar Financeiro",
  FINANCE_DELETE: "Deletar Financeiro",
  FINANCE_APPROVE: "Aprovar Financeiro",
  CONFIG_READ: "Ver Config",
  CONFIG_UPDATE: "Editar Config",
  CONFIG_SYSTEM: "Config Sistema",
  ANALYTICS_READ: "Ver Analytics",
  REPORTS_GENERATE: "Gerar Relatorios",
  SUPERADMIN_CREATE: "Criar SuperAdmin",
  SUPERADMIN_UPDATE: "Editar SuperAdmin",
  SUPERADMIN_DELETE: "Deletar SuperAdmin",
  AUDIT_READ: "Ver Auditoria",
  AUDIT_CREATE: "Criar Auditoria",
  AUDIT_EXPORT: "Exportar Auditoria",
  SUPPORT_READ: "Ver Suporte",
  SUPPORT_CREATE: "Criar Suporte",
  SUPPORT_UPDATE: "Editar Suporte",
  SUPPORT_DELETE: "Deletar Suporte",
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
    <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-lg">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead className="bg-gray-800 text-xs uppercase text-gray-300">
            <tr>
              <th className="px-4 py-3 sm:px-6">Nome</th>
              <th className="px-4 py-3 sm:px-6">Email</th>
              <th className="px-4 py-3 sm:px-6">Racha</th>
              <th className="px-4 py-3 sm:px-6">Role</th>
              <th className="px-4 py-3 text-center sm:px-6">Status</th>
              <th className="px-4 py-3 text-center sm:px-6">Permissoes</th>
              <th className="px-4 py-3 text-center sm:px-6">Criado em</th>
              <th className="px-4 py-3 text-right sm:px-6">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {adminsState.map((admin) => {
              const isBusy = pendingId === admin.id || pendingId === admin.userId;
              const isLocked = admin.superadmin;
              const roleKey = String(admin.role || "").toUpperCase();
              const isVitrine = admin.tenantSlug?.toLowerCase() === "vitrine";
              return (
                <tr key={admin.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                          <FaUserShield className="h-4 w-4 text-gray-900" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{admin.name}</div>
                        {admin.superadmin && (
                          <div className="text-xs text-yellow-400 font-semibold">SuperAdmin</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300 sm:px-6 sm:py-4">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300 sm:px-6 sm:py-4">
                    {admin.tenantNome || admin.tenantSlug || "--"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                    : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {roleLabels[roleKey] || admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center sm:px-6 sm:py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="relative px-4 py-3 whitespace-nowrap text-center sm:px-6 sm:py-4">
                    <button
                      onClick={() =>
                        setShowPermissions(showPermissions === admin.id ? null : admin.id)
                      }
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                    >
                      {admin.permissions.length} permissoes
                    </button>
                    {showPermissions === admin.id && (
                      <div className="absolute left-1/2 z-20 mt-2 w-[90vw] max-w-[90vw] -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg sm:left-auto sm:right-0 sm:w-80 sm:translate-x-0">
                        <div className="text-sm font-medium text-white mb-2">
                          Permissoes de {admin.name}
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {admin.permissions.map((permission) => (
                            <div key={permission} className="text-xs text-gray-300">
                              * {permissionLabels[permission]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-gray-300 sm:px-6 sm:py-4">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium sm:px-6 sm:py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => handleAction("view", admin)}
                        className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Ver detalhes"
                        disabled={isBusy}
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction("edit", admin)}
                        className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Editar"
                        disabled={isBusy}
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction("reset-password", admin)}
                        className="text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Resetar senha"
                        disabled={isBusy || isLocked}
                      >
                        <FaKey className="h-4 w-4" />
                      </button>
                      {!admin.superadmin && (
                        <button
                          onClick={() => handleAction("delete", admin)}
                          className="text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            isVitrine ? "Racha vitrine nao pode ser alterado." : "Remover do racha"
                          }
                          disabled={isBusy || isVitrine}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
