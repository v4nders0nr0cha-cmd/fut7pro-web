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
        const opcoes = enq.opcoes.map((op, i) =>
          i === idx ? { ...op, votos: op.votos + 1 } : op,
        );
        return {
          ...enq,
          opcoes,
          totalVotos: enq.totalVotos + 1,
        };
      }),
    );
    setVotou((prev) => [...prev, id]);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-24 pt-20 md:pb-8 md:pt-6">
      <h1 className="mb-4 text-xl font-bold text-zinc-100">Enquetes</h1>
      <ul className="space-y-6">
        {enquetes.length === 0 && (
          <li className="text-zinc-400">
            Nenhuma enquete disponível no momento.
          </li>
        )}
        {enquetes.map((enq) => (
          <li
            key={enq.id}
            className="rounded-lg border-l-4 border-yellow-400 bg-zinc-800 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg font-bold text-yellow-300">
                {enq.titulo}
              </span>
              <span
                className={`rounded px-2 py-1 text-xs font-bold ${enq.status === "Aberta" ? "bg-yellow-800 text-yellow-300" : "bg-green-800 text-green-300"}`}
              >
                {enq.status}
              </span>
            </div>
            <div className="mb-3 text-gray-200">{enq.descricao}</div>
            {/* Votação disponível */}
            {enq.status === "Aberta" && !votou.includes(enq.id) && (
              <div className="flex flex-col gap-2">
                {enq.opcoes.map((op, idx) => (
                  <button
                    key={idx}
                    onClick={() => votar(enq.id, idx)}
                    className="rounded bg-yellow-400 px-3 py-1 font-semibold text-zinc-900 transition hover:bg-yellow-500 disabled:bg-gray-400"
                    disabled={votou.includes(enq.id)}
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            )}
            {/* Resultados - se fechada ou já votou */}
            {(enq.status === "Fechada" || votou.includes(enq.id)) && (
              <div className="mt-2 flex flex-col gap-2">
                {enq.opcoes.map((op, idx) => {
                  const percent = enq.totalVotos
                    ? Math.round((op.votos / enq.totalVotos) * 100)
                    : 0;
                  const maiorVoto = enq.opcoes.reduce(
                    (max, cur) => (cur.votos > max ? cur.votos : max),
                    0,
                  );
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex min-w-[80px] items-center gap-1 rounded bg-[#181818] px-2 py-1 text-xs text-gray-200">
                        {op.texto}
                        {op.votos === maiorVoto && maiorVoto > 0 && (
                          <span
                            className="ml-1 text-yellow-300"
                            title="Opção vencedora"
                          >
                            🏆
                          </span>
                        )}
                      </span>
                      <div className="relative mx-2 h-4 flex-1 rounded-full bg-[#181818]">
                        <div
                          className="h-4 rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-bold text-black">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {op.votos} votos
                      </span>
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
