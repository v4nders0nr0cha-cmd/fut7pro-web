"use client";

import type { PublicMatch } from "@/types/partida";

export type JogadorDestaque = {
  id?: string;
  timeId?: string;
  nome: string;
  apelido?: string;
  pos: string;
  foto?: string | null;
};

export type TimeDestaque = {
  id?: string;
  nome: string;
  logoUrl?: string | null;
  cor?: string | null;
  jogadores: JogadorDestaque[];
};

export type EventoGolV2 = {
  time: "a" | "b";
  jogadorId?: string;
  jogador: string;
  assistenciaId?: string;
  assistencia: string;
};
export type ResultadoPartidaV2 = { placar: { a: number; b: number }; eventos: EventoGolV2[] };
export type ConfrontoV2 = {
  ida: { a: number; b: number };
  volta: { a: number; b: number };
  resultadoIda?: ResultadoPartidaV2 | null;
  resultadoVolta?: ResultadoPartidaV2 | null;
};

export type DestaquesDoDia = {
  confrontos: ConfrontoV2[];
  times: TimeDestaque[];
  dataReferencia: string | null;
};

type BackendTeam = {
  id?: string | null;
  name?: string | null;
  logoUrl?: string | null;
  color?: string | null;
};

type BackendAthlete = {
  id?: string;
  name?: string;
  nickname?: string | null;
  position?: string | null;
  photoUrl?: string | null;
};

type BackendPresence = {
  id?: string;
  status?: string | null;
  teamId?: string | null;
  team?: BackendTeam | null;
  athlete?: BackendAthlete | null;
  goals?: number | null;
  assists?: number | null;
};

export type BackendMatchLike = {
  id?: string;
  date?: string | null;
  data?: string | null;
  scoreA?: number | null;
  golsTimeA?: number | null;
  scoreB?: number | null;
  golsTimeB?: number | null;
  score?: { teamA?: number | null; teamB?: number | null } | null;
  teamAId?: string | null;
  teamBId?: string | null;
  teamA?: BackendTeam | null;
  teamB?: BackendTeam | null;
  presences?: BackendPresence[] | null;
};

function normalizePosicao(pos?: string | null): string {
  if (!pos) return "";
  const value = pos.toLowerCase();
  if (value.includes("gol")) return "GOL";
  if (value.includes("zag")) return "ZAG";
  if (value.includes("def")) return "ZAG";
  if (value.includes("ata")) return "ATA";
  if (value.includes("mei")) return "MEIA";
  return "";
}

function parseMatchDate(match: BackendMatchLike): Date | null {
  const raw = match.date ?? match.data;
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function hasValidScore(match: BackendMatchLike) {
  const scoreA =
    match.score?.teamA ??
    match.scoreA ??
    (typeof match.golsTimeA === "number" ? match.golsTimeA : null);
  const scoreB =
    match.score?.teamB ??
    match.scoreB ??
    (typeof match.golsTimeB === "number" ? match.golsTimeB : null);
  return typeof scoreA === "number" && typeof scoreB === "number";
}

function resolveTeamKey(
  team?: BackendTeam | null,
  fallbackId?: string | null,
  fallbackName?: string | null
) {
  return ((team?.id ?? fallbackId ?? fallbackName ?? "") || "").toString();
}

export function buildDestaquesDoDia(
  matches: Array<BackendMatchLike | PublicMatch> | undefined | null
): DestaquesDoDia {
  if (!Array.isArray(matches) || matches.length === 0) {
    return { confrontos: [], times: [], dataReferencia: null };
  }

  const datedMatches = matches
    .map((raw) => ({ raw, date: parseMatchDate(raw) }))
    .filter((item) => item.date !== null && hasValidScore(item.raw)) as {
    raw: BackendMatchLike;
    date: Date;
  }[];

  if (!datedMatches.length) {
    return { confrontos: [], times: [], dataReferencia: null };
  }

  const latestDate = datedMatches
    .map((m) => m.date)
    .sort((a, b) => b.getTime() - a.getTime())[0] as Date;

  const matchesDoDia = datedMatches.filter((m) => isSameDay(m.date, latestDate)).map((m) => m.raw);

  if (!matchesDoDia.length) {
    return { confrontos: [], times: [], dataReferencia: null };
  }

  const teamMap = new Map<
    string,
    {
      key: string;
      index: number;
      nome: string;
      logoUrl?: string | null;
      cor?: string | null;
      jogadores: Map<string, JogadorDestaque>;
    }
  >();

  const ensureTeam = (team: BackendTeam | null | undefined, fallbackId?: string | null) => {
    const key = resolveTeamKey(team, fallbackId, team?.name);
    if (!key) return null;
    const existing = teamMap.get(key);
    if (existing) return existing;
    const created = {
      key,
      index: teamMap.size,
      nome: team?.name || "Time",
      logoUrl: team?.logoUrl ?? null,
      cor: team?.color ?? null,
      jogadores: new Map<string, JogadorDestaque>(),
    };
    teamMap.set(key, created);
    return created;
  };

  matchesDoDia.forEach((match) => {
    ensureTeam(match.teamA ?? null, match.teamAId ?? null);
    ensureTeam(match.teamB ?? null, match.teamBId ?? null);
  });

  matchesDoDia.forEach((match) => {
    const teamAKey = resolveTeamKey(match.teamA, match.teamAId, match.teamA?.name);
    const teamBKey = resolveTeamKey(match.teamB, match.teamBId, match.teamB?.name);

    (match.presences ?? []).forEach((presence) => {
      if (presence.status === "AUSENTE") return;
      const teamKey = resolveTeamKey(presence.team, presence.teamId, presence.team?.name);
      const teamEntry = teamMap.get(teamKey);
      if (!teamEntry) return;
      const athlete = presence.athlete;
      if (!athlete || !athlete.name) return;
      const jogadorId = (athlete.id ?? `${athlete.name}-${teamKey}`).toString();
      if (teamEntry.jogadores.has(jogadorId)) return;
      teamEntry.jogadores.set(jogadorId, {
        id: jogadorId,
        timeId: teamEntry.key,
        nome: athlete.name,
        apelido: athlete.nickname ?? "",
        pos: normalizePosicao(athlete.position),
        foto: athlete.photoUrl ?? null,
      });
    });
  });

  const orderedTeams = Array.from(teamMap.values()).sort((a, b) => a.index - b.index);

  const times: TimeDestaque[] = orderedTeams.map((team) => ({
    id: team.key,
    nome: team.nome,
    logoUrl: team.logoUrl ?? null,
    cor: team.cor ?? null,
    jogadores: Array.from(team.jogadores.values()),
  }));

  const confrontos: ConfrontoV2[] = matchesDoDia.map((match) => {
    const teamAKey = resolveTeamKey(match.teamA, match.teamAId, match.teamA?.name);
    const teamBKey = resolveTeamKey(match.teamB, match.teamBId, match.teamB?.name);

    const indexA = teamMap.get(teamAKey)?.index ?? 0;
    const indexB = teamMap.get(teamBKey)?.index ?? 0;

    const golsA =
      match.score?.teamA ??
      match.scoreA ??
      (typeof match.golsTimeA === "number" ? match.golsTimeA : 0);
    const golsB =
      match.score?.teamB ??
      match.scoreB ??
      (typeof match.golsTimeB === "number" ? match.golsTimeB : 0);

    const eventos: EventoGolV2[] = [];
    (match.presences ?? []).forEach((presence) => {
      if (presence.status === "AUSENTE") return;
      const athleteName = presence.athlete?.name ?? "";
      const athleteId = presence.athlete?.id ?? "";
      if (!athleteName) return;
      const teamKey = resolveTeamKey(presence.team, presence.teamId, presence.team?.name);
      const timeLabel: "a" | "b" = teamKey && teamKey === teamBKey ? "b" : "a";

      const gols = presence.goals ?? 0;
      const assists = presence.assists ?? 0;

      for (let i = 0; i < gols; i += 1) {
        eventos.push({
          time: timeLabel,
          jogadorId: athleteId || undefined,
          jogador: athleteName,
          assistenciaId: undefined,
          assistencia: "faltou",
        });
      }

      for (let i = 0; i < assists; i += 1) {
        eventos.push({
          time: timeLabel,
          jogadorId: undefined,
          jogador: "faltou",
          assistenciaId: athleteId || undefined,
          assistencia: athleteName,
        });
      }
    });

    const resultadoIda: ResultadoPartidaV2 = {
      placar: { a: Number(golsA) || 0, b: Number(golsB) || 0 },
      eventos,
    };

    return {
      ida: { a: indexA, b: indexB },
      volta: { a: indexA, b: indexB },
      resultadoIda,
      resultadoVolta: undefined,
    };
  });

  return {
    confrontos,
    times,
    dataReferencia: latestDate.toISOString(),
  };
}

export function getPontosPorTime(confrontos: ConfrontoV2[]) {
  const pontos: Record<number, number> = {};
  (confrontos ?? []).forEach((c) => {
    if (c?.resultadoIda?.placar) {
      const placar = c.resultadoIda.placar;
      if (placar.a > placar.b) {
        pontos[c.ida.a] = (pontos[c.ida.a] ?? 0) + 3;
        pontos[c.ida.b] = pontos[c.ida.b] ?? 0;
      } else if (placar.b > placar.a) {
        pontos[c.ida.b] = (pontos[c.ida.b] ?? 0) + 3;
        pontos[c.ida.a] = pontos[c.ida.a] ?? 0;
      } else {
        pontos[c.ida.a] = (pontos[c.ida.a] ?? 0) + 1;
        pontos[c.ida.b] = (pontos[c.ida.b] ?? 0) + 1;
      }
    }
    if (c?.resultadoVolta?.placar) {
      const placar = c.resultadoVolta.placar;
      if (placar.a > placar.b) {
        pontos[c.volta.a] = (pontos[c.volta.a] ?? 0) + 3;
        pontos[c.volta.b] = pontos[c.volta.b] ?? 0;
      } else if (placar.b > placar.a) {
        pontos[c.volta.b] = (pontos[c.volta.b] ?? 0) + 3;
        pontos[c.volta.a] = pontos[c.volta.a] ?? 0;
      } else {
        pontos[c.volta.a] = (pontos[c.volta.a] ?? 0) + 1;
        pontos[c.volta.b] = (pontos[c.volta.b] ?? 0) + 1;
      }
    }
  });
  return pontos;
}

export function getTimeCampeao(confrontos: ConfrontoV2[], times: TimeDestaque[]) {
  const pontos = getPontosPorTime(confrontos);
  const arr = Object.entries(pontos);
  if (!arr.length) return null;
  const [indexStr, pts] = arr.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const index = Number(indexStr);
  const time = times?.[index];
  if (!time) return null;
  return { time, index, pontos: pts };
}

export function getEventosDoDia(confrontos: ConfrontoV2[]) {
  let eventos: EventoGolV2[] = [];
  (confrontos ?? []).forEach((c) => {
    if (Array.isArray(c?.resultadoIda?.eventos)) eventos = eventos.concat(c.resultadoIda!.eventos);
    if (Array.isArray(c?.resultadoVolta?.eventos))
      eventos = eventos.concat(c.resultadoVolta!.eventos);
  });
  return eventos;
}
