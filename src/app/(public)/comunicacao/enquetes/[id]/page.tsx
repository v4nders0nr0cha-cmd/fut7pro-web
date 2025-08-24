"use client";
import { useState } from "react";
import { FaPoll } from "react-icons/fa";

type Opcao = { texto: string; votos: number };
type Enquete = {
  id: number;
  titulo: string;
  descricao: string;
  opcoes: Opcao[];
  status: "Aberta" | "Fechada";
  totalVotos: number;
  respondida: boolean;
};

const MOCK_ENQUETE: Enquete = {
  id: 2,
  titulo: "Qual melhor horário para o próximo racha?",
  descricao: "Participe! Ajude a escolher o melhor horário para todos.",
  opcoes: [
    { texto: "19:00", votos: 10 },
    { texto: "20:00", votos: 17 },
    { texto: "21:00", votos: 4 },
  ],
  status: "Aberta",
  totalVotos: 31,
  respondida: false,
};

export default function EnquetePage() {
  const [enquete, setEnquete] = useState(MOCK_ENQUETE);
  const [resposta, setResposta] = useState<number | null>(null);

  function votar() {
    if (resposta === null) return;
    setEnquete((prev) => ({
      ...prev,
      opcoes: prev.opcoes.map((op, idx) =>
        idx === resposta ? { ...op, votos: op.votos + 1 } : op,
      ),
      totalVotos: prev.totalVotos + 1,
      respondida: true,
    }));
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-20">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold text-yellow-400">
        <FaPoll /> {enquete.titulo}
      </h1>
      <div className="mb-4 text-gray-200">{enquete.descricao}</div>
      <div className="mb-6">
        {enquete.status === "Fechada" || enquete.respondida ? (
          <>
            <div className="mb-2 font-bold text-green-400">
              {enquete.status === "Fechada"
                ? "Enquete encerrada."
                : "Seu voto foi computado!"}
            </div>
            <div>
              {enquete.opcoes.map((op, idx) => {
                const percent = enquete.totalVotos
                  ? Math.round((op.votos / enquete.totalVotos) * 100)
                  : 0;
                return (
                  <div key={idx} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="min-w-[64px] font-medium text-gray-300">
                        {op.texto}
                      </span>
                      <div className="relative mx-2 h-3 flex-1 rounded-full bg-zinc-700">
                        <div
                          className="h-3 rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-black">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-300">
                        {op.votos} votos
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              votar();
            }}
          >
            {enquete.opcoes.map((op, idx) => (
              <label
                key={idx}
                className="flex cursor-pointer items-center gap-3 rounded bg-zinc-900 p-2 text-gray-200 hover:bg-zinc-800"
              >
                <input
                  type="radio"
                  name="opcao"
                  checked={resposta === idx}
                  onChange={() => setResposta(idx)}
                  className="accent-yellow-400"
                />
                {op.texto}
              </label>
            ))}
            <button
              type="submit"
              disabled={resposta === null}
              className="mt-2 rounded bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-500"
            >
              Votar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
