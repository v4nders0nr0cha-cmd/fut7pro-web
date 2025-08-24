"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-fundo px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-[#333] bg-[#1A1A1A] p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <Shield className="h-16 w-16 text-red-400" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-red-400">
            Acesso Negado
          </h1>

          <p className="text-textoSuave mb-6">
            Você não tem permissão para acessar esta página. Entre em contato
            com o administrador se acredita que isso é um erro.
          </p>

          {user && (
            <div className="mb-6 rounded-lg bg-[#232323] p-4">
              <p className="mb-2 text-sm text-gray-400">
                Informações da sua conta:
              </p>
              <p className="text-sm text-white">
                <strong>Nome:</strong> {user.name || "N/A"}
              </p>
              <p className="text-sm text-white">
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
              <p className="text-sm text-white">
                <strong>Função:</strong> {user.role}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="flex w-full items-center justify-center rounded-lg bg-yellow-400 px-4 py-3 font-bold text-black transition hover:bg-yellow-500"
            >
              <Home size={20} className="mr-2" />
              Ir para o Início
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-lg border border-[#333] bg-[#232323] px-4 py-3 font-medium text-white transition hover:bg-[#2A2A2A]"
            >
              <ArrowLeft size={20} className="mr-2" />
              Fazer Logout
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-textoSuave text-sm">
              Precisa de ajuda?{" "}
              <a
                href="/suporte"
                className="text-yellow-400 hover:text-yellow-300"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
