"use client";

import type { DerivedConfronto } from "@/utils/match-adapters";

type Props = {
  confrontos: DerivedConfronto[];
  onSelecionarPartida?: (matchId: string) => void;
};

export default function TabelaConfrontos({ confrontos, onSelecionarPartida }: Props) {
  if (!Array.isArray(confrontos) || confrontos.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-zinc-900 rounded-2xl shadow p-6 text-center">
        <p className="text-yellow-300 font-semibold">
          Nenhuma partida encontrada para o dia selecionado.
        </p>
        <p className="text-zinc-400 text-sm mt-1">
          Registre partidas no backend ou ajuste os filtros para visualizar confrontos.
        </p>
      </div>
    );
  }

  const hasAction = typeof onSelecionarPartida === "function";

  return (
    <section className="w-full max-w-5xl mx-auto">
      <div className="bg-zinc-800 rounded-2xl shadow-lg overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-700">
          <h2 className="text-yellow-400 font-bold text-xl">Confrontos do Dia</h2>
          <span className="text-sm text-zinc-300">
            {confrontos.length} partida{confrontos.length > 1 ? "s" : ""} encontrada
            {confrontos.length > 1 ? "s" : ""}
          </span>
        </header>
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm uppercase tracking-wide bg-zinc-900">
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Partida</th>
              <th className="text-center px-4 py-3">Placar</th>
              <th className="text-left px-4 py-3">Local</th>
              <th className="text-left px-4 py-3">Data/Horario</th>
              {hasAction && <th className="text-center px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {confrontos.map((confronto, index) => {
              const placarA = confronto.placar.a;
              const placarB = confronto.placar.b;
              const jogoFinalizado = placarA !== null && placarB !== null;

              return (
                <tr
                  key={confronto.id}
                  className="border-b border-zinc-700/70 hover:bg-zinc-900 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-zinc-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">{confronto.timeA.nome}</span>
                      <span className="text-white font-semibold">{confronto.timeB.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {jogoFinalizado ? (
                      <span className="text-yellow-300 font-bold">
                        {placarA} <span className="text-yellow-500">x</span> {placarB}
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-sm">Aguardando</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {confronto.local ?? "Local nao informado"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">{confronto.data}</td>
                  {hasAction && (
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold shadow"
                        onClick={() => onSelecionarPartida?.(confronto.id)}
                      >
                        {jogoFinalizado ? "Editar" : "Lancar"}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
