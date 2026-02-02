"use client";

import Image from "next/image";
import Link from "next/link";
import type { QuadrimestresAno } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";

interface Props {
  dados: QuadrimestresAno;
  year?: number;
  tenantCreatedAt?: string | Date;
}

const periodos = [
  {
    order: 1,
    label: "QUADRIMESTRE (jan-abr)",
  },
  {
    order: 2,
    label: "QUADRIMESTRE (maio-ago)",
  },
  {
    order: 3,
    label: "QUADRIMESTRE (set-dez)",
  },
];

export default function QuadrimestreGrid({ dados, year, tenantCreatedAt }: Props) {
  const { publicHref } = usePublicLinks();
  const prioridade = [
    "Melhor do Quadrimestre",
    "Artilheiro do Quadrimestre",
    "Maestro do Quadrimestre",
    "Campeão do Quadrimestre",
    "Atacante do Quadrimestre",
    "Meia do Quadrimestre",
    "Zagueiro do Quadrimestre",
    "Goleiro do Quadrimestre",
    "Artilheiro",
    "Maestro",
    "Campeão",
    "Atacante",
    "Meia",
    "Zagueiro",
    "Goleiro",
  ];
  const resolveOrdem = (titulo: string) => {
    const idx = prioridade.indexOf(titulo);
    return idx === -1 ? prioridade.length : idx;
  };
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 4) + 1;
  const targetYear = year ?? currentYear;
  const createdAt =
    typeof tenantCreatedAt === "string"
      ? new Date(tenantCreatedAt)
      : tenantCreatedAt instanceof Date
        ? tenantCreatedAt
        : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {periodos.map(({ label, order }) => {
        const itens = resolveItensByOrder(dados, order);
        const isFuture =
          targetYear > currentYear || (targetYear === currentYear && order > currentQuarter);
        const { end } = quarterBounds(targetYear, order);
        const isBeforeCreation = createdAt ? createdAt.getTime() > end.getTime() : false;
        const isBlocked = isFuture || isBeforeCreation;
        const isFinished =
          !isBlocked &&
          (targetYear < currentYear || (targetYear === currentYear && order < currentQuarter));
        return (
          <div
            key={order}
            className="bg-[#1A1A1A] rounded-xl p-4 shadow-md w-full max-w-sm text-white min-h-[220px] flex flex-col"
          >
            <h3 className="text-center text-xs font-bold text-gray-400">
              <span className="inline-flex items-center gap-0.5">
                <span>{order}</span>
                <span className="lowercase">o</span>
              </span>{" "}
              <span className="uppercase">{label}</span>
            </h3>
            <h4 className="text-center text-brand text-sm font-bold mb-4 uppercase">
              CAMPEÕES DO QUADRIMESTRE
            </h4>
            <ul className="space-y-2 flex-1">
              {isBlocked ? (
                <li className="text-center text-gray-500 py-8 text-xs">
                  Ranking liberado no início do quadrimestre.
                </li>
              ) : itens.length > 0 ? (
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
                        <span className="inline-flex items-center justify-center gap-2">
                          {item.slug ? (
                            <Link
                              href={publicHref(`/atletas/${item.slug}`)}
                              className="hover:text-brand transition underline underline-offset-2"
                              title={`Ver perfil de ${item.nome} - ${item.titulo}`}
                            >
                              {item.nome}
                            </Link>
                          ) : (
                            <span>{item.nome}</span>
                          )}
                          {isFinished && !item.nome.toLowerCase().includes("processamento") && (
                            <span className="text-[9px] uppercase tracking-wide text-brand-soft border border-brand/40 bg-brand/10 px-2 py-0.5 rounded-full">
                              campeão
                            </span>
                          )}
                        </span>
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
        );
      })}
    </div>
  );
}

function resolveItensByOrder(dados: QuadrimestresAno, order: number) {
  const match = new RegExp(`(^|\\D)${order}(\\D|$)`);
  for (const [key, itens] of Object.entries(dados)) {
    if (match.test(key)) return itens;
  }
  return [];
}

function quarterBounds(year: number, quarter: number) {
  const mapping: Record<
    number,
    { start: { month: number; day: number }; end: { month: number; day: number } }
  > = {
    1: { start: { month: 1, day: 1 }, end: { month: 4, day: 30 } },
    2: { start: { month: 5, day: 1 }, end: { month: 8, day: 31 } },
    3: { start: { month: 9, day: 1 }, end: { month: 12, day: 31 } },
  };

  const range = mapping[quarter] ?? mapping[1];

  return {
    start: new Date(year, range.start.month - 1, range.start.day, 0, 0, 0, 0),
    end: new Date(year, range.end.month - 1, range.end.day, 23, 59, 59, 999),
  };
}
