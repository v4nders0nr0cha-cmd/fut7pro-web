"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaKey, FaBan, FaCheck, FaUserShield } from "react-icons/fa";
import { Role, Permission } from "@/common/enums";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: Role;
  superadmin: boolean;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  permissions: Permission[];
}

interface AdminsTableProps {
  admins?: Admin[];
  isLoading?: boolean;
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
  onView?: (admin: Admin) => void;
  onResetPassword?: (admin: Admin) => void;
  onRevokeAccess?: (admin: Admin) => void;
  onActivate?: (admin: Admin) => void;
}

const roleLabels: Record<Role, string> = {
  ATHLETE: "Athlete",
  ATLETA: "Atleta",
  ADMIN: "Admin",
  SUPERADMIN: "SuperAdmin",
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
  USER_CREATE: "Criar Usuário",
  USER_READ: "Ver Usuário",
  USER_UPDATE: "Editar Usuário",
  USER_DELETE: "Deletar Usuário",
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
  REPORTS_GENERATE: "Gerar Relatórios",
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
  onEdit,
  onDelete,
  onView,
  onResetPassword,
  onRevokeAccess,
  onActivate,
}: AdminsTableProps) {
  const [adminsState, setAdminsState] = useState<Admin[]>(admins);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
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
      case "revoke":
        onRevokeAccess?.(admin);
        break;
      case "activate":
        onActivate?.(admin);
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
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-300 uppercase bg-gray-800">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Permissões</th>
              <th className="px-6 py-3">Criado em</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {adminsState.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.role === Role.SUPERADMIN
                        ? "bg-red-100 text-red-800"
                        : admin.role === Role.GERENTE
                          ? "bg-blue-100 text-blue-800"
                          : admin.role === Role.SUPORTE
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {roleLabels[admin.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      setShowPermissions(showPermissions === admin.id ? null : admin.id)
                    }
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                  >
                    {admin.permissions.length} permissões
                  </button>
                  {showPermissions === admin.id && (
                    <div className="absolute z-10 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
                      <div className="text-sm font-medium text-white mb-2">
                        Permissões de {admin.name}
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {admin.permissions.map((permission) => (
                          <div key={permission} className="text-xs text-gray-300">
                            • {permissionLabels[permission]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {formatDate(admin.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAction("view", admin)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Ver detalhes"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAction("edit", admin)}
                      className="text-yellow-400 hover:text-yellow-300"
                      title="Editar"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAction("reset-password", admin)}
                      className="text-purple-400 hover:text-purple-300"
                      title="Resetar senha"
                    >
                      <FaKey className="h-4 w-4" />
                    </button>
                    {admin.active ? (
                      <button
                        onClick={() => handleAction("revoke", admin)}
                        className="text-red-400 hover:text-red-300"
                        title="Revogar acesso"
                      >
                        <FaBan className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction("activate", admin)}
                        className="text-green-400 hover:text-green-300"
                        title="Ativar"
                      >
                        <FaCheck className="h-4 w-4" />
                      </button>
                    )}
                    {!admin.superadmin && (
                      <button
                        onClick={() => handleAction("delete", admin)}
                        className="text-red-600 hover:text-red-500"
                        title="Deletar"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
