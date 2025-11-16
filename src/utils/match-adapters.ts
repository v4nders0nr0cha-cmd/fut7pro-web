import type { Match, MatchPresence } from "@/types/partida";
import type { AthletePosition } from "@/types/jogador";

export type DerivedPlayer = {
  id: string;
  nome: string;
  nickname?: string | null;
  photoUrl: string;
  posicao: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  status: "titular" | "substituto" | "ausente";
  gols: number;
  assistencias: number;
};

export type DerivedTimeDoDia = {
  id: string;
  nome: string;
  logo: string;
  cor: string;
  jogadores: DerivedPlayer[];
  ehTimeCampeao?: boolean;
};

export type DerivedConfronto = {
  id: string;
  data: string;
  local?: string | null;
  timeA: {
    id: string;
    nome: string;
    logo: string;
  };
  timeB: {
    id: string;
    nome: string;
    logo: string;
  };
  placar: {
    a: number;
    b: number;
  };
};

const DEFAULT_TIME_LOGO = "/images/times/time_padrao_01.png";
const DEFAULT_PLAYER_PHOTO = "/images/jogadores/jogador_padrao_01.jpg";

const POSITION_LABEL: Record<string, DerivedPlayer["posicao"]> = {
  goleiro: "Goleiro",
  gk: "Goleiro",
  zagueiro: "Zagueiro",
  defensor: "Zagueiro",
  defesa: "Zagueiro",
  meia: "Meia",
  medio: "Meia",
  meio: "Meia",
  atacante: "Atacante",
  avante: "Atacante",
  forward: "Atacante",
};

const STATUS_MAP: Record<string, DerivedPlayer["status"]> = {
  TITULAR: "titular",
  SUBSTITUTO: "substituto",
  AUSENTE: "ausente",
};

function normalizePosition(position?: string | null): DerivedPlayer["posicao"] {
  if (!position) return "Atacante";
  const normalized = position.toLowerCase();
  return POSITION_LABEL[normalized] ?? "Atacante";
}

function normalizeStatus(status?: string | null): DerivedPlayer["status"] {
  if (!status) return "titular";
  return STATUS_MAP[status] ?? STATUS_MAP[status.toUpperCase()] ?? "titular";
}

function getTeamKey(matchTeamId?: string | null, fallbackName?: string | null) {
  return matchTeamId ?? (fallbackName ? fallbackName.toLowerCase() : "");
}

function resolveTeamName(match: Match, team: "A" | "B"): string {
  const source = team === "A" ? match.teamA : match.teamB;
  const fallbackId = team === "A" ? match.teamAId : match.teamBId;
  if (source?.name) return source.name;
  if (fallbackId) return `Time ${team}`;
  return team === "A" ? "Time A" : "Time B";
}

function resolveTeamLogo(match: Match, team: "A" | "B"): string {
  const source = team === "A" ? match.teamA : match.teamB;
  return source?.logoUrl ?? DEFAULT_TIME_LOGO;
}

function resolveTeamColor(match: Match, team: "A" | "B"): string {
  const source = team === "A" ? match.teamA : match.teamB;
  return source?.color ?? "#FFD700";
}

function pickPlayerPhoto(presence: MatchPresence): string {
  return presence.athlete?.photoUrl ?? DEFAULT_PLAYER_PHOTO;
}

export function buildTimesDoDiaFromMatches(matches: Match[]): DerivedTimeDoDia[] {
  const teams = new Map<string, DerivedTimeDoDia>();

  matches.forEach((match) => {
    const teamAKey = getTeamKey(match.teamA?.id ?? match.teamAId, match.teamA?.name ?? "Time A");
    const teamBKey = getTeamKey(match.teamB?.id ?? match.teamBId, match.teamB?.name ?? "Time B");

    if (!teams.has(teamAKey)) {
      teams.set(teamAKey, {
        id: teamAKey,
        nome: resolveTeamName(match, "A"),
        logo: resolveTeamLogo(match, "A"),
        cor: resolveTeamColor(match, "A"),
        jogadores: [],
      });
    }

    if (!teams.has(teamBKey)) {
      teams.set(teamBKey, {
        id: teamBKey,
        nome: resolveTeamName(match, "B"),
        logo: resolveTeamLogo(match, "B"),
        cor: resolveTeamColor(match, "B"),
        jogadores: [],
      });
    }

    match.presences.forEach((presence) => {
      const teamKey =
        presence.team?.id ??
        presence.teamId ??
        (presence.team && presence.team.name ? presence.team.name.toLowerCase() : undefined);

      let resolvedKey = teamKey;
      if (!resolvedKey) {
        if (match.teamAId && presence.teamId === match.teamAId) {
          resolvedKey = teamAKey;
        } else if (match.teamBId && presence.teamId === match.teamBId) {
          resolvedKey = teamBKey;
        } else if (!presence.teamId) {
          resolvedKey = presence.team?.name
            ? presence.team.name.toLowerCase()
            : presence.athlete?.name
              ? `${teamAKey}-${presence.athlete.name}`
              : undefined;
        }
      }

      if (!resolvedKey) return;

      if (!teams.has(resolvedKey)) {
        teams.set(resolvedKey, {
          id: resolvedKey,
          nome:
            presence.team?.name ??
            (resolvedKey === teamAKey
              ? resolveTeamName(match, "A")
              : resolvedKey === teamBKey
                ? resolveTeamName(match, "B")
                : `Time ${resolvedKey}`),
          logo:
            presence.team?.logoUrl ??
            (resolvedKey === teamAKey
              ? resolveTeamLogo(match, "A")
              : resolvedKey === teamBKey
                ? resolveTeamLogo(match, "B")
                : DEFAULT_TIME_LOGO),
          cor:
            presence.team?.color ??
            (resolvedKey === teamAKey
              ? resolveTeamColor(match, "A")
              : resolvedKey === teamBKey
                ? resolveTeamColor(match, "B")
                : "#FFD700"),
          jogadores: [],
        });
      }

      const teamEntry = teams.get(resolvedKey)!;
      const jogadorId = presence.athlete?.id ?? `${presence.id}-${resolvedKey}`;

      if (teamEntry.jogadores.some((j) => j.id === jogadorId)) {
        return;
      }

      teamEntry.jogadores.push({
        id: jogadorId,
        nome: presence.athlete?.name ?? "Atleta",
        nickname: presence.athlete?.nickname ?? null,
        photoUrl: pickPlayerPhoto(presence),
        posicao: normalizePosition(presence.athlete?.position as AthletePosition | string),
        status: normalizeStatus(presence.status),
        gols: presence.goals ?? 0,
        assistencias: presence.assists ?? 0,
      });
    });
  });

  return Array.from(teams.values()).map((time) => ({
    ...time,
    jogadores: time.jogadores.sort((a, b) => a.nome.localeCompare(b.nome)),
  }));
}

export function buildConfrontosFromMatches(matches: Match[]): DerivedConfronto[] {
  return matches.map((match) => ({
    id: match.id,
    data: match.date,
    local: match.location ?? null,
    timeA: {
      id: match.teamA?.id ?? match.teamAId ?? "team-a",
      nome: resolveTeamName(match, "A"),
      logo: resolveTeamLogo(match, "A"),
    },
    timeB: {
      id: match.teamB?.id ?? match.teamBId ?? "team-b",
      nome: resolveTeamName(match, "B"),
      logo: resolveTeamLogo(match, "B"),
    },
    placar: {
      a: match.score?.teamA ?? match.scoreA ?? 0,
      b: match.score?.teamB ?? match.scoreB ?? 0,
    },
  }));
}

export function determineChampionTeam(matches: Match[]): string | null {
  if (!matches.length) return null;
  const pontos = new Map<string, number>();

  matches.forEach((match) => {
    const teamAKey = getTeamKey(match.teamA?.id ?? match.teamAId, resolveTeamName(match, "A"));
    const teamBKey = getTeamKey(match.teamB?.id ?? match.teamBId, resolveTeamName(match, "B"));
    const placarA = match.score?.teamA ?? match.scoreA ?? 0;
    const placarB = match.score?.teamB ?? match.scoreB ?? 0;

    if (placarA > placarB) {
      pontos.set(teamAKey, (pontos.get(teamAKey) ?? 0) + 3);
      pontos.set(teamBKey, pontos.get(teamBKey) ?? 0);
    } else if (placarB > placarA) {
      pontos.set(teamBKey, (pontos.get(teamBKey) ?? 0) + 3);
      pontos.set(teamAKey, pontos.get(teamAKey) ?? 0);
    } else {
      pontos.set(teamAKey, (pontos.get(teamAKey) ?? 0) + 1);
      pontos.set(teamBKey, (pontos.get(teamBKey) ?? 0) + 1);
    }
  });

  if (pontos.size === 0) return null;
  const sorted = Array.from(pontos.entries()).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}
