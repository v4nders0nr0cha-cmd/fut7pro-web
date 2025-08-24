"use client";

import Image from "next/image";
import Link from "next/link";

interface CampeaoAnoCardProps {
  titulo: string;
  nome: string;
  image: string;
  valor: string;
  icone: string;
  href: string;
  slug?: string;
  temporario?: boolean;
}

export default function CampeaoAnoCard({
  titulo,
  nome,
  image,
  valor,
  icone,
  href,
  slug,
  temporario = false,
}: CampeaoAnoCardProps) {
  // Garante que rankings de campeões do ano sempre vão para as rotas ANUAIS
  const destino = href.startsWith("/estatisticas")
    ? href
    : slug
      ? `/atletas/${slug}`
      : "#";

  // Renderiza o ícone do card de forma flexível
  const renderTitulo = () => (
    <span className="mb-2 mt-4 flex items-center justify-center gap-1 text-lg font-semibold text-yellow-400">
      {icone && typeof icone === "string" && icone.startsWith("/") ? (
        <Image
          src={icone}
          alt={`Ícone do prêmio ${titulo}`}
          width={22}
          height={22}
          className="inline-block align-middle"
        />
      ) : (
        <span>{icone}</span>
      )}
      {titulo}
    </span>
  );

  return (
    <Link
      href={destino}
      title={
        href.startsWith("/estatisticas")
          ? `Ver ranking anual relacionado a ${titulo}`
          : `Ver perfil de ${nome} - ${titulo}`
      }
      className="relative flex w-full max-w-xs cursor-pointer flex-col items-center rounded-2xl bg-[#1A1A1A] p-4 text-white shadow-md transition-all hover:shadow-yellow-400"
    >
      {temporario && (
        <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-gray-300">
          🕓 Temporário
        </span>
      )}

      {renderTitulo()}

      <Image
        src={image}
        alt={`Imagem do campeão ${nome} - ${titulo}`}
        width={100}
        height={100}
        className="mb-2 rounded-full object-cover"
      />
      <h3 className="text-center text-xl font-bold">{nome}</h3>
      <p className="text-sm text-gray-300">{valor}</p>
    </Link>
  );
}
