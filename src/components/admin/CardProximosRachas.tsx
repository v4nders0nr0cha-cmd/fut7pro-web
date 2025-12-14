"use client";

import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

type ProximoRacha = {
  id: string;
  dataStr: string;
  detalhe?: string;
};

type Props = {
  proximos: ProximoRacha[];
  isLoading?: boolean;
  manageHref?: string;
};

export default function CardProximosRachas({
  proximos,
  isLoading,
  manageHref = "/admin/rachas",
}: Props) {
  return (
    <div className="bg-[#21252B] rounded-2xl shadow-lg px-6 py-6 flex flex-col min-h-[220px] justify-between w-full">
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-cyan-400 w-6 h-6" />
        <span className="text-lg font-bold text-cyan-300 tracking-wide">Proximos rachas</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 mb-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
          ))}
        </div>
      ) : proximos.length > 0 ? (
        <div className="flex flex-col gap-1 mb-4">
          {proximos.map((racha) => (
            <div
              key={racha.id}
              className="flex flex-col sm:flex-row sm:items-center text-base text-white font-medium"
              style={{ letterSpacing: 0.5 }}
            >
              <span>{racha.dataStr}</span>
              {racha.detalhe ? (
                <span className="text-xs text-gray-400 sm:ml-2 sm:mt-0 mt-0.5">
                  {racha.detalhe}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-400">Nenhum racha futuro cadastrado.</div>
      )}

      <Link
        href={manageHref}
        className="mt-2 w-full text-center bg-cyan-600 hover:bg-cyan-700 transition text-white font-semibold py-2 px-4 rounded-xl text-sm"
      >
        Gerenciar dias e horarios
      </Link>
      <div className="mt-3 text-xs text-gray-400 text-center">
        Os proximos rachas sao calculados automaticamente a partir do calendario do racha.
      </div>
    </div>
  );
}
