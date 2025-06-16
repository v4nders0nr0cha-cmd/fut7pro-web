"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function PerfilPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-yellow-400">Você não está logado</h2>
          <p className="text-gray-300">Faça login com sua conta Google para acessar seu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Perfil do Atleta</h1>

      <div className="bg-[#1A1A1A] rounded-xl p-6 flex items-center gap-6 shadow-md">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "Usuário"}
            width={96}
            height={96}
            className="rounded-full"
          />
        )}
        <div>
          <p className="text-lg font-semibold">{session.user.name}</p>
          <p className="text-gray-400">{session.user.email}</p>
          {session.user.id && <p className="text-sm text-gray-600 mt-1">ID: {session.user.id}</p>}
        </div>
      </div>

      {/* Seções futuras */}
      <div className="mt-10 space-y-6">
        <div className="bg-[#1B1B1B] p-4 rounded-xl border border-[#333]">
          <h2 className="text-yellow-400 font-bold text-lg mb-2">Estatísticas</h2>
          <p className="text-gray-400">Aqui aparecerão suas partidas, gols, vitórias e mais.</p>
        </div>

        <div className="bg-[#1B1B1B] p-4 rounded-xl border border-[#333]">
          <h2 className="text-yellow-400 font-bold text-lg mb-2">Conquistas</h2>
          <p className="text-gray-400">
            Em breve você poderá visualizar todas suas conquistas desbloqueadas.
          </p>
        </div>
      </div>
    </div>
  );
}
