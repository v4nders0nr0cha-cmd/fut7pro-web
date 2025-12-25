"use client";

import Image from "next/image";
import Link from "next/link";
import type { QuadrimestresAno } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";

interface Props {
  dados: QuadrimestresAno;
}

const periodos = [
  { key: "1º Quadrimestre", label: "1º QUADRIMESTRE (jan-abr)" },
  { key: "2º Quadrimestre", label: "2º QUADRIMESTRE (maio-ago)" },
  { key: "3º Quadrimestre", label: "3º QUADRIMESTRE (set-dez)" },
];

export default function QuadrimestreGrid({ dados }: Props) {
  const { publicHref } = usePublicLinks();
  const prioridade = [
    "Melhor do Quadrimestre",
    "Artilheiro",
    "Maestro",
    "Campeão do Quadrimestre",
    "Atacante",
    "Meia",
    "Zagueiro",
    "Goleiro",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {periodos.map(({ key, label }) => (
        <div
          key={key}
          className="bg-[#1A1A1A] rounded-xl p-4 shadow-md w-full max-w-sm text-white min-h-[220px] flex flex-col"
        >
          <h3 className="text-center text-xs font-bold text-gray-400 uppercase">{label}</h3>
          <h4 className="text-center text-yellow-400 text-sm font-bold mb-4 uppercase">
            CAMPEÕES DO QUADRIMESTRE
          </h4>
          <ul className="space-y-2 flex-1">
            {dados[key] && dados[key].length > 0 ? (
              [...dados[key]]
                .sort((a, b) => prioridade.indexOf(a.titulo) - prioridade.indexOf(b.titulo))
                .map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-sm gap-2">
                    <span className="w-6 flex justify-center text-xl">
                      {item.icone &&
                      typeof item.icone === "string" &&
                      item.icone.startsWith("/") ? (
                        <Image
                          src={item.icone}
                          alt="Ícone do prêmio"
                          width={22}
                          height={22}
                          className="inline-block align-middle"
                        />
                      ) : (
                        <span>{item.icone}</span>
                      )}
                    </span>
                    <span className="flex-1 text-center">
                      {item.slug ? (
                        <Link
                          href={publicHref(`/atletas/${item.slug}`)}
                          className="hover:text-yellow-400 transition underline underline-offset-2"
                          title={`Ver perfil de ${item.nome} - ${item.titulo}`}
                        >
                          {item.nome}
                        </Link>
                      ) : (
                        item.nome
                      )}
                    </span>
                    <span className="text-xs text-gray-400 text-right w-28 break-words">
                      {item.titulo}
                    </span>
                  </li>
                ))
            ) : (
              <li className="text-center text-gray-600 py-8">Nenhum campeão registrado</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
