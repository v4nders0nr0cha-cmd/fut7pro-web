import { prisma } from "@/server/prisma";
import type { Partida } from "@prisma/client";
import type {
  Atleta,
  AtletaBase,
  AtletaDetalhe,
  AtletaStats,
  HistoricoPartidaAtleta,
} from "@/types/atleta";

type TimeSide = "A" | "B";

type ParsedJogador = {
  id: string | null;
  nome: string;
  apelido: string | null;
  foto: string | null;
  posicao: string | null;
  gols: number;
  assistencias: number;
};

type AggregatedAtleta = {
  key: string;
  base: AtletaBase;
  stats: AtletaStats;
  historico: HistoricoPartidaAtleta[];
};

const WIN_POINTS = 3;
const DRAW_POINTS = 1;
const LOSS_POINTS = 0;

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

function slugify(value: string | null | undefined): string {
  if (!value) {
    return "atleta";
  }

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

  return normalized.length > 0 ? normalized : "atleta";
}

function uniqueSlug(base: string, used: Set<string>): string {
  const normalizedBase = base.length > 0 ? base : "atleta";
  let candidate = normalizedBase;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  used.add(candidate);
  return candidate;
}

function parseJogadores(raw: string | null): ParsedJogador[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;

        const nome =
          typeof record.nome === "string" && record.nome.trim().length > 0
            ? record.nome.trim()
            : `Atleta ${index + 1}`;

        const id =
          typeof record.id === "string" && record.id.trim().length > 0 ? record.id.trim() : null;

        const apelido =
          typeof record.apelido === "string" && record.apelido.trim().length > 0
            ? record.apelido.trim()
            : null;

        const foto = (() => {
          if (typeof record.foto === "string" && record.foto.trim().length > 0) {
            return record.foto.trim();
          }
          if (typeof record.fotoUrl === "string" && record.fotoUrl.trim().length > 0) {
            return record.fotoUrl.trim();
          }
          return null;
        })();

        const posicao =
          typeof record.posicao === "string" && record.posicao.trim().length > 0
            ? record.posicao.trim()
            : null;

        const gols = toSafeNumber(record.gols);
        const assistencias = toSafeNumber(record.assistencias);

        return {
          id,
          nome,
          apelido,
          foto,
          posicao,
          gols,
          assistencias,
        } satisfies ParsedJogador;
      })
      .filter((value): value is ParsedJogador => Boolean(value));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao interpretar jogadores da partida", error);
    }
    return [];
  }
}

function ensureAggregated(
  map: Map<string, AggregatedAtleta>,
  usedSlugs: Set<string>,
  jogador: ParsedJogador
): AggregatedAtleta {
  const slugBase = slugify(jogador.apelido || jogador.nome);
  const key = jogador.id ?? slugBase;
  const existing = map.get(key);

  if (existing) {
    if (jogador.nome && jogador.nome !== existing.base.nome) {
      existing.base.nome = jogador.nome;
    }
    if (jogador.apelido !== null && jogador.apelido !== existing.base.apelido) {
      existing.base.apelido = jogador.apelido;
    }
    if (jogador.foto !== null && jogador.foto !== existing.base.foto) {
      existing.base.foto = jogador.foto;
    }
    if (jogador.posicao !== null && jogador.posicao !== existing.base.posicao) {
      existing.base.posicao = jogador.posicao;
    }
    return existing;
  }

  const slug = uniqueSlug(slugBase, usedSlugs);

  const base: AtletaBase = {
    id: jogador.id ?? slug,
    nome: jogador.nome,
    apelido: jogador.apelido,
    slug,
    foto: jogador.foto,
    posicao: jogador.posicao,
  };

  const stats: AtletaStats = {
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    gols: 0,
    assistencias: 0,
    mediaPontuacao: 0,
  };

  const entry: AggregatedAtleta = {
    key,
    base,
    stats,
    historico: [],
  };

  map.set(key, entry);
  return entry;
}

function registrarPartida(
  entry: AggregatedAtleta,
  partida: Partida,
  lado: TimeSide,
  jogador: ParsedJogador
) {
  const golsA = partida.golsTimeA ?? 0;
  const golsB = partida.golsTimeB ?? 0;

  const isEmpate = golsA === golsB;
  const venceu = lado === "A" ? golsA > golsB : golsB > golsA;

  entry.stats.jogos += 1;
  entry.stats.gols += jogador.gols;
  entry.stats.assistencias += jogador.assistencias;

  if (isEmpate) {
    entry.stats.empates += 1;
  } else if (venceu) {
    entry.stats.vitorias += 1;
  } else {
    entry.stats.derrotas += 1;
  }

  const pontos = venceu ? WIN_POINTS : isEmpate ? DRAW_POINTS : LOSS_POINTS;
  const jogos = entry.stats.jogos;
  entry.stats.mediaPontuacao = Number(
    ((entry.stats.mediaPontuacao * (jogos - 1) + pontos) / jogos).toFixed(2)
  );

  const historicoEntry: HistoricoPartidaAtleta = {
    partidaId: partida.id,
    dataISO: partida.data.toISOString(),
    adversario: lado === "A" ? partida.timeB : partida.timeA,
    resultado: venceu ? "V" : isEmpate ? "E" : "D",
    placar: `${golsA}x${golsB}`,
    gols: jogador.gols,
    assistencias: jogador.assistencias,
  };

  entry.historico.push(historicoEntry);
}

async function aggregateAtletas(rachaId: string) {
  const partidas = await prisma.partida.findMany({
    where: { rachaId },
    orderBy: [{ data: "asc" }, { horario: "asc" }],
  });

  const map = new Map<string, AggregatedAtleta>();
  const usedSlugs = new Set<string>();
  const slugIndex = new Map<string, AggregatedAtleta>();

  partidas.forEach((partida) => {
    const jogadoresA = parseJogadores(partida.jogadoresA);
    const jogadoresB = parseJogadores(partida.jogadoresB);

    jogadoresA.forEach((jogador) => {
      const entry = ensureAggregated(map, usedSlugs, jogador);
      slugIndex.set(entry.base.slug, entry);
      registrarPartida(entry, partida, "A", jogador);
    });

    jogadoresB.forEach((jogador) => {
      const entry = ensureAggregated(map, usedSlugs, jogador);
      slugIndex.set(entry.base.slug, entry);
      registrarPartida(entry, partida, "B", jogador);
    });
  });

  const atletas: Atleta[] = Array.from(map.values()).map((entry) => ({
    ...entry.base,
    stats: { ...entry.stats },
  }));

  atletas.sort((a, b) => {
    if (b.stats.jogos !== a.stats.jogos) return b.stats.jogos - a.stats.jogos;
    if (b.stats.gols !== a.stats.gols) return b.stats.gols - a.stats.gols;
    return a.nome.localeCompare(b.nome);
  });

  return { atletas, slugIndex };
}

export async function listarAtletasPorRacha(rachaId: string): Promise<Atleta[]> {
  const { atletas } = await aggregateAtletas(rachaId);
  return atletas;
}

export async function obterAtletaPorSlug(
  rachaId: string,
  atletaSlug: string
): Promise<AtletaDetalhe | null> {
  const { slugIndex } = await aggregateAtletas(rachaId);
  const entry = slugIndex.get(atletaSlug);

  if (!entry) {
    return null;
  }

  const historicoRecentes = [...entry.historico]
    .sort((a, b) => b.dataISO.localeCompare(a.dataISO))
    .slice(0, 15);

  return {
    ...entry.base,
    stats: { ...entry.stats },
    historicoRecentes,
    conquistas: [],
  };
}
