"use client";

import { useEffect, useMemo, useState } from "react";
import CardTimeDoDia, { type TimeDoDia, type JogadorTime } from "@/components/cards/CardTimeDoDia";
import ConfrontosDoDia from "@/components/lists/ConfrontosDoDia";
import { usePartidas } from "@/hooks/usePartidas";
import { teamLogoMap, logoPadrao } from "@/config/teamLogoMap";
import type { Partida } from "@/types/partida";

type StoredJogador = {
  id?: string;
  nome?: string;
  apelido?: string | null;
  foto?: string | null;
  posicao?: string | null;
  status?: string | null;
};

function parseJogadores(raw?: string | null): StoredJogador[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item === "object");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao interpretar jogadores da partida", error);
    }
  }
  return [];
}

function normalizarData(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function formatarRotuloData(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

const POSICAO_ORDEM: Record<string, number> = {
  GOL: 0,
  GOLEIRO: 0,
  ZAG: 1,
  ZAGUEIRO: 1,
  MEI: 2,
  MEIA: 2,
  ATA: 3,
  ATACANTE: 3,
};

const DEFAULT_STATUS = "titular";

function mapJogadorParaTime(jogador: StoredJogador, fallbackId: string): JogadorTime {
  const status = (jogador.status ?? DEFAULT_STATUS) as JogadorTime["status"];
  return {
    id: jogador.id || fallbackId,
    nome: jogador.nome ?? "Jogador",
    apelido: jogador.apelido ?? undefined,
    foto: jogador.foto ?? logoPadrao,
    posicao: jogador.posicao ?? undefined,
    status,
  };
}

function construirTimes(partidas: Partida[]): TimeDoDia[] {
  const times = new Map<string, TimeDoDia>();
  const idsRegistradosPorTime = new Map<string, Set<string>>();

  const garantirTime = (nome: string) => {
    if (!times.has(nome)) {
      times.set(nome, {
        id: nome,
        nome,
        logo: teamLogoMap[nome] ?? logoPadrao,
        cor: "#facc15",
        jogadores: [],
      });
      idsRegistradosPorTime.set(nome, new Set());
    }
    return times.get(nome)!;
  };

  const adicionarJogadores = (nomeTime: string, jogadoresBrutos: StoredJogador[]) => {
    const time = garantirTime(nomeTime);
    const idsRegistrados = idsRegistradosPorTime.get(nomeTime)!;

    jogadoresBrutos.forEach((jogador, index) => {
      const fallbackId = `${nomeTime}-${index}-${time.jogadores.length}`;
      const idNormalizado = jogador.id || fallbackId;
      if (idsRegistrados.has(idNormalizado)) {
        return;
      }
      idsRegistrados.add(idNormalizado);
      time.jogadores.push(mapJogadorParaTime(jogador, fallbackId));
    });
  };

  partidas.forEach((partida) => {
    adicionarJogadores(partida.timeA, parseJogadores(partida.jogadoresA));
    adicionarJogadores(partida.timeB, parseJogadores(partida.jogadoresB));
  });

  return Array.from(times.values()).map((time) => ({
    ...time,
    jogadores: [...time.jogadores].sort((a, b) => {
      const ordemA = POSICAO_ORDEM[a.posicao?.toUpperCase() ?? ""] ?? 99;
      const ordemB = POSICAO_ORDEM[b.posicao?.toUpperCase() ?? ""] ?? 99;
      if (ordemA !== ordemB) return ordemA - ordemB;
      return a.nome.localeCompare(b.nome);
    }),
  }));
}

export default function TimesDoDiaClient() {
  const { partidas, isLoading, isError, error } = usePartidas();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const datasDisponiveis = useMemo(() => {
    const datas = partidas
      .map((partida) => partida.data && normalizarData(partida.data))
      .filter((valor): valor is string => Boolean(valor));
    return Array.from(new Set(datas)).sort((a, b) => b.localeCompare(a));
  }, [partidas]);

  useEffect(() => {
    if (datasDisponiveis.length === 0) {
      setSelectedDate(null);
      return;
    }
    if (!selectedDate || !datasDisponiveis.includes(selectedDate)) {
      setSelectedDate(datasDisponiveis[0]);
    }
  }, [datasDisponiveis, selectedDate]);

  const partidasDoDia = useMemo(() => {
    if (!selectedDate) return [];
    return partidas
      .filter((partida) => partida.data && normalizarData(partida.data) === selectedDate)
      .sort((a, b) => (a.horario || "").localeCompare(b.horario || ""));
  }, [partidas, selectedDate]);

  const timesDoDia = useMemo(() => construirTimes(partidasDoDia), [partidasDoDia]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <span className="mt-3 text-sm">Carregando escalações...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-300 mb-2">Erro ao buscar times do dia</h3>
        <p className="text-sm text-red-200">{error ?? "Tente novamente em instantes."}</p>
      </div>
    );
  }

  if (datasDisponiveis.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center text-neutral-300">
        Nenhuma partida publicada para exibir. Publique o sorteio no painel admin para liberar esta
        seção.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-xl font-semibold text-neutral-200">Escalações do dia</h3>
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          <span>Data:</span>
          <select
            value={selectedDate ?? ""}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-neutral-100"
          >
            {datasDisponiveis.map((data) => (
              <option key={data} value={data}>
                {formatarRotuloData(data)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {timesDoDia.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center text-neutral-300">
          Ainda não há escalações publicadas para esta data.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {timesDoDia.map((time) => (
            <CardTimeDoDia key={time.id ?? time.nome} time={time} />
          ))}
        </div>
      )}

      <ConfrontosDoDia partidas={partidasDoDia} />
    </div>
  );
}
