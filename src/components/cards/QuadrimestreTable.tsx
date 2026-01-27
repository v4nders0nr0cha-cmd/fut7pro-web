"use client";

import Link from "next/link";
import { FaMedal } from "react-icons/fa";
import { PiSoccerBallFill } from "react-icons/pi";
import type { QuadrimestreItem } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";

interface QuadrimestreTableProps {
  titulo: string;
  dados: readonly QuadrimestreItem[];
}

export default function QuadrimestreTable({ titulo, dados }: QuadrimestreTableProps) {
  const { publicHref } = usePublicLinks();
  return (
    <div className="bg-[#1A1A1A] rounded-lg p-4 shadow-md w-full max-w-2xl mx-auto mb-8">
      <h3 className="text-brand text-lg font-bold mb-3">{titulo}</h3>
      <ul className="space-y-2">
        {dados.map((item, idx) => (
          <li key={idx} className="flex justify-between text-white">
            {item.slug ? (
              <Link
                href={publicHref(`/atletas/${item.slug}`)}
                className="hover:text-brand transition underline underline-offset-2"
                title={`Ver perfil de ${item.nome}`}
              >
                {item.nome}
              </Link>
            ) : (
              <span>{item.nome}</span>
            )}

            <span>
              {item.icone === "medalha" ? (
                <FaMedal className="text-brand" aria-label="Medalha de Ouro" />
              ) : (
                <PiSoccerBallFill className="text-white" aria-label="Bola" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
