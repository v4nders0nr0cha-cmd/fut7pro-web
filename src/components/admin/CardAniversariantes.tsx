"use client";

import Image from "next/image";

const aniversariantes = [
  {
    nome: "Lucas Reis",
    data: "07/07",
    img: "/images/jogadores/jogador_padrao_04.jpg",
  },
  {
    nome: "Igor Lima",
    data: "10/07",
    img: "/images/jogadores/jogador_padrao_05.jpg",
  },
];

export default function CardAniversariantes() {
  return (
    <div className="flex h-full min-h-[140px] flex-col rounded-xl bg-[#23272F] p-6 shadow">
      <span className="text-lg font-bold text-[#41b6e6]">Aniversariantes</span>
      <div className="mt-2 flex flex-col gap-1">
        {aniversariantes.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-white">
            <Image
              src={a.img}
              alt={`Foto de ${a.nome}`}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="flex-1">{a.nome}</span>
            <span className="font-semibold text-[#f0c97f]">{a.data}</span>
          </div>
        ))}
      </div>
      <span className="mt-2 text-xs text-gray-400">Deseje parabéns!</span>
    </div>
  );
}
