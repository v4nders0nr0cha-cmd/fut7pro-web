"use client";
import { useState, useEffect } from "react";
import type { Confronto, Time, Jogador } from "@/types/interfaces";

// Interface específica para evento de gol
type EventoGol = {
  time: "a" | "b";
  jogador: string | "faltou";
  assistencia: string | "faltou";
};

// Interface para resultado de partida
interface ResultadoPartida {
  placar: { a: number; b: number };
  eventos: EventoGol[];
}

// Interface para confronto com resultados
interface ConfrontoComResultados extends Confronto {
  resultadoIda?: ResultadoPartida;
  resultadoVolta?: ResultadoPartida;
  ida?: { a: number; b: number };
  volta?: { a: number; b: number };
}

interface Props {
  index: number;
  confronto: ConfrontoComResultados;
  tipo: "ida" | "volta";
  times: Time[];
  onClose: () => void;
  onSalvar: (
    index: number,
    tipo: "ida" | "volta",
    placar: { a: number; b: number },
    eventos: EventoGol[]
  ) => void;
}

export default function ModalEditarPartida({
  index,
  confronto,
  tipo,
  times,
  onClose,
  onSalvar,
}: Props) {
  // Usa o resultado correto (ida ou volta)
  const resultado = tipo === "ida" ? confronto.resultadoIda : confronto.resultadoVolta;
  const partida = tipo === "ida" ? confronto.ida : confronto.volta;

  const [placar, setPlacar] = useState<{ a: number; b: number }>(
    resultado?.placar ?? { a: 0, b: 0 }
  );
  const [eventos, setEventos] = useState<EventoGol[]>(resultado?.eventos ?? []);
  const [adicionar, setAdicionar] = useState<"a" | "b" | null>(null);

  useEffect(() => {
    setPlacar(resultado?.placar ?? { a: 0, b: 0 });
    setEventos(resultado?.eventos ?? []);
  }, [resultado]);

  const nomeTimeA = times[partida?.a]?.nome ?? "-";
  const nomeTimeB = times[partida?.b]?.nome ?? "-";
  const jogadoresA = times[partida?.a]?.jogadores ?? [];
  const jogadoresB = times[partida?.b]?.jogadores ?? [];

  function abrirAdicionarGol(time: "a" | "b") {
    setAdicionar(time);
  }
  function salvarEvento(time: "a" | "b", jogador: string, assistencia: string) {
    setEventos([...eventos, { time, jogador, assistencia }]);
    setPlacar((p) => ({
      ...p,
      [time]: p[time] + 1,
    }));
    setAdicionar(null);
  }
  function excluirEvento(idx: number) {
    const evento = eventos[idx];
    if (!evento) return;
    setEventos(eventos.filter((_, i) => i !== idx));
    setPlacar((p) => ({
      ...p,
      [evento.time]: p[evento.time] - 1,
    }));
  }
  function jogadorLabel(j: string) {
    if (j === "faltou") return "JOGADOR FALTOU (gol/assist sem vínculo)";
    return j;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl p-7 relative animate-in fade-in">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">
          Resultado - {nomeTimeA} <span className="text-white">x</span> {nomeTimeB}
        </h2>
        <div className="flex items-center justify-between mb-5">
          <div className="w-1/3 text-center">
            <div className="text-lg font-bold text-white mb-1">{nomeTimeA}</div>
            <div className="text-3xl font-black text-yellow-300">{placar.a}</div>
            <button
              className="mt-2 px-4 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-sm transition"
              onClick={() => abrirAdicionarGol("a")}
            >
              + Adicionar Gol
            </button>
          </div>
          <div className="text-4xl font-bold text-yellow-300">×</div>
          <div className="w-1/3 text-center">
            <div className="text-lg font-bold text-white mb-1">{nomeTimeB}</div>
            <div className="text-3xl font-black text-yellow-300">{placar.b}</div>
            <button
              className="mt-2 px-4 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-sm transition"
              onClick={() => abrirAdicionarGol("b")}
            >
              + Adicionar Gol
            </button>
          </div>
        </div>
        {/* Lista de eventos */}
        {eventos.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-yellow-300 mb-2">Gols e Assistências</h3>
            <ul>
              {eventos.map((ev, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 mb-1 text-white text-sm bg-zinc-800 rounded px-2 py-1"
                >
                  <span className="font-semibold text-yellow-300">
                    {ev.time === "a" ? nomeTimeA : nomeTimeB}
                  </span>
                  <span>– Gol:</span>
                  <span className="font-bold">{jogadorLabel(ev.jogador)}</span>
                  <span>| Assistência:</span>
                  <span>{jogadorLabel(ev.assistencia)}</span>
                  <button
                    onClick={() => excluirEvento(idx)}
                    className="ml-auto text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {adicionar && (
          <AdicionarGolAssist
            jogadores={adicionar === "a" ? jogadoresA : jogadoresB}
            onSalvar={(j, a) => salvarEvento(adicionar, j, a)}
            onClose={() => setAdicionar(null)}
          />
        )}
        {/* Botão de salvar resultado */}
        <button
          className="w-full py-3 mt-5 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-xl text-xl shadow-lg transition"
          onClick={() => onSalvar(index, tipo, placar, eventos)}
        >
          Salvar Resultado
        </button>
      </div>
    </div>
  );
}

function AdicionarGolAssist({
  jogadores,
  onSalvar,
  onClose,
}: {
  jogadores: Jogador[];
  onSalvar: (jogador: string, assistencia: string) => void;
  onClose: () => void;
}) {
  const [jogador, setJogador] = useState<string>("");
  const [assist, setAssist] = useState<string>("");

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-80 animate-in fade-in">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-yellow-400">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h3 className="text-lg font-bold text-yellow-300 mb-4 text-center">
          Adicionar Gol e Assistência
        </h3>
        <div className="mb-4">
          <label className="font-semibold text-white text-sm">Gol do Jogador</label>
          <select
            className="w-full mt-1 px-3 py-2 bg-zinc-800 text-yellow-200 rounded-lg shadow"
            value={jogador}
            onChange={(e) => setJogador(e.target.value)}
          >
            <option value="">Selecione...</option>
            {jogadores.map((j, i) => (
              <option key={i} value={j.nome}>
                {j.nome} ({j.nickname} / {j.posicao})
              </option>
            ))}
            <option value="faltou">JOGADOR FALTOU, NÃO CONTABILIZAR PARA O SUBSTITUTO</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="font-semibold text-white text-sm">Assistência do Jogador</label>
          <select
            className="w-full mt-1 px-3 py-2 bg-zinc-800 text-yellow-200 rounded-lg shadow"
            value={assist}
            onChange={(e) => setAssist(e.target.value)}
          >
            <option value="">Selecione...</option>
            {jogadores.map((j, i) => (
              <option key={i} value={j.nome}>
                {j.nome} ({j.nickname} / {j.posicao})
              </option>
            ))}
            <option value="faltou">JOGADOR FALTOU, NÃO CONTABILIZAR PARA O SUBSTITUTO</option>
          </select>
        </div>
        <button
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-lg transition mt-3"
          disabled={!jogador}
          onClick={() => {
            onSalvar(jogador, assist || "faltou");
            onClose();
          }}
        >
          Salvar Gol
        </button>
      </div>
    </div>
  );
}
