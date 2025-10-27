import type { Partida } from "@prisma/client";
import { teamLogoMap, logoPadrao } from "@/config/teamLogoMap";

function toSafeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export type PlayerStats = {
  id: string;
  nome: string;
  slug: string;
  foto: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols: number;
  assistencias: number;
};

export type TeamStats = {
  id: string;
  nome: string;
  logo: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
};

type DateRange = {
  start: Date;
  end: Date;
};

type ParsedPlayer = {
  id: string;
  nome: string;
  foto?: string;
  status?: string;
  apelido?: string | null;
  gols: number;
  assistencias: number;
};

const WIN_POINTS = 3;
const DRAW_POINTS = 1;
const LOSS_POINTS = 0;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();
}

function parseJogadores(raw: string | null): ParsedPlayer[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const nome =
          typeof item.nome === "string" && item.nome.trim().length > 0
            ? item.nome.trim()
            : `Jogador ${index + 1}`;
        const fallbackId = slugify(nome) || `jogador-${index}`;
        const id =
          typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : fallbackId;
        const status = typeof item.status === "string" ? item.status.toLowerCase() : undefined;
        const foto =
          typeof item.foto === "string" && item.foto.trim().length > 0 ? item.foto : undefined;
        const apelido = typeof item.apelido === "string" ? item.apelido : null;
        const gols = toSafeNumber((item as Record<string, unknown>).gols);
        const assistencias = toSafeNumber((item as Record<string, unknown>).assistencias);
        return { id, nome, foto, status, apelido, gols, assistencias };
      })
      .filter((player): player is ParsedPlayer => Boolean(player));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao interpretar jogadores da partida", error);
    }
    return [];
  }
}

function isParticipanteAtivo(player: ParsedPlayer): boolean {
  const status = player.status?.toLowerCase();
  return status !== "ausente";
}

function ensurePlayer(map: Map<string, PlayerStats>, player: ParsedPlayer) {
  if (!map.has(player.id)) {
    map.set(player.id, {
      id: player.id,
      nome: player.nome,
      slug: slugify(player.nome || player.id),
      foto: player.foto ?? logoPadrao,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols: 0,
      assistencias: 0,
    });
  }
  const entry = map.get(player.id)!;
  if (player.foto && player.foto !== entry.foto) {
    entry.foto = player.foto;
  }
  if (player.nome && player.nome !== entry.nome) {
    entry.nome = player.nome;
    entry.slug = slugify(player.nome);
  }
  return entry;
}

function ensureTeam(map: Map<string, TeamStats>, nome: string) {
  const id = slugify(nome || "time");
  if (!map.has(id)) {
    map.set(id, {
      id,
      nome,
      logo: teamLogoMap[nome] ?? logoPadrao,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      saldoGols: 0,
    });
  }
  return map.get(id)!;
}

export function computePlayerStats(partidas: Partida[]): PlayerStats[] {
  const stats = new Map<string, PlayerStats>();

  partidas.forEach((partida) => {
    const jogadoresA = parseJogadores(partida.jogadoresA);
    const jogadoresB = parseJogadores(partida.jogadoresB);

    const golsA = partida.golsTimeA ?? 0;
    const golsB = partida.golsTimeB ?? 0;

    let resultadoA: "vitoria" | "empate" | "derrota";
    if (golsA > golsB) resultadoA = "vitoria";
    else if (golsA === golsB) resultadoA = "empate";
    else resultadoA = "derrota";

    const resultadoB: "vitoria" | "empate" | "derrota" =
      resultadoA === "vitoria" ? "derrota" : resultadoA === "derrota" ? "vitoria" : "empate";

    jogadoresA.forEach((player) => {
      if (!isParticipanteAtivo(player)) return;
      const entry = ensurePlayer(stats, player);
      entry.jogos += 1;
      entry.gols += player.gols;
      entry.assistencias += player.assistencias;
      if (resultadoA === "vitoria") {
        entry.vitorias += 1;
        entry.pontos += WIN_POINTS;
      } else if (resultadoA === "empate") {
        entry.empates += 1;
        entry.pontos += DRAW_POINTS;
      } else {
        entry.derrotas += 1;
        entry.pontos += LOSS_POINTS;
      }
    });

    jogadoresB.forEach((player) => {
      if (!isParticipanteAtivo(player)) return;
      const entry = ensurePlayer(stats, player);
      entry.jogos += 1;
      entry.gols += player.gols;
      entry.assistencias += player.assistencias;
      if (resultadoB === "vitoria") {
        entry.vitorias += 1;
        entry.pontos += WIN_POINTS;
      } else if (resultadoB === "empate") {
        entry.empates += 1;
        entry.pontos += DRAW_POINTS;
      } else {
        entry.derrotas += 1;
        entry.pontos += LOSS_POINTS;
      }
    });
  });

  return Array.from(stats.values()).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    if (b.gols !== a.gols) return b.gols - a.gols;
    return a.nome.localeCompare(b.nome);
  });
}

export function computeTeamStats(partidas: Partida[]): TeamStats[] {
  const stats = new Map<string, TeamStats>();

  partidas.forEach((partida) => {
    const teamA = ensureTeam(stats, partida.timeA);
    const teamB = ensureTeam(stats, partida.timeB);

    const golsA = partida.golsTimeA ?? 0;
    const golsB = partida.golsTimeB ?? 0;

    teamA.jogos += 1;
    teamB.jogos += 1;
    teamA.golsPro += golsA;
    teamA.golsContra += golsB;
    teamB.golsPro += golsB;
    teamB.golsContra += golsA;

    if (golsA > golsB) {
      teamA.vitorias += 1;
      teamA.pontos += WIN_POINTS;
      teamB.derrotas += 1;
      teamB.pontos += LOSS_POINTS;
    } else if (golsA < golsB) {
      teamB.vitorias += 1;
      teamB.pontos += WIN_POINTS;
      teamA.derrotas += 1;
      teamA.pontos += LOSS_POINTS;
    } else {
      teamA.empates += 1;
      teamB.empates += 1;
      teamA.pontos += DRAW_POINTS;
      teamB.pontos += DRAW_POINTS;
    }
  });

  return Array.from(stats.values())
    .map((team) => ({
      ...team,
      saldoGols: team.golsPro - team.golsContra,
    }))
    .sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
      if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
      if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
      return a.nome.localeCompare(b.nome);
    });
}

export function extractAvailableYears(partidas: Partida[]): number[] {
  const years = new Set<number>();
  partidas.forEach((partida) => {
    years.add(new Date(partida.data).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function filterPartidasByPeriodo(
  partidas: Partida[],
  periodo: string,
  ano?: number
): Partida[] {
  const normalized = (periodo ?? "historico").toLowerCase();
  const yearToUse = Number.isFinite(ano) ? Number(ano) : new Date().getFullYear();

  return partidas.filter((partida) => {
    const data = new Date(partida.data);
    const partidaAno = data.getFullYear();

    if (["historico", "todas", "geral"].includes(normalized)) {
      return true;
    }

    if (normalized === "anual" || normalized === "temporada") {
      return partidaAno === yearToUse;
    }

    if (normalized.startsWith("q")) {
      const quadrimestre = Number(normalized.replace("q", ""));
      if (![1, 2, 3].includes(quadrimestre)) {
        return partidaAno === yearToUse;
      }
      if (partidaAno !== yearToUse) {
        return false;
      }
      if (quadrimestre === 1) {
        return data.getMonth() < 4;
      }
      if (quadrimestre === 2) {
        return data.getMonth() >= 4 && data.getMonth() < 8;
      }
      return data.getMonth() >= 8;
    }

    if (normalized === "todas") {
      return true;
    }

    return partidaAno === yearToUse;
  });
}

export function computeUpdatedAt(partidas: Partida[]): string | null {
  if (!partidas.length) return null;
  const latest = partidas.reduce((acc, partida) => {
    const updatedAt = partida.atualizadoEm ?? partida.criadoEm;
    return updatedAt > acc ? updatedAt : acc;
  }, partidas[0].atualizadoEm ?? partidas[0].criadoEm);
  return latest ? latest.toISOString() : null;
}

export function filterPartidasByDateRange(partidas: Partida[], range: DateRange | null): Partida[] {
  if (!range) return partidas;
  return partidas.filter((partida) => {
    const timestamp = partida.data.getTime();
    return timestamp >= range.start.getTime() && timestamp < range.end.getTime();
  });
}
