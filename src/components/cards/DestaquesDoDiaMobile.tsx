// src/components/cards/DestaquesDoDiaMobile.tsx
"use client";

import Image from "next/image";

export default function DestaquesDoDiaMobile() {
  return (
    <div className="mb-3 flex w-full flex-col gap-4 sm:hidden">
      {/* Artilheiro do Dia */}
      <div className="flex items-center gap-3 rounded-xl bg-[#1A1A1A] p-3 shadow-md">
        <Image
          src="/images/jogadores/jogador_padrao_01.jpg"
          alt="Foto do Jogador XPTO"
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-yellow-400">
            Artilheiro do Dia
          </span>
          <span className="text-sm font-semibold text-white">Jogador XPTO</span>
          <span className="text-xs text-yellow-400">3 gols</span>
        </div>
      </div>
      {/* Maestro do Dia */}
      <div className="flex items-center gap-3 rounded-xl bg-[#1A1A1A] p-3 shadow-md">
        <Image
          src="/images/jogadores/jogador_padrao_03.jpg"
          alt="Foto do Maestro do Dia"
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase text-yellow-400">
            Maestro do Dia
          </span>
          <span className="text-sm font-semibold text-white">Camisa 10</span>
          <span className="text-xs text-yellow-400">4 assistências</span>
        </div>
      </div>
    </div>
  );
}
