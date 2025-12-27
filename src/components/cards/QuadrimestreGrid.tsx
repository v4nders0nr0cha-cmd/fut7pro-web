"use client";

import Image from "next/image";
import Link from "next/link";
import type { QuadrimestresAno } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";

interface Props {
  dados: QuadrimestresAno;
}

const periodos = [
  {
    key: "1o Quadrimestre",
    label: "1o QUADRIMESTRE (jan-abr)",
    aliases: ["1º Quadrimestre", "1§ Quadrimestre", "1° Quadrimestre"],
  },
  {
    key: "2o Quadrimestre",
    label: "2o QUADRIMESTRE (maio-ago)",
    aliases: ["2º Quadrimestre", "2§ Quadrimestre", "2° Quadrimestre"],
  },
  {
    key: "3o Quadrimestre",
    label: "3o QUADRIMESTRE (set-dez)",
    aliases: ["3º Quadrimestre", "3§ Quadrimestre", "3° Quadrimestre"],
  },
];

export default function QuadrimestreGrid({ dados }: Props) {
  const { publicHref } = usePublicLinks();
  const prioridade = [
    "Melhor do Quadrimestre",
    "Artilheiro do Quadrimestre",
    "Maestro do Quadrimestre",
    "Campeao do Quadrimestre",
    "Atacante do Quadrimestre",
    "Meia do Quadrimestre",
    "Zagueiro do Quadrimestre",
    "Goleiro do Quadrimestre",
    "Artilheiro",
    "Maestro",
    "Campeao",
    "Atacante",
    "Meia",
    "Zagueiro",
    "Goleiro",
  ];
  const resolveOrdem = (titulo: string) => {
    const idx = prioridade.indexOf(titulo);
    return idx === -1 ? prioridade.length : idx;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {periodos.map(({ key, label, aliases }) => {
        const itens = resolveItens(dados, [key, ...aliases]);
        return (
          <div
            key={key}
            className="bg-[#1A1A1A] rounded-xl p-4 shadow-md w-full max-w-sm text-white min-h-[220px] flex flex-col"
          >
            <h3 className="text-center text-xs font-bold text-gray-400 uppercase">{label}</h3>
            <h4 className="text-center text-yellow-400 text-sm font-bold mb-4 uppercase">
              CAMPEOES DO QUADRIMESTRE
            </h4>
            <ul className="space-y-2 flex-1">
              {itens.length > 0 ? (
                [...itens]
                  .sort((a, b) => resolveOrdem(a.titulo) - resolveOrdem(b.titulo))
                  .map((item, index) => (
                    <li key={index} className="flex items-center justify-between text-sm gap-2">
                      <span className="w-6 flex justify-center text-xl">
                        {item.icone &&
                        typeof item.icone === "string" &&
                        item.icone.startsWith("/") ? (
                          <Image
                            src={item.icone}
                            alt="Icone do premio"
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
                <li className="text-center text-gray-600 py-8">Nenhum campeao registrado</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function resolveItens(dados: QuadrimestresAno, keys: string[]) {
  for (const key of keys) {
    const itens = dados[key];
    if (itens && itens.length > 0) return itens;
  }
  return [];
}
