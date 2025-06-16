"use client";

import Link from "next/link";
import Image from "next/image";

interface Props {
  nome: string;
  slug: string;
  premio: string;
  icone: string; // emoji ou caminho de imagem
}

export default function QuadrimestreItem({ nome, slug, premio, icone }: Props) {
  return (
    <div className="flex items-center justify-between bg-[#1A1A1A] p-2 rounded-lg text-sm text-white">
      {/* Ícone */}
      <div className="text-xl w-[24px]">{icone}</div>

      {/* Nome do jogador com link */}
      <Link
        href={`/atletas/${slug}`}
        className="flex-1 text-center text-yellow-400 hover:underline transition-all"
        title={`Ver perfil de ${nome}`}
      >
        {nome}
      </Link>

      {/* Título */}
      <span className="text-right text-xs text-gray-300">{premio}</span>
    </div>
  );
}
