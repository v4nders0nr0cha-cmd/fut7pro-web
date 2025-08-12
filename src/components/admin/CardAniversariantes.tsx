"use client";

import Image from "next/image";

const aniversariantes = [
  { nome: "Lucas Reis", data: "07/07", img: "/images/jogadores/jogador_padrao_04.jpg" },
  { nome: "Igor Lima", data: "10/07", img: "/images/jogadores/jogador_padrao_05.jpg" },
];

export default function CardAniversariantes() {
  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col h-full min-h-[140px]">
      <span className="text-[#41b6e6] font-bold text-lg">Aniversariantes</span>
      <div className="flex flex-col gap-1 mt-2">
        {aniversariantes.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-white text-sm">
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
      <span className="text-xs text-gray-400 mt-2">Deseje parabéns!</span>
    </div>
  );
}
