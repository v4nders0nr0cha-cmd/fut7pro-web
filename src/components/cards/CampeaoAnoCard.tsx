"use client";

import Image from "next/image";
import Link from "next/link";
import { usePublicLinks } from "@/hooks/usePublicLinks";

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
  const { publicHref } = usePublicLinks();
  const resolvedImage =
    image && image.trim().length > 0 ? image : "/images/jogadores/jogador_padrao_01.jpg";
  const paddingClass = temporario ? "pt-7" : "";
  // Garante que rankings de campeões do ano sempre vão para as rotas ANUAIS
  const destino = href.startsWith("/estatisticas") ? href : slug ? `/atletas/${slug}` : "#";
  const resolvedHref = publicHref(destino);

  // Renderiza o ícone do card de forma flexível
  const renderTitulo = () => (
    <span className="text-yellow-400 text-lg font-semibold mt-4 mb-2 flex items-center justify-center gap-1">
      {icone && typeof icone === "string" && icone.startsWith("/") ? (
        <Image
          src={icone}
          alt={`Icone do premio ${titulo}`}
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
      href={resolvedHref}
      title={
        href.startsWith("/estatisticas")
          ? `Ver ranking anual relacionado a ${titulo}`
          : `Ver perfil de ${nome} - ${titulo}`
      }
      className={`bg-[#1A1A1A] rounded-2xl p-4 ${paddingClass} shadow-md w-full max-w-xs flex flex-col items-center text-white hover:shadow-yellow-400 transition-all cursor-pointer relative`}
    >
      {temporario && (
        <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-gray-200 bg-black/40 px-2 py-0.5 rounded-full">
          temporariamente
        </span>
      )}

      {renderTitulo()}

      <Image
        src={resolvedImage}
        alt={`Imagem do campeão ${nome} - ${titulo}`}
        width={100}
        height={100}
        className="rounded-full object-cover mb-2"
      />
      <h3 className="text-xl font-bold text-center">{nome}</h3>
      <p className="text-sm text-gray-300">{valor}</p>
    </Link>
  );
}
