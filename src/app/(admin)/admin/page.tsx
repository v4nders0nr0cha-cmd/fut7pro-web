"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/common/enums";
import { useAuth } from "@/hooks/useAuth";
import { rachaApi } from "@/lib/api";
import type { Racha } from "@/types/racha";
import { useNotification } from "@/context/NotificationContext";

export const dynamic = "force-dynamic";

const PERMISSIONS: { key: string; label: string }[] = [
  { key: "RACHA_READ", label: "Racha READ" },
  { key: "RACHA_CREATE", label: "Racha CREATE" },
  { key: "RACHA_UPDATE", label: "Racha UPDATE" },
  { key: "RACHA_DELETE", label: "Racha DELETE" },
  { key: "FINANCE_READ", label: "Finance READ" },
  { key: "FINANCE_CREATE", label: "Finance CREATE" },
  { key: "USER_MANAGE_ROLES", label: "User MANAGE_ROLES" },
];

function AdminDashboardPageInner() {
  const { user, hasPermission, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { notify } = useNotification();

  const [rachaResumo, setRachaResumo] = useState<Racha | null>(null);
  const [isLoadingRacha, setIsLoadingRacha] = useState(false);

  const shouldRedirectToOnboarding = useMemo(() => {
    if (!user) return false;
    const rolesQueExigemRacha = [Role.ADMIN, Role.GERENTE];
    return !user.tenantId && rolesQueExigemRacha.includes(user.role as Role);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (shouldRedirectToOnboarding) {
      router.replace("/admin/rachas/novo");
    }
  }, [authLoading, shouldRedirectToOnboarding, router]);

  useEffect(() => {
    if (!user?.tenantId) {
      setRachaResumo(null);
      return;
    }

    let isActive = true;
    setIsLoadingRacha(true);

    rachaApi
      .getById(user.tenantId)
      .then((response) => {
        if (!isActive) return;
        if (response.error || !response.data) {
          notify({ message: "Não foi possível carregar os dados do racha.", type: "error" });
          setRachaResumo(null);
          return;
        }
        setRachaResumo(response.data as Racha);
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Falha ao carregar racha", error);
        }
        if (isActive) {
          notify({ message: "Erro inesperado ao buscar o racha.", type: "error" });
          setRachaResumo(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingRacha(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [user?.tenantId, notify]);

  const formataStatus = (possui: boolean) => (possui ? "✔" : "✖");

  return (
    <ProtectedRoute requiredRole={[Role.ADMIN, Role.SUPERADMIN, Role.GERENTE]}>
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold text-yellow-400 mb-6">Dashboard Administrativo</h1>

          {user && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#232323] rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Nome:</span> {user.name || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {user.email || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Função:</span> {user.role}
                  </p>
                  <p>
                    <span className="font-semibold">Tenant ID:</span> {user.tenantId || "—"}
                  </p>
                </div>
              </div>

              <div className="bg-[#232323] rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-2">Seu Racha</h2>
                {isLoadingRacha && (
                  <p className="text-sm text-gray-300">Carregando informações do racha...</p>
                )}
                {!isLoadingRacha && user?.tenantId && !rachaResumo && (
                  <p className="text-sm text-red-400">
                    Não encontramos detalhes do racha associado.
                  </p>
                )}
                {!isLoadingRacha && rachaResumo && (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Nome:</span> {rachaResumo.nome}
                    </p>
                    <p>
                      <span className="font-semibold">Slug:</span> {rachaResumo.slug}
                    </p>
                    {rachaResumo.descricao && (
                      <p>
                        <span className="font-semibold">Descrição:</span> {rachaResumo.descricao}
                      </p>
                    )}
                  </div>
                )}
                {!user?.tenantId && (
                  <p className="text-sm text-yellow-400">
                    Complete o cadastro do seu racha para liberar todas as funcionalidades.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#232323] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Permissões</h3>
              <div className="space-y-1 text-sm">
                {PERMISSIONS.map((permission) => (
                  <p key={permission.key}>
                    {permission.label}: {formataStatus(hasPermission(permission.key))}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-[#232323] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Ações Disponíveis</h3>
              <div className="space-y-2">
                {hasPermission("RACHA_READ") && (
                  <button
                    type="button"
                    onClick={() => router.push("/admin/rachas")}
                    className="w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition"
                  >
                    Ver Rachas
                  </button>
                )}
                {hasPermission("RACHA_CREATE") && (
                  <button
                    type="button"
                    onClick={() => router.push("/admin/rachas/novo")}
                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition"
                  >
                    Criar Racha
                  </button>
                )}
                {hasPermission("FINANCE_READ") && (
                  <button
                    type="button"
                    onClick={() => router.push("/admin/financeiro")}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Ver Financeiro
                  </button>
                )}
                {hasPermission("USER_MANAGE_ROLES") && (
                  <button
                    type="button"
                    onClick={() => router.push("/admin/administradores")}
                    className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition"
                  >
                    Gerenciar Usuários
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#232323] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Status do Sistema</h3>
              <div className="space-y-2 text-sm">
                <p>✔ Autenticação: Ativa</p>
                <p>✔ Autorizações em tempo real</p>
                <p>✔ Middleware protegendo rotas</p>
                <p>✔ JWT sincronizado com backend</p>
                <p>✔ Roles verificando permissões</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
          Carregando...
        </div>
      }
    >
      <AdminDashboardPageInner />
    </Suspense>
  );
}
