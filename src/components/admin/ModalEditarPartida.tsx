"use client";
import { useState, useEffect } from "react";
import { Confronto, Time, Jogador } from "@/types/interfaces";

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
    eventos: EventoGol[],
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
  const resultado =
    tipo === "ida" ? confronto.resultadoIda : confronto.resultadoVolta;
  const partida = tipo === "ida" ? confronto.ida : confronto.volta;

  const [placar, setPlacar] = useState<{ a: number; b: number }>(
    resultado?.placar ?? { a: 0, b: 0 },
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
      <div className="animate-in fade-in relative w-full max-w-2xl rounded-2xl bg-zinc-900 p-7 shadow-2xl">
        <button
          className="absolute right-4 top-3 text-2xl text-gray-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="mb-4 text-center text-2xl font-bold text-yellow-400">
          Resultado - {nomeTimeA} <span className="text-white">x</span>{" "}
          {nomeTimeB}
        </h2>
        <div className="mb-5 flex items-center justify-between">
          <div className="w-1/3 text-center">
            <div className="mb-1 text-lg font-bold text-white">{nomeTimeA}</div>
            <div className="text-3xl font-black text-yellow-300">
              {placar.a}
            </div>
            <button
              className="mt-2 rounded-lg bg-yellow-400 px-4 py-1 text-sm font-bold text-black transition hover:bg-yellow-300"
              onClick={() => abrirAdicionarGol("a")}
            >
              + Adicionar Gol
            </button>
          </div>
          <div className="text-4xl font-bold text-yellow-300">×</div>
          <div className="w-1/3 text-center">
            <div className="mb-1 text-lg font-bold text-white">{nomeTimeB}</div>
            <div className="text-3xl font-black text-yellow-300">
              {placar.b}
            </div>
            <button
              className="mt-2 rounded-lg bg-yellow-400 px-4 py-1 text-sm font-bold text-black transition hover:bg-yellow-300"
              onClick={() => abrirAdicionarGol("b")}
            >
              + Adicionar Gol
            </button>
          </div>
        </div>
        {/* Lista de eventos */}
        {eventos.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 font-bold text-yellow-300">
              Gols e Assistências
            </h3>
            <ul>
              {eventos.map((ev, idx) => (
                <li
                  key={idx}
                  className="mb-1 flex items-center gap-2 rounded bg-zinc-800 px-2 py-1 text-sm text-white"
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
                    className="ml-auto rounded bg-red-700 px-2 py-1 text-xs hover:bg-red-600"
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
          className="mt-5 w-full rounded-xl bg-green-500 py-3 text-xl font-extrabold text-black shadow-lg transition hover:bg-green-400"
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
    <div className="z-60 animate-in fade-in fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-md rounded-2xl border border-yellow-400 bg-zinc-900 p-6 shadow-2xl">
        <button
          className="absolute right-4 top-3 text-2xl text-gray-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h3 className="mb-4 text-center text-lg font-bold text-yellow-300">
          Adicionar Gol e Assistência
        </h3>
        <div className="mb-4">
          <label className="text-sm font-semibold text-white">
            Gol do Jogador
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-zinc-800 px-3 py-2 text-yellow-200 shadow"
            value={jogador}
            onChange={(e) => setJogador(e.target.value)}
          >
            <option value="">Selecione...</option>
            {jogadores.map((j, i) => (
              <option key={i} value={j.nome}>
                {j.nome} ({j.apelido} / {j.pos})
              </option>
            ))}
            <option value="faltou">
              JOGADOR FALTOU, NÃO CONTABILIZAR PARA O SUBSTITUTO
            </option>
          </select>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-white">
            Assistência do Jogador
          </label>
          <select
            className="mt-1 w-full rounded-lg bg-zinc-800 px-3 py-2 text-yellow-200 shadow"
            value={assist}
            onChange={(e) => setAssist(e.target.value)}
          >
            <option value="">Selecione...</option>
            {jogadores.map((j, i) => (
              <option key={i} value={j.nome}>
                {j.nome} ({j.apelido} / {j.pos})
              </option>
            ))}
            <option value="faltou">
              JOGADOR FALTOU, NÃO CONTABILIZAR PARA O SUBSTITUTO
            </option>
          </select>
        </div>
        <button
          className="mt-3 w-full rounded-lg bg-yellow-400 py-2 text-lg font-bold text-black transition hover:bg-yellow-300"
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
