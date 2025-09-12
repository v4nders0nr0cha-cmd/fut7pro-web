"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/common/enums";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();

  return (
    <ProtectedRoute
      requiredRole={[Role.ADMIN, Role.SUPERADMIN, Role.GERENTE]}
      requiredPermission="RACHA_READ"
    >
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold text-yellow-400 mb-6">Dashboard Administrativo</h1>

          {user && (
            <div className="bg-[#232323] rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Nome:</span> {user.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">Função:</span> {user.role}
                </p>
                <p>
                  <span className="font-semibold">Tenant ID:</span> {user.tenantId}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#232323] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Permissões</h3>
              <div className="space-y-1 text-sm">
                <p>Racha READ: {hasPermission("RACHA_READ") ? "✅" : "❌"}</p>
                <p>Racha CREATE: {hasPermission("RACHA_CREATE") ? "✅" : "❌"}</p>
                <p>Racha UPDATE: {hasPermission("RACHA_UPDATE") ? "✅" : "❌"}</p>
                <p>Racha DELETE: {hasPermission("RACHA_DELETE") ? "✅" : "❌"}</p>
                <p>Finance READ: {hasPermission("FINANCE_READ") ? "✅" : "❌"}</p>
                <p>Finance CREATE: {hasPermission("FINANCE_CREATE") ? "✅" : "❌"}</p>
                <p>User MANAGE_ROLES: {hasPermission("USER_MANAGE_ROLES") ? "✅" : "❌"}</p>
              </div>
            </div>

            <div className="bg-[#232323] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Ações Disponíveis</h3>
              <div className="space-y-2">
                {hasPermission("RACHA_READ") && (
                  <button className="w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition">
                    Ver Rachas
                  </button>
                )}
                {hasPermission("RACHA_CREATE") && (
                  <button className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition">
                    Criar Racha
                  </button>
                )}
                {hasPermission("FINANCE_READ") && (
                  <button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
                    Ver Financeiro
                  </button>
                )}
                {hasPermission("USER_MANAGE_ROLES") && (
                  <button className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition">
                    Gerenciar Usuários
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#232323] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Status do Sistema</h3>
              <div className="space-y-2 text-sm">
                <p>✅ Autenticação: Ativa</p>
                <p>✅ Autorização: Funcionando</p>
                <p>✅ Middleware: Protegendo rotas</p>
                <p>✅ JWT: Integrado com backend</p>
                <p>✅ Roles: Verificando permissões</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
