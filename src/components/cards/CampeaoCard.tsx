"use client";

import Image from "next/image";

interface CampeaoCardProps {
  titulo: string;
  nome: string;
  image: string;
  valor: string;
  icone: string; // Pode ser emoji ou caminho de imagem
}

export default function CampeaoCard({
  titulo,
  nome,
  image,
  valor,
  icone,
}: CampeaoCardProps) {
  return (
    <div
      className="flex w-full max-w-xs flex-col items-center rounded-2xl bg-[#1A1A1A] p-4 text-white shadow-md transition-all hover:shadow-yellow-400"
      title={`Melhor ${titulo} do ano: ${nome}`}
    >
      <span className="mb-2 flex items-center gap-1 text-lg font-semibold text-yellow-400">
        {icone.startsWith("/") ? (
          <Image
            src={icone}
            alt={`Ícone de ${titulo}`}
            width={20}
            height={20}
            className="inline-block"
          />
        ) : (
          <>{icone}</>
        )}
        {titulo}
      </span>
      <Image
        src={image}
        alt={`Foto do jogador ${nome} - ${titulo}`}
        width={100}
        height={100}
        className="mb-2 rounded-full object-cover"
      />
      <h3 className="text-center text-xl font-bold">{nome}</h3>
      <p className="text-sm text-gray-300">{valor}</p>
    </div>
  );
}
