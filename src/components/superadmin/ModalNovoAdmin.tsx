"use client";

import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUserShield,
  FaSave,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Role, Permission } from "@prisma/client";

interface Admin {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  permissions: Permission[];
  active?: boolean;
}

interface ModalNovoAdminProps {
  open: boolean;
  onClose: () => void;
  onSave: (admin: Admin) => void;
  admin?: Admin | null;
}

const roleLabels: Record<Role, string> = {
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

const rolePermissions: Record<Role, Permission[]> = {
  ATLETA: [],
  ADMIN: [
    Permission.RACHA_READ,
    Permission.RACHA_UPDATE,
    Permission.USER_READ,
    Permission.FINANCE_READ,
    Permission.ANALYTICS_READ,
  ],
  SUPERADMIN: Object.values(Permission),
  GERENTE: [
    Permission.RACHA_READ,
    Permission.RACHA_UPDATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.FINANCE_READ,
    Permission.FINANCE_UPDATE,
    Permission.ANALYTICS_READ,
    Permission.REPORTS_GENERATE,
  ],
  SUPORTE: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.SUPPORT_READ,
    Permission.SUPPORT_CREATE,
    Permission.SUPPORT_UPDATE,
  ],
  AUDITORIA: [
    Permission.AUDIT_READ,
    Permission.AUDIT_CREATE,
    Permission.AUDIT_EXPORT,
    Permission.ANALYTICS_READ,
  ],
  FINANCEIRO: [
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_APPROVE,
    Permission.ANALYTICS_READ,
  ],
  MARKETING: [
    Permission.ANALYTICS_READ,
    Permission.REPORTS_GENERATE,
    Permission.CONFIG_READ,
  ],
};

export default function ModalNovoAdmin({
  open,
  onClose,
  onSave,
  admin,
}: ModalNovoAdminProps) {
  const [formData, setFormData] = useState<Admin>({
    name: "",
    email: "",
    password: "",
    role: Role.ADMIN,
    permissions: [],
    active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!admin?.id;

  useEffect(() => {
    if (admin) {
      setFormData({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        active: admin.active ?? true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: Role.ADMIN,
        permissions: [],
        active: true,
      });
    }
    setErrors({});
  }, [admin, open]);

  const handleRoleChange = (role: Role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: rolePermissions[role],
    }));
  };

  const handlePermissionToggle = (permission: Permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!isEditing && !formData.password?.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "Selecione pelo menos uma permissão";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <FaUserShield className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">
              {isEditing ? "Editar Administrador" : "Novo Administrador"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  errors.name ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Nome completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  errors.email ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Senha */}
          {!isEditing && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Senha segura"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Função *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {Object.entries(roleLabels).map(([role, label]) => (
                <option key={role} value={role}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Permissões */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Permissões *
            </label>
            <div className="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto rounded-lg bg-gray-800 p-4 md:grid-cols-2">
              {Object.entries(permissionLabels).map(([permission, label]) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(
                      permission as Permission,
                    )}
                    onChange={() =>
                      handlePermissionToggle(permission as Permission)
                    }
                    className="rounded border-gray-600 bg-gray-700 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                </label>
              ))}
            </div>
            {errors.permissions && (
              <p className="mt-1 text-sm text-red-400">{errors.permissions}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, active: e.target.checked }))
                }
                className="rounded border-gray-600 bg-gray-700 text-yellow-400 focus:ring-yellow-400"
              />
              <span className="text-sm font-medium text-gray-300">Ativo</span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 rounded-lg bg-yellow-400 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-yellow-300"
            >
              <FaSave className="h-4 w-4" />
              <span>{isEditing ? "Salvar" : "Criar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
