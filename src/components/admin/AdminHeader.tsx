// src/components/admin/AdminHeader.tsx
"use client";

import Image from "next/image";
import { rachaConfig } from "@/config/racha.config";

export default function AdminHeader() {
  return (
    <header className="w-full bg-[#23272F] shadow px-6 py-4 flex items-center justify-between z-40 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Image
          src={rachaConfig.logo}
          alt={`Logo do Racha ${rachaConfig.nome} – sistema de futebol 7`}
          width={44}
          height={44}
          className="object-contain rounded"
          priority
        />
        <span className="font-bold text-lg text-white truncate max-w-[200px] md:max-w-none">
          Painel do Presidente – {process.env.NEXT_PUBLIC_RACHA_NOME ?? "Seu Racha"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-3 py-1 rounded-lg bg-[#2D3342] text-white hover:bg-[#363c48] text-sm font-semibold transition">
          Configurações
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm hidden sm:inline">Olá, Presidente</span>
          <Image
            src="/images/jogadores/jogador_padrao_01.jpg"
            alt={`Avatar do presidente do racha – ${rachaConfig.nome}`}
            width={32}
            height={32}
            className="rounded-full border-2 border-yellow-400"
          />
        </div>
      </div>
    </header>
  );
}
