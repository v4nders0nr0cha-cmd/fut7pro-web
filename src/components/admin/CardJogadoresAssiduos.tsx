"use client";

import Image from "next/image";

const jogadores = [
  { nome: "Bruno Silva", partidas: 22, img: "/images/jogadores/jogador_padrao_01.jpg" },
  { nome: "Pedro Alves", partidas: 20, img: "/images/jogadores/jogador_padrao_02.jpg" },
  { nome: "César Souza", partidas: 19, img: "/images/jogadores/jogador_padrao_03.jpg" },
];

export default function CardJogadoresAssiduos() {
  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col h-full min-h-[140px]">
      <span className="text-[#f0c97f] font-bold text-lg">Mais Assíduos</span>
      <div className="flex flex-col gap-1 mt-2">
        {jogadores.map((j, i) => (
          <div key={i} className="flex items-center gap-2 text-white text-sm">
            <Image
              src={j.img}
              alt={`Foto de ${j.nome}`}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="flex-1">{j.nome}</span>
            <span className="font-semibold text-[#8de97c]">{j.partidas}j</span>
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-400 mt-2">Ranking por presença</span>
    </div>
  );
}
