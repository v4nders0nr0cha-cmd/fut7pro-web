"use client";

import Image from "next/image";
import { classificacaoTimes } from "@/components/lists/mockClassificacaoTimes";

const getVariacaoIcon = (variacao: string) => {
  switch (variacao) {
    case "up":
      return <span className="text-green-500 text-sm">↑</span>;
    case "down":
      return <span className="text-red-500 text-sm">↓</span>;
    default:
      return <span className="text-blue-500 text-sm">•</span>;
  }
};

export default function ClassificacaoDosTimesPage() {
  return (
    <main className="min-h-screen p-6 text-white bg-fundo">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Classificação dos Times</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-[#2a2a2a] text-gray-300">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-center">↑↓</th>
              <th className="p-2 text-right">Pts</th>
              <th className="p-2 text-right">J</th>
              <th className="p-2 text-right">V</th>
              <th className="p-2 text-right">E</th>
              <th className="p-2 text-right">D</th>
              <th className="p-2 text-right">GP</th>
              <th className="p-2 text-right">GC</th>
              <th className="p-2 text-right">SG</th>
            </tr>
          </thead>
          <tbody>
            {classificacaoTimes.map((time) => (
              <tr key={time.posicao} className="border-t border-gray-700 hover:bg-[#2a2a2a]">
                <td className="p-2">{time.posicao}</td>
                <td className="flex items-center gap-2 p-2">
                  <Image src={time.escudo} alt={`Escudo do ${time.nome}`} width={24} height={24} />
                  {time.nome}
                </td>
                <td className="text-center">{getVariacaoIcon(time.variacao)}</td>
                <td className="text-right p-2">{time.pontos}</td>
                <td className="text-right p-2">{time.jogos}</td>
                <td className="text-right p-2">{time.vitorias}</td>
                <td className="text-right p-2">{time.empates}</td>
                <td className="text-right p-2">{time.derrotas}</td>
                <td className="text-right p-2">{time.golsPro}</td>
                <td className="text-right p-2">{time.golsContra}</td>
                <td className="text-right p-2">{time.saldoGols}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
