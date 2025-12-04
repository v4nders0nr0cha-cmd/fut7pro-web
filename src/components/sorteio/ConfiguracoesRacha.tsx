"use client";

import { useState, useEffect } from "react";
import type { ConfiguracaoRacha } from "@/types/sorteio";
import { rachaConfig } from "@/config/racha.config";

interface Props {
  onSubmit: (config: ConfiguracaoRacha) => void;
  disabled?: boolean;
}

const DURACOES_RACHA = [60, 90, 120, 150];
const DURACOES_PARTIDA = Array.from({ length: 41 }, (_, i) => 5 + i); // 5~45min
const NUM_TIMES = [2, 3, 4, 5, 6];
const JOGADORES_POR_TIME = [5, 6, 7];

// Função sempre segura
function ensureNumber(val: unknown, allowed: number[], fallback: number): number {
  const n = Number(val);
  return allowed.includes(n) ? n : fallback;
}

export default function ConfiguracoesRacha({ onSubmit, disabled = false }: Props) {
  const [duracaoRachaMin, setDuracaoRachaMin] = useState<number>(DURACOES_RACHA[0]);
  const [duracaoPartidaMin, setDuracaoPartidaMin] = useState<number>(DURACOES_PARTIDA[0]);
  const [numTimes, setNumTimes] = useState<number>(NUM_TIMES[0]);
  const [jogadoresPorTime, setJogadoresPorTime] = useState<number>(JOGADORES_POR_TIME[0]);

  // Carrega do localStorage só quando monta
  useEffect(() => {
    try {
      const cfg = localStorage.getItem(rachaConfig.storage.configKey);
      if (cfg) {
        const obj = JSON.parse(cfg);
        if (typeof obj === "object" && obj) {
          setDuracaoRachaMin(ensureNumber(obj.duracaoRachaMin, DURACOES_RACHA, DURACOES_RACHA[0]));
          setDuracaoPartidaMin(
            ensureNumber(obj.duracaoPartidaMin, DURACOES_PARTIDA, DURACOES_PARTIDA[0])
          );
          setNumTimes(ensureNumber(obj.numTimes, NUM_TIMES, NUM_TIMES[0]));
          setJogadoresPorTime(
            ensureNumber(obj.jogadoresPorTime, JOGADORES_POR_TIME, JOGADORES_POR_TIME[0])
          );
        }
      }
    } catch {
      /* ignore */
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva no localStorage e executa onSubmit a cada alteração
  useEffect(() => {
    try {
      localStorage.setItem(
        rachaConfig.storage.configKey,
        JSON.stringify({ duracaoRachaMin, duracaoPartidaMin, numTimes, jogadoresPorTime })
      );
    } catch {
      /* ignore */
    }
    onSubmit({ duracaoRachaMin, duracaoPartidaMin, numTimes, jogadoresPorTime });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duracaoRachaMin, duracaoPartidaMin, numTimes, jogadoresPorTime]);

  // Se valores ficarem inválidos por alguma alteração externa, sempre recupera o fallback
  useEffect(() => {
    if (!DURACOES_RACHA.includes(duracaoRachaMin)) setDuracaoRachaMin(DURACOES_RACHA[0]);
    if (!DURACOES_PARTIDA.includes(duracaoPartidaMin)) setDuracaoPartidaMin(DURACOES_PARTIDA[0]);
    if (!NUM_TIMES.includes(numTimes)) setNumTimes(NUM_TIMES[0]);
    if (!JOGADORES_POR_TIME.includes(jogadoresPorTime)) setJogadoresPorTime(JOGADORES_POR_TIME[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duracaoRachaMin, duracaoPartidaMin, numTimes, jogadoresPorTime]);

  const fadeClasses = disabled
    ? "opacity-60 blur-[2px] pointer-events-none select-none transition-all duration-300"
    : "transition-all duration-300";

  return (
    <form className={`bg-[#202020] rounded-xl p-4 mb-6 flex flex-col gap-4 ${fadeClasses}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="duracao-racha" className="text-sm">
            Duração do Racha (min):
          </label>
          <select
            id="duracao-racha"
            value={duracaoRachaMin}
            onChange={(e) =>
              setDuracaoRachaMin(ensureNumber(e.target.value, DURACOES_RACHA, DURACOES_RACHA[0]))
            }
            className="w-full rounded p-1 bg-zinc-800 text-white"
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {DURACOES_RACHA.map((min) => (
              <option key={min} value={min}>
                {Math.floor(min / 60)}h{min % 60 > 0 ? ` ${min % 60}min` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="duracao-partida" className="text-sm">
            Duração da Partida (min):
          </label>
          <select
            id="duracao-partida"
            value={duracaoPartidaMin}
            onChange={(e) =>
              setDuracaoPartidaMin(
                ensureNumber(e.target.value, DURACOES_PARTIDA, DURACOES_PARTIDA[0])
              )
            }
            className="w-full rounded p-1 bg-zinc-800 text-white"
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {DURACOES_PARTIDA.map((min) => (
              <option key={min} value={min}>
                {min} min
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="num-times" className="text-sm">
            Nº de Times:
          </label>
          <select
            id="num-times"
            value={numTimes}
            onChange={(e) => setNumTimes(ensureNumber(e.target.value, NUM_TIMES, NUM_TIMES[0]))}
            className="w-full rounded p-1 bg-zinc-800 text-white"
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {NUM_TIMES.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="jogadores-por-time" className="text-sm">
            Jogadores por Time{" "}
            <span className="text-xs text-gray-400">(contando com o goleiro)</span>:
          </label>
          <select
            id="jogadores-por-time"
            value={jogadoresPorTime}
            onChange={(e) =>
              setJogadoresPorTime(
                ensureNumber(e.target.value, JOGADORES_POR_TIME, JOGADORES_POR_TIME[0])
              )
            }
            className="w-full rounded p-1 bg-zinc-800 text-white"
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            {JOGADORES_POR_TIME.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
