// src/components/admin/SelecionarResultados.tsx
import { useState } from "react";

interface Jogador {
  id: string;
  nome: string;
}

interface Resultados {
  gols: { jogadorId: string; gols: number }[];
  assistencias: { jogadorId: string; assistencias: number }[];
  cartoes: { jogadorId: string; tipo: "amarelo" | "vermelho" }[];
  zagueiroDestaque: string;
  placar: { timeA: number; timeB: number };
}

interface Props {
  jogadores: Jogador[];
  resultados: Resultados;
  setResultados: (res: Resultados) => void;
}

export default function SelecionarResultados({
  jogadores,
  resultados,
  setResultados,
}: Props) {
  const [placarA, setPlacarA] = useState(resultados.placar.timeA || 0);
  const [placarB, setPlacarB] = useState(resultados.placar.timeB || 0);

  // Helpers para atualizar os campos:
  function toggleGol(jogadorId: string, add = true) {
    setResultados({
      ...resultados,
      gols: add
        ? [
            ...resultados.gols.filter((g) => g.jogadorId !== jogadorId),
            { jogadorId, gols: 1 },
          ]
        : resultados.gols.filter((g) => g.jogadorId !== jogadorId),
    });
  }

  function setGol(jogadorId: string, value: number) {
    setResultados({
      ...resultados,
      gols: [
        ...resultados.gols.filter((g) => g.jogadorId !== jogadorId),
        ...(value > 0 ? [{ jogadorId, gols: value }] : []),
      ],
    });
  }

  function setAssist(jogadorId: string, value: number) {
    setResultados({
      ...resultados,
      assistencias: [
        ...resultados.assistencias.filter((a) => a.jogadorId !== jogadorId),
        ...(value > 0 ? [{ jogadorId, assistencias: value }] : []),
      ],
    });
  }

  function setCartao(jogadorId: string, tipo: "amarelo" | "vermelho") {
    setResultados({
      ...resultados,
      cartoes: [
        ...resultados.cartoes.filter((c) => c.jogadorId !== jogadorId),
        { jogadorId, tipo },
      ],
    });
  }

  function setZagueiro(jogadorId: string) {
    setResultados({ ...resultados, zagueiroDestaque: jogadorId });
  }

  function updatePlacarA(value: number) {
    setPlacarA(value);
    setResultados({
      ...resultados,
      placar: { ...resultados.placar, timeA: value },
    });
  }

  function updatePlacarB(value: number) {
    setPlacarB(value);
    setResultados({
      ...resultados,
      placar: { ...resultados.placar, timeB: value },
    });
  }

  return (
    <section className="mb-6 w-full max-w-3xl rounded-2xl bg-zinc-800 p-4 shadow-lg">
      <h2 className="mb-2 text-lg font-bold text-yellow-300">
        Lançamento de Resultados
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="font-bold text-yellow-200">Placar do Jogo:</span>
          <input
            type="number"
            min={0}
            value={placarA}
            onChange={(e) => updatePlacarA(Number(e.target.value))}
            className="w-12 rounded-lg bg-zinc-700 px-2 py-1 text-center font-bold text-yellow-200 outline-none"
            aria-label="Placar time campeão"
          />
          <span className="text-xl font-bold text-yellow-200">x</span>
          <input
            type="number"
            min={0}
            value={placarB}
            onChange={(e) => updatePlacarB(Number(e.target.value))}
            className="w-12 rounded-lg bg-zinc-700 px-2 py-1 text-center font-bold text-yellow-200 outline-none"
            aria-label="Placar time adversário"
          />
        </div>
        <hr className="my-2 border-zinc-700" />

        <h3 className="font-semibold text-yellow-200">
          Selecione autores dos gols e assistências:
        </h3>
        <div className="flex flex-wrap gap-4">
          {jogadores.map((j) => (
            <div
              key={j.id}
              className="flex flex-col items-center gap-1 rounded-lg bg-zinc-700 px-3 py-2"
            >
              <span className="font-semibold text-yellow-200">{j.nome}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Gols:</span>
                <input
                  type="number"
                  min={0}
                  value={
                    resultados.gols.find((g) => g.jogadorId === j.id)?.gols ||
                    ""
                  }
                  onChange={(e) => setGol(j.id, Number(e.target.value))}
                  className="w-10 rounded bg-zinc-900 px-1 text-yellow-200 outline-none"
                  aria-label={`Gols de ${j.nome}`}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Assist:</span>
                <input
                  type="number"
                  min={0}
                  value={
                    resultados.assistencias.find((a) => a.jogadorId === j.id)
                      ?.assistencias || ""
                  }
                  onChange={(e) => setAssist(j.id, Number(e.target.value))}
                  className="w-10 rounded bg-zinc-900 px-1 text-yellow-200 outline-none"
                  aria-label={`Assistências de ${j.nome}`}
                />
              </div>
              <div className="mt-1 flex items-center gap-1">
                <button
                  onClick={() => setCartao(j.id, "amarelo")}
                  className={`h-7 w-7 rounded-full border-2 ${
                    resultados.cartoes.find(
                      (c) => c.jogadorId === j.id && c.tipo === "amarelo",
                    )
                      ? "border-yellow-400 bg-yellow-500/70"
                      : "border-yellow-400 bg-zinc-900"
                  }`}
                  title="Cartão Amarelo"
                ></button>
                <button
                  onClick={() => setCartao(j.id, "vermelho")}
                  className={`h-7 w-7 rounded-full border-2 ${
                    resultados.cartoes.find(
                      (c) => c.jogadorId === j.id && c.tipo === "vermelho",
                    )
                      ? "border-red-500 bg-red-600/70"
                      : "border-red-500 bg-zinc-900"
                  }`}
                  title="Cartão Vermelho"
                ></button>
              </div>
              <div className="mt-1 flex gap-1">
                <label className="flex items-center gap-1 text-xs text-gray-300">
                  <input
                    type="radio"
                    checked={resultados.zagueiroDestaque === j.id}
                    onChange={() => setZagueiro(j.id)}
                    name="zagueiroDestaque"
                    className="accent-yellow-400"
                  />
                  Zagueiro do Dia
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
