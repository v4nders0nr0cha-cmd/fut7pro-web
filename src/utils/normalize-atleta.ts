import type {
  Atleta,
  EstatisticasAtleta,
  EstatisticasSimples,
  JogoAtleta,
  PosicaoAtleta,
  StatusAtleta,
} from "@/types/atletas";
import type { ConquistasAtleta, TituloAtleta } from "@/types/estatisticas";

const FALLBACK_FOTO = "/images/jogadores/jogador_padrao_01.jpg";

const EMPTY_STATS: EstatisticasSimples = {
  jogos: 0,
  gols: 0,
  assistencias: 0,
  campeaoDia: 0,
  mediaVitorias: 0,
  pontuacao: 0,
};

function toNumber(value: unknown, fallback = 0): number {
  const num = typeof value === "string" && value.trim().length === 0 ? NaN : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeSimpleStats(source: unknown): EstatisticasSimples {
  if (!source || typeof source !== "object") {
    return { ...EMPTY_STATS };
  }

  const base = source as Record<string, unknown>;

  return {
    jogos: toNumber(base.jogos ?? base.matches ?? base.totalJogos, 0),
    gols: toNumber(base.gols ?? base.goals, 0),
    assistencias: toNumber(base.assistencias ?? base.assists, 0),
    campeaoDia: toNumber(base.campeaoDia ?? base.champions ?? base.championCount, 0),
    mediaVitorias: toNumber(base.mediaVitorias ?? base.winRate ?? 0),
    pontuacao: toNumber(base.pontuacao ?? base.points ?? base.score, 0),
  };
}

function normalizeEstatisticas(raw: unknown): EstatisticasAtleta {
  const historicoSource =
    (raw as Record<string, unknown>)?.historico ??
    (raw as Record<string, unknown>)?.lifetime ??
    raw;
  const anual =
    (raw as Record<string, unknown>)?.anual ?? (raw as Record<string, unknown>)?.annual ?? {};

  const anualMap: Record<number, EstatisticasSimples> = {};
  if (anual && typeof anual === "object") {
    Object.entries(anual as Record<string, unknown>).forEach(([year, value]) => {
      const parsedYear = Number(year);
      if (Number.isFinite(parsedYear)) {
        anualMap[parsedYear] = normalizeSimpleStats(value);
      }
    });
  }

  return {
    historico: normalizeSimpleStats(historicoSource),
    anual: anualMap,
  };
}

function normalizeHistorico(raw: unknown): JogoAtleta[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item): JogoAtleta | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const base = item as Record<string, unknown>;

      const data =
        (base.data as string) ??
        (base.date as string) ??
        (base.playedAt as string) ??
        (base.matchDate as string) ??
        "";
      const time =
        (base.time as string) ??
        (base.team as string) ??
        (base.teamName as string) ??
        (base.teamLabel as string) ??
        "";
      const resultado =
        (base.resultado as string) ??
        (base.result as string) ??
        (base.score as string) ??
        (typeof base.goalsFor === "number" && typeof base.goalsAgainst === "number"
          ? `${base.goalsFor}x${base.goalsAgainst}`
          : "");

      return {
        data,
        time,
        resultado,
        gols: toNumber(base.gols ?? base.goals, 0),
        campeao: Boolean(base.campeao ?? base.champion ?? base.isChampion ?? false),
        pontuacao: toNumber(base.pontuacao ?? base.points ?? base.score, 0),
      };
    })
    .filter((item): item is JogoAtleta => item !== null);
}

function normalizeTitulos(raw: unknown): TituloAtleta[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item): TituloAtleta | null => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const base = item as Record<string, unknown>;
      const descricao =
        (base.descricao as string) ?? (base.nome as string) ?? (base.description as string) ?? null;
      if (!descricao) return null;

      const yearValue = base.ano ?? base.year ?? base.periodo ?? base.period ?? null;
      const ano = Number(yearValue);

      return {
        descricao,
        ano: Number.isFinite(ano) ? ano : new Date().getFullYear(),
        icone: (base.icone as string) ?? (base.icon as string) ?? "",
      };
    })
    .filter((item): item is TituloAtleta => item !== null);
}

function normalizeConquistas(raw: unknown): ConquistasAtleta {
  if (!raw || typeof raw !== "object") {
    return {
      titulosGrandesTorneios: [],
      titulosAnuais: [],
      titulosQuadrimestrais: [],
    };
  }

  const base = raw as Record<string, unknown>;
  return {
    titulosGrandesTorneios: normalizeTitulos(
      base.titulosGrandesTorneios ?? base.tournaments ?? base.majorTitles
    ),
    titulosAnuais: normalizeTitulos(base.titulosAnuais ?? base.annual ?? base.yearly),
    titulosQuadrimestrais: normalizeTitulos(
      base.titulosQuadrimestrais ?? base.quadrimestral ?? base.quarterly ?? base.quarter
    ),
  };
}

function normalizePosicao(raw: unknown): PosicaoAtleta {
  const value = String(raw ?? "").toLowerCase();
  if (value.includes("gol")) return "Goleiro";
  if (value.includes("zag") || value.includes("def")) return "Zagueiro";
  if (value.includes("mei") || value.includes("mid")) return "Meia";
  return "Atacante";
}

function normalizeStatus(raw: unknown): StatusAtleta {
  const value = String(raw ?? "").toLowerCase();
  if (value.includes("susp")) return "Suspenso";
  if (value.includes("inativ") || value.includes("inactive")) return "Inativo";
  return "Ativo";
}

function normalizeSlug(raw: unknown, fallbackName: string): string {
  const slugValue = (raw as string) ?? "";
  if (slugValue && /^[a-z0-9-]{1,100}$/i.test(slugValue)) {
    return slugValue;
  }
  return fallbackName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeAtleta(raw: unknown): Atleta | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const base = raw as Record<string, unknown>;

  const nome = (base.nome as string) ?? (base.name as string) ?? "Atleta";
  const id =
    (base.id as string | number | null) ??
    (base.athleteId as string | number | null) ??
    (base.uuid as string | number | null) ??
    nome;

  const slug = normalizeSlug(base.slug ?? base.handle ?? base.path, nome);

  const estatisticas = normalizeEstatisticas(
    base.estatisticas ?? base.stats ?? base.statistics ?? {}
  );

  const historico = normalizeHistorico(
    base.historico ?? base.historia ?? base.history ?? base.matches
  );

  const conquistas = normalizeConquistas(base.conquistas ?? base.achievements ?? {});

  const rawPhoto =
    (base.photoUrl as string) ?? (base.avatarUrl as string) ?? (base.pictureUrl as string) ?? null;
  const foto = typeof rawPhoto === "string" && rawPhoto.length > 0 ? rawPhoto : FALLBACK_FOTO;
  const nickname = typeof base.nickname === "string" ? base.nickname : null;
  const isMember = Boolean(base.isMember ?? base.member ?? false);
  const birthDate =
    (base.birthDate as string) ??
    (base.dataNascimento as string) ??
    (base.data_nascimento as string) ??
    (base.birth_date as string) ??
    null;

  const totalJogos =
    toNumber(
      base.totalJogos ?? base.totalMatches ?? base.games ?? estatisticas.historico.jogos,
      0
    ) || estatisticas.historico.jogos;

  const iconesRaw = base.icones ?? base.icons;

  return {
    id: String(id),
    nome,
    apelido: nickname,
    nickname,
    slug,
    foto,
    photoUrl: foto,
    birthDate,
    posicao: normalizePosicao(base.posicao ?? base.position),
    status: normalizeStatus(base.status),
    mensalista: isMember,
    isMember,
    ultimaPartida:
      (base.ultimaPartida as string) ??
      (base.lastMatchAt as string) ??
      (base.lastGameAt as string) ??
      (base.lastPlayedAt as string) ??
      undefined,
    totalJogos,
    estatisticas,
    historico,
    conquistas,
    icones: Array.isArray(iconesRaw) ? (iconesRaw as unknown[]).map((item) => String(item)) : [],
  };
}
