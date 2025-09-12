"use client";
import type { Confronto } from "@/mocks/admin/mockDia";

type Props = {
  confrontos: Confronto[];
  onSelecionarPartida: (index: number, tipo: "ida" | "volta") => void;
};

const nomesTimes = ["Leões", "Tigres", "Águias", "Furacão"];

export default function TabelaConfrontos({ confrontos, onSelecionarPartida }: Props) {
  return (
    <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      {/* Ida */}
      <div className="bg-zinc-800 rounded-2xl shadow-lg p-4">
        <h2 className="text-center text-yellow-400 font-bold text-xl mb-2">
          Tabela de Confrontos - Ida
        </h2>
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
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
                  conf.finalizada ? "bg-green-800/40" : "hover:bg-zinc-700"
                }`}
              >
                <td>{conf.id}</td>
                <td>
                  <div className="flex justify-center items-center gap-3 font-bold text-lg text-yellow-300">
                    <span className="text-white">{conf.timeA}</span>
                    {conf.finalizada ? (
                      <>
                        <span className="font-extrabold text-yellow-300">{conf.golsTimeA}</span>
                        <span className="text-yellow-400">×</span>
                        <span className="font-extrabold text-yellow-300">{conf.golsTimeB}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-300">--</span>
                        <span className="text-yellow-400">×</span>
                        <span className="text-yellow-300">--</span>
                      </>
                    )}
                    <span className="text-white">{conf.timeB}</span>
                  </div>
                </td>
                <td className="text-center">
                  <button
                    className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold shadow"
                    onClick={() => onSelecionarPartida(idx, "ida")}
                  >
                    {conf.finalizada ? "Editar" : "Lançar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Volta */}
      <div className="bg-zinc-800 rounded-2xl shadow-lg p-4">
        <h2 className="text-center text-yellow-400 font-bold text-xl mb-2">
          Tabela de Confrontos - Volta
        </h2>
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
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
                  conf.finalizada ? "bg-green-800/40" : "hover:bg-zinc-700"
                }`}
              >
                <td>{conf.id}</td>
                <td>
                  <div className="flex justify-center items-center gap-3 font-bold text-lg text-yellow-300">
                    <span className="text-white">{conf.timeA}</span>
                    {conf.finalizada ? (
                      <>
                        <span className="font-extrabold text-yellow-300">{conf.golsTimeA}</span>
                        <span className="text-yellow-400">×</span>
                        <span className="font-extrabold text-yellow-300">{conf.golsTimeB}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-300">--</span>
                        <span className="text-yellow-400">×</span>
                        <span className="text-yellow-300">--</span>
                      </>
                    )}
                    <span className="text-white">{conf.timeB}</span>
                  </div>
                </td>
                <td className="text-center">
                  <button
                    className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold shadow"
                    onClick={() => onSelecionarPartida(idx, "volta")}
                  >
                    {conf.finalizada ? "Editar" : "Lançar"}
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
