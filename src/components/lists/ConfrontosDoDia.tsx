"use client";

import Image from "next/image";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";

interface ConfrontoItem {
  id: string;
  timeA: string;
  timeB: string;
  hora?: string;
  ordem?: number;
  tempo?: number;
  turno?: "ida" | "volta";
  logoA?: string;
  logoB?: string;
}

interface ConfrontosDoDiaProps {
  confrontos?: ConfrontoItem[];
}

function normalizeTurno(turno?: ConfrontoItem["turno"]) {
  return turno === "volta" ? "volta" : "ida";
}

export default function ConfrontosDoDia({ confrontos = [] }: ConfrontosDoDiaProps) {
  if (confrontos.length === 0) {
    return <div className="text-gray-400 text-sm">Nenhum confronto disponivel</div>;
  }

  const ida = confrontos
    .filter((c) => normalizeTurno(c.turno) === "ida")
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const volta = confrontos
    .filter((c) => normalizeTurno(c.turno) === "volta")
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const secoes = [
    { titulo: "Ida", lista: ida },
    { titulo: "Volta", lista: volta },
  ].filter((secao) => secao.lista.length > 0);
  const gridCols = secoes.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 gap-6 ${gridCols} md:gap-8 items-start`}>
      {secoes.map((secao) => (
        <div key={secao.titulo} className="min-w-0">
          <h4 className="text-lg md:text-xl text-brand font-bold mb-3 text-center">
            {secao.titulo}
          </h4>

          <div className="hidden md:block">
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f1522] shadow">
              <table className="w-full table-fixed text-sm text-white">
                <thead>
                  <tr className="bg-[#1b2436] text-brand-soft text-xs uppercase tracking-wide">
                    <th className="w-20 px-3 py-3 text-left">Rodada</th>
                    <th className="px-3 py-3 text-center">Confronto</th>
                    <th className="w-24 px-3 py-3 text-right">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {secao.lista.map((jogo, idx) => {
                    const tempoLabel = jogo.tempo ? `${jogo.tempo} min` : "--";
                    return (
                      <tr
                        key={`${secao.titulo}-${jogo.id}-${idx}`}
                        className="border-t border-[#1e2a3a] odd:bg-[#0f1626] even:bg-[#0c1320]"
                      >
                        <td className="px-3 py-3 text-left font-semibold">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                            <div className="flex items-center justify-end gap-2 min-w-0">
                              <span className="truncate font-medium">{jogo.timeA}</span>
                              <Image
                                src={jogo.logoA || DEFAULT_LOGO}
                                alt={jogo.timeA}
                                width={26}
                                height={26}
                                className="rounded shrink-0"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <span className="text-brand font-bold text-base">x</span>
                            <div className="flex items-center justify-start gap-2 min-w-0">
                              <Image
                                src={jogo.logoB || DEFAULT_LOGO}
                                alt={jogo.timeB}
                                width={26}
                                height={26}
                                className="rounded shrink-0"
                                style={{ objectFit: "cover" }}
                              />
                              <span className="truncate font-medium">{jogo.timeB}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-brand-soft font-semibold">
                          {tempoLabel}
                          {jogo.hora && (
                            <span className="mt-1 block text-xs text-gray-400">{jogo.hora}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {secao.lista.map((jogo, idx) => {
              const tempoLabel = jogo.tempo ? `${jogo.tempo} min` : "--";
              const tempoExtra = jogo.hora ? ` - ${jogo.hora}` : "";
              return (
                <div
                  key={`${secao.titulo}-mobile-${jogo.id}-${idx}`}
                  className="rounded-xl border border-zinc-800 bg-[#0f1522] px-3 py-3 shadow"
                >
                  <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wide">
                    <span>Rodada {idx + 1}</span>
                    <span>
                      {tempoLabel}
                      {tempoExtra}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Image
                        src={jogo.logoA || DEFAULT_LOGO}
                        alt={jogo.timeA}
                        width={26}
                        height={26}
                        className="rounded shrink-0"
                        style={{ objectFit: "cover" }}
                      />
                      <span className="truncate text-sm font-semibold">{jogo.timeA}</span>
                    </div>
                    <span className="text-brand font-bold text-sm">x</span>
                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="truncate text-sm font-semibold text-right">
                        {jogo.timeB}
                      </span>
                      <Image
                        src={jogo.logoB || DEFAULT_LOGO}
                        alt={jogo.timeB}
                        width={26}
                        height={26}
                        className="rounded shrink-0"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
