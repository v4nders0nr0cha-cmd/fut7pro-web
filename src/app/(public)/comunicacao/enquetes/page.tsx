"use client";

import { useState } from "react";

type Opcao = { texto: string; votos: number };

type Enquete = {
  id: number;
  titulo: string;
  descricao: string;
  criadaEm: string;
  criadaPor: string;
  opcoes: Opcao[];
  status: "Aberta" | "Fechada";
  totalVotos: number;
  publico: string;
  encerradaEm?: string;
};

const MOCK_ENQUETES: Enquete[] = [
  {
    id: 1,
    titulo: "Qual melhor horário para o próximo racha?",
    descricao: "Escolha o melhor horário para a maioria dos jogadores.",
    criadaEm: "15/07/2025",
    criadaPor: "Admin",
    opcoes: [
      { texto: "19:00", votos: 8 },
      { texto: "20:00", votos: 14 },
      { texto: "21:00", votos: 2 },
    ],
    status: "Aberta",
    totalVotos: 24,
    publico: "Todos os jogadores",
  },
  {
    id: 2,
    titulo: "Quem foi o melhor jogador do último jogo?",
    descricao: "Vote no destaque da última partida!",
    criadaEm: "10/07/2025",
    criadaPor: "Carlos Silva",
    opcoes: [
      { texto: "Marcos Souza", votos: 7 },
      { texto: "Lucas Tavares", votos: 3 },
      { texto: "Gustavo Nunes", votos: 5 },
    ],
    status: "Fechada",
    encerradaEm: "12/07/2025",
    totalVotos: 15,
    publico: "Jogadores ativos",
  },
];

export default function EnquetesPage() {
  // Guarda ID das enquetes que já votou
  const [votou, setVotou] = useState<number[]>([]);

  // Estado local dos votos (futuro: via API)
  const [enquetes, setEnquetes] = useState<Enquete[]>(MOCK_ENQUETES);

  function votar(id: number, idx: number) {
    setEnquetes((prev) =>
      prev.map((enq) => {
        if (enq.id !== id) return enq;
        // só permite votar se aberta e ainda não votou
        if (enq.status !== "Aberta" || votou.includes(id)) return enq;
        const opcoes = enq.opcoes.map((op, i) => (i === idx ? { ...op, votos: op.votos + 1 } : op));
        return {
          ...enq,
          opcoes,
          totalVotos: enq.totalVotos + 1,
        };
      })
    );
    setVotou((prev) => [...prev, id]);
  }

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto w-full px-3">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Enquetes</h1>
      <ul className="space-y-6">
        {enquetes.length === 0 && (
          <li className="text-zinc-400">Nenhuma enquete disponível no momento.</li>
        )}
        {enquetes.map((enq) => (
          <li key={enq.id} className="bg-zinc-800 rounded-lg p-4 border-l-4 border-yellow-400">
            <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
              <span className="text-lg font-bold text-yellow-300">{enq.titulo}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${enq.status === "Aberta" ? "bg-yellow-800 text-yellow-300" : "bg-green-800 text-green-300"}`}
              >
                {enq.status}
              </span>
            </div>
            <div className="text-gray-200 mb-3">{enq.descricao}</div>
            {/* Votação disponível */}
            {enq.status === "Aberta" && !votou.includes(enq.id) && (
              <div className="flex flex-col gap-2">
                {enq.opcoes.map((op, idx) => (
                  <button
                    key={idx}
                    onClick={() => votar(enq.id, idx)}
                    className="bg-yellow-400 text-zinc-900 rounded px-3 py-1 font-semibold hover:bg-yellow-500 transition disabled:bg-gray-400"
                    disabled={votou.includes(enq.id)}
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            )}
            {/* Resultados - se fechada ou já votou */}
            {(enq.status === "Fechada" || votou.includes(enq.id)) && (
              <div className="flex flex-col gap-2 mt-2">
                {enq.opcoes.map((op, idx) => {
                  const percent = enq.totalVotos
                    ? Math.round((op.votos / enq.totalVotos) * 100)
                    : 0;
                  const maiorVoto = enq.opcoes.reduce(
                    (max, cur) => (cur.votos > max ? cur.votos : max),
                    0
                  );
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="bg-[#181818] text-gray-200 rounded px-2 py-1 min-w-[80px] text-xs flex items-center gap-1">
                        {op.texto}
                        {op.votos === maiorVoto && maiorVoto > 0 && (
                          <span className="ml-1 text-yellow-300" title="Opção vencedora">
                            🏆
                          </span>
                        )}
                      </span>
                      <div className="flex-1 bg-[#181818] rounded-full h-4 mx-2 relative">
                        <div
                          className="bg-yellow-400 h-4 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                        <span className="absolute left-1/2 -translate-x-1/2 top-0 text-xs text-black font-bold">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">{op.votos} votos</span>
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
