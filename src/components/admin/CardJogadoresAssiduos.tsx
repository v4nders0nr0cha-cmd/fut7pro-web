"use client";

import Image from "next/image";

const jogadores = [
  {
    nome: "Bruno Silva",
    partidas: 22,
    img: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    nome: "Pedro Alves",
    partidas: 20,
    img: "/images/jogadores/jogador_padrao_02.jpg",
  },
  {
    nome: "César Souza",
    partidas: 19,
    img: "/images/jogadores/jogador_padrao_03.jpg",
  },
];

export default function CardJogadoresAssiduos() {
  return (
    <div className="flex h-full min-h-[140px] flex-col rounded-xl bg-[#23272F] p-6 shadow">
      <span className="text-lg font-bold text-[#f0c97f]">Mais Assíduos</span>
      <div className="mt-2 flex flex-col gap-1">
        {jogadores.map((j, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-white">
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
      <span className="mt-2 text-xs text-gray-400">Ranking por presença</span>
    </div>
  );
}
