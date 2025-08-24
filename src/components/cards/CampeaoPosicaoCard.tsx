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
      className="relative flex w-full max-w-xs cursor-pointer flex-col items-center rounded-xl bg-[#1A1A1A] p-4 text-white shadow-sm transition-all hover:shadow-yellow-400"
    >
      {temporario && (
        <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-gray-300">
          🕓 Temporário
        </span>
      )}
      <span className="mb-1 mt-4 flex items-center gap-1 text-base font-medium text-yellow-400">
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
        className="mb-2 rounded-full object-cover"
      />
      <h4 className="text-center text-lg font-bold">{nome}</h4>
      <p className="text-xs text-gray-300">{valor}</p>
    </Link>
  );
}
