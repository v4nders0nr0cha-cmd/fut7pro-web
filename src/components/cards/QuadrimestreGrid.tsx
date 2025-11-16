"use client";

import Image from "next/image";
import Link from "next/link";

export interface QuarterChampion {
  id: string;
  title: string;
  icon?: string | null;
  athlete?: {
    id: string;
    name: string;
    nickname: string | null;
    slug: string | null;
    photoUrl: string | null;
  } | null;
}

export interface QuarterSummary {
  quarter: number;
  items: QuarterChampion[];
}

interface Props {
  quarters: QuarterSummary[];
}

const LABELS: Record<number, string> = {
  1: "1o quadrimestre (jan-abr)",
  2: "2o quadrimestre (mai-ago)",
  3: "3o quadrimestre (set-dez)",
};

const PRIORIDADE = [
  "Melhor do Quadrimestre",
  "Artilheiro",
  "Maestro",
  "Campeao do Quadrimestre",
  "Atacante",
  "Meia",
  "Zagueiro",
  "Goleiro",
];

function renderIcon(icon?: string | null) {
  if (!icon) return null;
  if (icon.startsWith("/")) {
    return (
      <Image src={icon} alt="Icone do premio" width={22} height={22} className="inline-block" />
    );
  }
  return <span>{icon}</span>;
}

export default function QuadrimestreGrid({ quarters }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {quarters.map((quarterSummary) => {
        const label = LABELS[quarterSummary.quarter] ?? `Quadrimestre ${quarterSummary.quarter}`;
        const items = [...quarterSummary.items].sort((a, b) => {
          const indexA = PRIORIDADE.indexOf(a.title);
          const indexB = PRIORIDADE.indexOf(b.title);
          return indexA - indexB;
        });

        return (
          <div
            key={quarterSummary.quarter}
            className="bg-[#1A1A1A] rounded-xl p-4 shadow-md w-full max-w-sm text-white min-h-[220px] flex flex-col"
          >
            <h3 className="text-center text-xs font-bold text-gray-400 uppercase">{label}</h3>
            <h4 className="text-center text-yellow-400 text-sm font-bold mb-4 uppercase">
              Campeoes do Quadrimestre
            </h4>
            <ul className="space-y-2 flex-1">
              {items.length > 0 ? (
                items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm gap-2">
                    <span className="w-6 flex justify-center text-xl">{renderIcon(item.icon)}</span>
                    <span className="flex-1 text-center">
                      {item.athlete?.slug ? (
                        <Link
                          href={`/atletas/${item.athlete.slug}`}
                          className="hover:text-yellow-400 transition underline underline-offset-2"
                          title={`Ver perfil de ${item.athlete.name}`}
                        >
                          {item.athlete.name}
                        </Link>
                      ) : (
                        (item.athlete?.name ?? "-")
                      )}
                    </span>
                    <span className="text-xs text-gray-400 text-right w-28 break-words">
                      {item.title}
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
