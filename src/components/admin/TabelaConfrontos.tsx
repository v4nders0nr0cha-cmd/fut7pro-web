"use client";
import type { Confronto } from "@/mocks/admin/mockDia";

type Props = {
  confrontos: Confronto[];
  onSelecionarPartida: (index: number, tipo: "ida" | "volta") => void;
};

const nomesTimes = ["Leões", "Tigres", "Águias", "Furacão"];

export default function TabelaConfrontos({
  confrontos,
  onSelecionarPartida,
}: Props) {
  return (
    <section className="mx-auto mb-10 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
      {/* Ida */}
      <div className="rounded-2xl bg-zinc-800 p-4 shadow-lg">
        <h2 className="mb-2 text-center text-xl font-bold text-yellow-400">
          Tabela de Confrontos - Ida
        </h2>
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-400">
              <th className="text-left">Rodada</th>
              <th className="text-center">Resultado</th>
              <th className="text-center"></th>
            </tr>
          </thead>
          <tbody>
            {confrontos.map((conf, idx) => (
              <tr
                key={idx}
                className={`transition ${
                  conf.resultadoIda ? "bg-green-800/40" : "hover:bg-zinc-700"
                }`}
              >
                <td>{conf.rodada}</td>
                <td>
                  <div className="flex items-center justify-center gap-3 text-lg font-bold text-yellow-300">
                    <span className="text-white">{nomesTimes[conf.ida.a]}</span>
                    {conf.resultadoIda ? (
                      <>
                        <span className="font-extrabold text-yellow-300">
                          {conf.resultadoIda.placar.a}
                        </span>
                        <span className="text-yellow-400">×</span>
                        <span className="font-extrabold text-yellow-300">
                          {conf.resultadoIda.placar.b}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-300">--</span>
                        <span className="text-yellow-400">×</span>
                        <span className="text-yellow-300">--</span>
                      </>
                    )}
                    <span className="text-white">{nomesTimes[conf.ida.b]}</span>
                  </div>
                </td>
                <td className="text-center">
                  <button
                    className="rounded bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow hover:bg-yellow-300"
                    onClick={() => onSelecionarPartida(idx, "ida")}
                  >
                    {conf.resultadoIda ? "Editar" : "Lançar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Volta */}
      <div className="rounded-2xl bg-zinc-800 p-4 shadow-lg">
        <h2 className="mb-2 text-center text-xl font-bold text-yellow-400">
          Tabela de Confrontos - Volta
        </h2>
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-400">
              <th className="text-left">Rodada</th>
              <th className="text-center">Resultado</th>
              <th className="text-center"></th>
            </tr>
          </thead>
          <tbody>
            {confrontos.map((conf, idx) => (
              <tr
                key={idx}
                className={`transition ${
                  conf.resultadoVolta ? "bg-green-800/40" : "hover:bg-zinc-700"
                }`}
              >
                <td>{conf.rodada}</td>
                <td>
                  <div className="flex items-center justify-center gap-3 text-lg font-bold text-yellow-300">
                    <span className="text-white">
                      {nomesTimes[conf.volta.a]}
                    </span>
                    {conf.resultadoVolta ? (
                      <>
                        <span className="font-extrabold text-yellow-300">
                          {conf.resultadoVolta.placar.a}
                        </span>
                        <span className="text-yellow-400">×</span>
                        <span className="font-extrabold text-yellow-300">
                          {conf.resultadoVolta.placar.b}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-300">--</span>
                        <span className="text-yellow-400">×</span>
                        <span className="text-yellow-300">--</span>
                      </>
                    )}
                    <span className="text-white">
                      {nomesTimes[conf.volta.b]}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  <button
                    className="rounded bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow hover:bg-yellow-300"
                    onClick={() => onSelecionarPartida(idx, "volta")}
                  >
                    {conf.resultadoVolta ? "Editar" : "Lançar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
