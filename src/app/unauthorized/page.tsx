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
    <div className="min-h-screen bg-fundo flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-[#1A1A1A] rounded-2xl p-8 shadow-xl border border-[#333]">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-red-400 mb-4">Acesso Negado</h1>

          <p className="text-textoSuave mb-6">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador se
            acredita que isso é um erro.
          </p>

          {user && (
            <div className="bg-[#232323] rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Informações da sua conta:</p>
              <p className="text-white text-sm">
                <strong>Nome:</strong> {user.name || "N/A"}
              </p>
              <p className="text-white text-sm">
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
              <p className="text-white text-sm">
                <strong>Função:</strong> {user.role}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-500 transition flex items-center justify-center"
            >
              <Home size={20} className="mr-2" />
              Ir para o Início
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-[#232323] text-white font-medium py-3 px-4 rounded-lg border border-[#333] hover:bg-[#2A2A2A] transition flex items-center justify-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Fazer Logout
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-textoSuave text-sm">
              Precisa de ajuda?{" "}
              <a href="/suporte" className="text-yellow-400 hover:text-yellow-300">
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
