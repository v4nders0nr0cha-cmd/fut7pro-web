"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@prisma/client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();

  return (
    <ProtectedRoute
      requiredRole={[Role.ADMIN, Role.SUPERADMIN, Role.GERENTE]}
      requiredPermission="RACHA_READ"
    >
      <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
        <div className="rounded-2xl bg-[#1A1A1A] p-6 text-white">
          <h1 className="mb-6 text-2xl font-bold text-yellow-400">
            Dashboard Administrativo
          </h1>

          {user && (
            <div className="mb-6 rounded-lg bg-[#232323] p-4">
              <h2 className="mb-2 text-lg font-semibold">
                Informações do Usuário
              </h2>
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
                  <span className="font-semibold">Tenant ID:</span>{" "}
                  {user.tenantId}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-[#232323] p-4">
              <h3 className="mb-2 text-lg font-semibold">Permissões</h3>
              <div className="space-y-1 text-sm">
                <p>Racha READ: {hasPermission("RACHA_READ") ? "✅" : "❌"}</p>
                <p>
                  Racha CREATE: {hasPermission("RACHA_CREATE") ? "✅" : "❌"}
                </p>
                <p>
                  Racha UPDATE: {hasPermission("RACHA_UPDATE") ? "✅" : "❌"}
                </p>
                <p>
                  Racha DELETE: {hasPermission("RACHA_DELETE") ? "✅" : "❌"}
                </p>
                <p>
                  Finance READ: {hasPermission("FINANCE_READ") ? "✅" : "❌"}
                </p>
                <p>
                  Finance CREATE:{" "}
                  {hasPermission("FINANCE_CREATE") ? "✅" : "❌"}
                </p>
                <p>
                  User MANAGE_ROLES:{" "}
                  {hasPermission("USER_MANAGE_ROLES") ? "✅" : "❌"}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-[#232323] p-4">
              <h3 className="mb-2 text-lg font-semibold">Ações Disponíveis</h3>
              <div className="space-y-2">
                {hasPermission("RACHA_READ") && (
                  <button className="w-full rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-500">
                    Ver Rachas
                  </button>
                )}
                {hasPermission("RACHA_CREATE") && (
                  <button className="w-full rounded bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700">
                    Criar Racha
                  </button>
                )}
                {hasPermission("FINANCE_READ") && (
                  <button className="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700">
                    Ver Financeiro
                  </button>
                )}
                {hasPermission("USER_MANAGE_ROLES") && (
                  <button className="w-full rounded bg-purple-600 px-4 py-2 font-bold text-white transition hover:bg-purple-700">
                    Gerenciar Usuários
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-[#232323] p-4">
              <h3 className="mb-2 text-lg font-semibold">Status do Sistema</h3>
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
