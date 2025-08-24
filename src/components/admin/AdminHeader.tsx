// src/components/admin/AdminHeader.tsx
"use client";

import Image from "next/image";
import { rachaConfig } from "@/config/racha.config";

export default function AdminHeader() {
  return (
    <header className="z-40 flex w-full items-center justify-between bg-[#23272F] px-6 py-4 shadow backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Image
          src={rachaConfig.logo}
          alt={`Logo do Racha ${rachaConfig.nome} – sistema de futebol 7`}
          width={44}
          height={44}
          className="rounded object-contain"
          priority
        />
        <span className="max-w-[200px] truncate text-lg font-bold text-white md:max-w-none">
          Painel do Presidente –{" "}
          {process.env.NEXT_PUBLIC_RACHA_NOME ?? "Seu Racha"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-lg bg-[#2D3342] px-3 py-1 text-sm font-semibold text-white transition hover:bg-[#363c48]">
          Configurações
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-white sm:inline">
            Olá, Presidente
          </span>
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
