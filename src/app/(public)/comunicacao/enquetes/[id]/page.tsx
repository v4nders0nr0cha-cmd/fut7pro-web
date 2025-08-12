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
        idx === resposta ? { ...op, votos: op.votos + 1 } : op
      ),
      totalVotos: prev.totalVotos + 1,
      respondida: true,
    }));
  }

  return (
    <main className="max-w-xl mx-auto px-4 pt-20 pb-24">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <FaPoll /> {enquete.titulo}
      </h1>
      <div className="mb-4 text-gray-200">{enquete.descricao}</div>
      <div className="mb-6">
        {enquete.status === "Fechada" || enquete.respondida ? (
          <>
            <div className="text-green-400 font-bold mb-2">
              {enquete.status === "Fechada" ? "Enquete encerrada." : "Seu voto foi computado!"}
            </div>
            <div>
              {enquete.opcoes.map((op, idx) => {
                const percent = enquete.totalVotos
                  ? Math.round((op.votos / enquete.totalVotos) * 100)
                  : 0;
                return (
                  <div key={idx} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-medium min-w-[64px]">{op.texto}</span>
                      <div className="flex-1 bg-zinc-700 rounded-full h-3 mx-2 relative">
                        <div
                          className="bg-yellow-400 h-3 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 text-xs text-black font-bold">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-gray-300 text-xs">{op.votos} votos</span>
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
                className="flex items-center gap-3 cursor-pointer text-gray-200 bg-zinc-900 p-2 rounded hover:bg-zinc-800"
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
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded"
            >
              Votar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
