"use client";

import Image from "next/image";
import Link from "next/link";
import type { QuadrimestresAno } from "@/types/estatisticas";

interface Props {
  dados: QuadrimestresAno;
}

const periodos = [
  { key: "1º Quadrimestre", label: "1º QUADRIMESTRE (jan-abr)" },
  { key: "2º Quadrimestre", label: "2º QUADRIMESTRE (maio-ago)" },
  { key: "3º Quadrimestre", label: "3º QUADRIMESTRE (set-dez)" },
];

export default function QuadrimestreGrid({ dados }: Props) {
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
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
      {periodos.map(({ key, label }) => (
        <div
          key={key}
          className="flex min-h-[220px] w-full max-w-sm flex-col rounded-xl bg-[#1A1A1A] p-4 text-white shadow-md"
        >
          <h3 className="text-center text-xs font-bold uppercase text-gray-400">
            {label}
          </h3>
          <h4 className="mb-4 text-center text-sm font-bold uppercase text-yellow-400">
            CAMPEÕES DO QUADRIMESTRE
          </h4>
          <ul className="flex-1 space-y-2">
            {dados[key] && dados[key].length > 0 ? (
              [...dados[key]]
                .sort(
                  (a, b) =>
                    prioridade.indexOf(a.titulo) - prioridade.indexOf(b.titulo),
                )
                .map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex w-6 justify-center text-xl">
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
                          href={`/atletas/${item.slug}`}
                          className="underline underline-offset-2 transition hover:text-yellow-400"
                          title={`Ver perfil de ${item.nome} - ${item.titulo}`}
                        >
                          {item.nome}
                        </Link>
                      ) : (
                        item.nome
                      )}
                    </span>
                    <span className="w-28 break-words text-right text-xs text-gray-400">
                      {item.titulo}
                    </span>
                  </li>
                ))
            ) : (
              <li className="py-8 text-center text-gray-600">
                Nenhum campeão registrado
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
