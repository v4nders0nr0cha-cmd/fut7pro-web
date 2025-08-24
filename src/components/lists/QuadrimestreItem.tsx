// src/components/cards/QuadrimestreItem.tsx
"use client";

import Link from "next/link";

interface Props {
  nome: string;
  slug: string;
  premio: string;
  icone: string; // emoji ou caminho de imagem
}

export default function QuadrimestreItem({ nome, slug, premio, icone }: Props) {
  const iconeFinal = icone === "🥈" ? "🥇" : icone;

  return (
    <div className="flex items-center justify-between rounded-lg bg-[#1A1A1A] p-2 text-sm text-white">
      {/* Ícone */}
      <div className="w-[24px] text-xl">{iconeFinal}</div>

      {/* Nome do jogador com link */}
      <Link
        href={`/atletas/${slug}`}
        className="flex-1 text-center text-yellow-400 transition-all hover:underline"
        title={`Ver perfil de ${nome}`}
      >
        {nome}
      </Link>

      {/* Título */}
      <span className="text-right text-xs text-gray-300">{premio}</span>
    </div>
  );
}
