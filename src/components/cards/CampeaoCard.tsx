"use client";

import Image from "next/image";

interface CampeaoCardProps {
  titulo: string;
  nome: string;
  image: string;
  valor: string;
  icone: string; // Pode ser emoji ou caminho de imagem
}

export default function CampeaoCard({ titulo, nome, image, valor, icone }: CampeaoCardProps) {
  return (
    <div
      className="bg-[#1A1A1A] rounded-2xl p-4 shadow-md w-full max-w-xs flex flex-col items-center text-white hover:shadow-brand transition-all"
      title={`Melhor ${titulo} do ano: ${nome}`}
    >
      <span className="text-brand text-lg font-semibold mb-2 flex items-center gap-1">
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
        className="rounded-full object-cover mb-2"
      />
      <h3 className="text-xl font-bold text-center">{nome}</h3>
      <p className="text-sm text-gray-300">{valor}</p>
    </div>
  );
}
