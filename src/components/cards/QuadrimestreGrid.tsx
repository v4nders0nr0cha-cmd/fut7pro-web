"use client";

import Link from "next/link";
import Image from "next/image";
import { FaMedal } from "react-icons/fa";
import type { QuadrimestresAno } from "@/types/estatisticas";

interface Props {
  dados: QuadrimestresAno;
}

export default function QuadrimestreGrid({ dados }: Props) {
  const icon = (tipo: "medalha" | "bola", titulo: string) => {
    if (tipo === "bola" && titulo === "Artilheiro") {
      return (
        <Image
          src="/images/icons/bola-de-prata.png"
          alt="Ícone Bola de Prata - Artilheiro do Quadrimestre"
          width={18}
          height={18}
          className="inline-block"
        />
      );
    }

    return <FaMedal className="text-yellow-400 w-5 h-5" aria-label="Medalha de Campeão" />;
  };

  return (
    <div className="flex flex-col md:flex-row justify-center gap-6 mt-4">
      {Object.entries(dados).map(([periodo, lista], idx) => (
        <div key={idx} className="bg-[#1A1A1A] rounded-xl p-4 shadow-md w-full max-w-sm text-white">
          <h3 className="text-center text-xs font-bold text-gray-400 uppercase">{periodo}</h3>
          <h4 className="text-center text-yellow-400 text-sm font-bold mb-4 uppercase">
            CAMPEÃO QUADRIMESTRE
          </h4>

          <ul className="space-y-2">
            {lista.map((item, index) => (
              <li key={index} className="flex items-center justify-between text-sm gap-2">
                {/* Ícone à esquerda */}
                <span className="w-5 flex justify-center">{icon(item.icone, item.titulo)}</span>

                {/* Nome com link e SEO */}
                <span className="flex-1 text-center">
                  {item.slug ? (
                    <Link
                      href={`/atletas/${item.slug}`}
                      className="hover:text-yellow-400 transition underline underline-offset-2"
                      title={`Ver perfil de ${item.nome} - ${item.titulo}`}
                    >
                      {item.nome}
                    </Link>
                  ) : (
                    item.nome
                  )}
                </span>

                {/* Título do prêmio à direita */}
                <span className="text-xs text-gray-400 text-right w-28 break-words">
                  {item.titulo}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
