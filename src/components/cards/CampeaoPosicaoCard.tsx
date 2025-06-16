"use client";

import Image from "next/image";
import Link from "next/link";

interface CampeaoPosicaoCardProps {
  posicao: string;
  nome: string;
  image: string;
  valor: string;
  icone: string;
  href: string;
  slug?: string;
  temporario?: boolean;
}

export default function CampeaoPosicaoCard({
  posicao,
  nome,
  image,
  valor,
  icone,
  href,
  slug,
  temporario = false,
}: CampeaoPosicaoCardProps) {
  const destino = slug ? `/atletas/${slug}` : href;

  return (
    <Link
      href={destino}
      title={`Ver perfil de ${nome} - ${posicao}`}
      className="bg-[#1A1A1A] rounded-xl p-4 shadow-sm w-full max-w-xs flex flex-col items-center text-white hover:shadow-yellow-400 transition-all cursor-pointer relative"
    >
      {temporario && (
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-gray-300">
          🕓 Temporário
        </span>
      )}
      <span className="text-yellow-400 text-base font-medium mt-4 mb-1 flex items-center gap-1">
        {icone.startsWith("/") ? (
          <Image
            src={icone}
            alt={`Ícone de ${posicao}`}
            width={20}
            height={20}
            className="inline-block"
          />
        ) : (
          <>{icone}</>
        )}
        {posicao}
      </span>
      <Image
        src={image}
        alt={`Imagem do jogador ${nome} - ${posicao}`}
        width={80}
        height={80}
        className="rounded-full object-cover mb-2"
      />
      <h4 className="text-lg font-bold text-center">{nome}</h4>
      <p className="text-xs text-gray-300">{valor}</p>
    </Link>
  );
}
