// src/components/cards/DestaquesDoDiaMobile.tsx
"use client";

import Image from "next/image";

export default function DestaquesDoDiaMobile() {
  return (
    <div className="flex flex-col gap-4 sm:hidden w-full mb-3">
      {/* Artilheiro do Dia */}
      <div className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3 shadow-md">
        <Image
          src="/images/jogadores/jogador_padrao_01.jpg"
          alt="Foto do Jogador XPTO"
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-brand">Artilheiro do Dia</span>
          <span className="font-semibold text-sm text-white">Jogador XPTO</span>
          <span className="text-brand text-xs">3 gols</span>
        </div>
      </div>
      {/* Maestro do Dia */}
      <div className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3 shadow-md">
        <Image
          src="/images/jogadores/jogador_padrao_03.jpg"
          alt="Foto do Maestro do Dia"
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-brand">Maestro do Dia</span>
          <span className="font-semibold text-sm text-white">Camisa 10</span>
          <span className="text-brand text-xs">4 assistências</span>
        </div>
      </div>
    </div>
  );
}
