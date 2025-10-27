#!/usr/bin/env ts-node
// @ts-nocheck

import { addDays, startOfDay, endOfDay } from "date-fns";
import { argv, exit } from "node:process";
import type { Partida } from "@prisma/client";
import { prisma } from "../src/server/prisma";

interface Jogador {
  id: string;
  nome?: string;
  apelido?: string | null;
  foto?: string | null;
  posicao?: string | null;
  status?: string | null;
  gols?: number;
  assistencias?: number;
}

interface EventosEquipe {
  gols: Array<{ atletaId: string; qtd: number }>;
  assistencias: Array<{ atletaId: string; qtd: number }>;
}

function getArg(name: string) {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : undefined;
}

const slug = getArg("slug") ?? process.env.SEED_SLUG;
const dateArg = getArg("date");
const startArg = getArg("start");
const endArg = getArg("end");
const daysArg = getArg("days");
const force = argv.includes("--force");

if (!slug) {
  console.error("Erro: informe --slug ou defina SEED_SLUG.");
  exit(1);
}

function toDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    console.error(`Data inválida: ${value}`);
    exit(1);
  }
  return parsed;
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

let rangeStart: Date;
let rangeEnd: Date;

if (dateArg) {
  rangeStart = startOfDay(toDate(dateArg));
  rangeEnd = addDays(rangeStart, 1);
} else if (startArg && endArg) {
  rangeStart = startOfDay(toDate(startArg));
  rangeEnd = addDays(startOfDay(toDate(endArg)), 1);
} else {
  const days = Math.max(1, parseInt(daysArg ?? "1", 10));
  rangeEnd = endOfDay(new Date());
  rangeEnd.setHours(24, 0, 0, 0);
  rangeStart = addDays(rangeEnd, -days);
}

function parseJogadores(raw: Partida["jogadoresA"]): Jogador[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const nome =
          typeof record.nome === "string" && record.nome.trim().length > 0
            ? record.nome.trim()
            : `Jogador ${index + 1}`;
        const id =
          typeof record.id === "string" && record.id.trim().length > 0
            ? record.id.trim()
            : `${nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
        return {
          id,
          nome,
          apelido: typeof record.apelido === "string" ? record.apelido : null,
          foto: typeof record.foto === "string" ? record.foto : null,
          posicao: typeof record.posicao === "string" ? record.posicao : null,
          status: typeof record.status === "string" ? record.status : null,
          gols: typeof record.gols === "number" ? record.gols : Number(record.gols ?? 0) || 0,
          assistencias:
            typeof record.assistencias === "number"
              ? record.assistencias
              : Number(record.assistencias ?? 0) || 0,
        } satisfies Jogador;
      })
      .filter((player): player is Jogador => Boolean(player));
  } catch (error) {
    console.warn("Falha ao interpretar jogadores", error);
    return [];
  }
}

function serializeJogadores(jogadores: Jogador[]): string {
  const normalized = jogadores.map((player) => ({
    ...player,
    gols: player.gols ?? 0,
    assistencias: player.assistencias ?? 0,
  }));
  return JSON.stringify(normalized);
}

function pickScorers(total: number, elenco: Jogador[]): EventosEquipe["gols"] {
  if (total <= 0 || elenco.length === 0) return [];
  const candidatos = [...elenco];
  const quantidade = Math.min(total, Math.min(3, candidatos.length));
  const picks: Record<string, number> = {};

  for (let i = 0; i < quantidade; i++) {
    const idx = Math.floor(Math.random() * candidatos.length);
    const jogador = candidatos.splice(idx, 1)[0]!;
    picks[jogador.id] = 0;
  }

  const ids = Object.keys(picks);
  for (let g = 0; g < total; g++) {
    const alvo = ids[Math.floor(Math.random() * ids.length)];
    picks[alvo] += 1;
  }

  return Object.entries(picks).map(([atletaId, qtd]) => ({ atletaId, qtd }));
}

function pickAssists(
  totalGols: number,
  elenco: Jogador[],
  bloqueados: Set<string>
): EventosEquipe["assistencias"] {
  if (totalGols <= 0 || elenco.length === 0) return [];
  const candidatos = elenco.filter((jogador) => !bloqueados.has(jogador.id));
  if (candidatos.length === 0) return [];

  const assistencias: Record<string, number> = {};
  for (let i = 0; i < totalGols; i++) {
    const jogador = candidatos[Math.floor(Math.random() * candidatos.length)];
    assistencias[jogador.id] = (assistencias[jogador.id] || 0) + 1;
  }

  return Object.entries(assistencias).map(([atletaId, qtd]) => ({ atletaId, qtd }));
}

function aplicarEventos(jogadores: Jogador[], eventos: EventosEquipe) {
  const map = new Map(jogadores.map((jogador) => [jogador.id, jogador] as const));

  eventos.gols.forEach(({ atletaId, qtd }) => {
    const alvo = map.get(atletaId);
    if (alvo) {
      alvo.gols = (alvo.gols ?? 0) + qtd;
    }
  });

  eventos.assistencias.forEach(({ atletaId, qtd }) => {
    const alvo = map.get(atletaId);
    if (alvo) {
      alvo.assistencias = (alvo.assistencias ?? 0) + qtd;
    }
  });

  return Array.from(map.values());
}

async function main() {
  const racha = await prisma.racha.findUnique({ where: { slug } });
  if (!racha) {
    console.error(`Racha não encontrado para slug=${slug}`);
    exit(1);
  }

  console.log(
    `[backfill] slug=${slug} intervalo ${ymd(rangeStart)}..${ymd(addDays(rangeEnd, -1))} force=${force}`
  );

  const partidas = await prisma.partida.findMany({
    where: {
      rachaId: racha.id,
      data: { gte: rangeStart, lt: rangeEnd },
    },
    orderBy: [{ data: "asc" }],
  });

  console.log(`[backfill] Partidas encontradas: ${partidas.length}`);

  for (const partida of partidas) {
    const jogadoresA = parseJogadores(partida.jogadoresA);
    const jogadoresB = parseJogadores(partida.jogadoresB);

    const possuiStatsA = jogadoresA.some((j) => (j.gols ?? 0) > 0 || (j.assistencias ?? 0) > 0);
    const possuiStatsB = jogadoresB.some((j) => (j.gols ?? 0) > 0 || (j.assistencias ?? 0) > 0);

    if (!force && (possuiStatsA || possuiStatsB)) {
      console.log(`- ${partida.id} ${ymd(partida.data)} já possui estatísticas, pulando`);
      continue;
    }

    if (!jogadoresA.length && !jogadoresB.length) {
      console.log(`- ${partida.id} ${ymd(partida.data)} sem elenco, pulando`);
      continue;
    }

    const golsA = Math.max(0, partida.golsTimeA ?? 0);
    const golsB = Math.max(0, partida.golsTimeB ?? 0);

    const eventosA: EventosEquipe = {
      gols: pickScorers(golsA, jogadoresA),
      assistencias: [],
    };
    const eventosB: EventosEquipe = {
      gols: pickScorers(golsB, jogadoresB),
      assistencias: [],
    };

    eventosA.assistencias = pickAssists(
      eventosA.gols.reduce((total, item) => total + item.qtd, 0),
      jogadoresA,
      new Set(eventosA.gols.map((item) => item.atletaId))
    );

    eventosB.assistencias = pickAssists(
      eventosB.gols.reduce((total, item) => total + item.qtd, 0),
      jogadoresB,
      new Set(eventosB.gols.map((item) => item.atletaId))
    );

    const atualizadosA = aplicarEventos(jogadoresA, eventosA);
    const atualizadosB = aplicarEventos(jogadoresB, eventosB);

    await prisma.partida.update({
      where: { id: partida.id },
      data: {
        jogadoresA: serializeJogadores(atualizadosA),
        jogadoresB: serializeJogadores(atualizadosB),
      },
    });

    console.log(
      `- ${partida.id} ${ymd(partida.data)} ok: golsA=${golsA} golsB=${golsB} atletas[A]=${atualizadosA.length} atletas[B]=${atualizadosB.length}`
    );
  }

  console.log("[backfill] Concluído.");
  exit(0);
}

main().catch((error) => {
  console.error(error);
  exit(1);
});
