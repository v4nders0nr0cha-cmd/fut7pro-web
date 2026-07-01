import type { RankingAtleta, ConquistasAtleta } from "@/types/estatisticas";

export type PremiumPosition = "goleiro" | "zagueiro" | "meia" | "atacante";

export type PremiumAchievement = {
  title: string;
  description: string;
  icon: "shirt" | "star" | "shield" | "trophy";
};

export type PremiumAchievementItem = {
  descricao: string;
  ano: number;
  icone: string;
};

export type PremiumAchievementGroups = {
  titulosGrandesTorneios: PremiumAchievementItem[];
  titulosAnuais: PremiumAchievementItem[];
  titulosQuadrimestrais: PremiumAchievementItem[];
  conquistasIndividuaisFut7Pro: PremiumAchievementItem[];
};

export type PremiumBadge = {
  key: string;
  label: string;
  value?: string | number;
};

export type PremiumStats = {
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
  gols: number;
  assistencias: number;
  titulos: number;
  rank: number | null;
  media: number;
  assiduidade: number;
  campeaoDia?: number | string | null;
};

export type PremiumIndex = {
  value?: number | null;
  overall: number | null;
  confidence: number;
  status: "ready" | "provisional" | "insufficient_data";
};

const POSITION_LABELS: Record<PremiumPosition, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

const POSITION_SHORT_LABELS: Record<PremiumPosition, string> = {
  goleiro: "GOL",
  zagueiro: "ZAG",
  meia: "MEI",
  atacante: "ATA",
};

export function normalizePremiumPosition(value?: string | null): PremiumPosition {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.startsWith("gol")) return "goleiro";
  if (normalized.startsWith("zag")) return "zagueiro";
  if (normalized.startsWith("ata")) return "atacante";
  return "meia";
}

export function getPremiumPositionLabel(position: PremiumPosition) {
  return POSITION_LABELS[position];
}

export function getPremiumPositionShortLabel(position: PremiumPosition) {
  return POSITION_SHORT_LABELS[position];
}

export function countPremiumTitles(conquistas?: Partial<ConquistasAtleta> | null) {
  return (
    (conquistas?.titulosGrandesTorneios?.length ?? 0) +
    (conquistas?.titulosAnuais?.length ?? 0) +
    (conquistas?.titulosQuadrimestrais?.length ?? 0)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeMetric(value: number, maxValue: number) {
  if (!maxValue || maxValue <= 0) return 0;
  return clamp((value / maxValue) * 100, 0, 100);
}

export function buildPremiumStats(params: {
  ranking?: RankingAtleta | null;
  rankings?: RankingAtleta[];
  position: PremiumPosition;
  titles?: number;
  campeaoDia?: number | string | null;
}): PremiumStats {
  const ranking = params.ranking;
  const rankings = params.rankings ?? [];
  const samePosition = rankings.filter(
    (item) => normalizePremiumPosition(item.position ?? item.posicao) === params.position
  );
  const positionRankIndex = samePosition.findIndex((item) => item.id === ranking?.id);
  const maxJogos = Math.max(...samePosition.map((item) => item.jogos ?? 0), 0);
  const jogos = ranking?.jogos ?? 0;
  const vitorias = ranking?.vitorias ?? 0;

  return {
    jogos,
    vitorias,
    empates: ranking?.empates ?? 0,
    derrotas: ranking?.derrotas ?? 0,
    pontos: ranking?.pontos ?? 0,
    gols: ranking?.gols ?? 0,
    assistencias: ranking?.assistencias ?? 0,
    titulos: params.titles ?? 0,
    rank: positionRankIndex >= 0 ? positionRankIndex + 1 : null,
    media: jogos > 0 ? Number((vitorias / jogos).toFixed(2)) : 0,
    assiduidade: Math.round(normalizeMetric(jogos, maxJogos)),
    campeaoDia: params.campeaoDia ?? null,
  };
}

export function calculateFut7ProIndex(params: {
  ranking?: RankingAtleta | null;
  rankings?: RankingAtleta[];
  position: PremiumPosition;
}) {
  const ranking = params.ranking;
  if (!ranking || (ranking.jogos ?? 0) <= 0) {
    return {
      value: null,
      overall: null,
      confidence: 0,
      status: "insufficient_data" as const,
    };
  }

  const samePosition = (params.rankings ?? []).filter(
    (item) => normalizePremiumPosition(item.position ?? item.posicao) === params.position
  );
  const maxPontos = Math.max(...samePosition.map((item) => item.pontos ?? 0), 0);
  const maxGols = Math.max(...samePosition.map((item) => item.gols ?? 0), 0);
  const maxAssistencias = Math.max(...samePosition.map((item) => item.assistencias ?? 0), 0);
  const maxJogos = Math.max(...samePosition.map((item) => item.jogos ?? 0), 0);

  const pontosNorm = normalizeMetric(ranking.pontos ?? 0, maxPontos);
  const golsNorm = normalizeMetric(ranking.gols ?? 0, maxGols);
  const assistenciasNorm = normalizeMetric(ranking.assistencias ?? 0, maxAssistencias);
  const assiduidade = normalizeMetric(ranking.jogos ?? 0, maxJogos);

  let rawIndex = 0;
  if (params.position === "goleiro" || params.position === "zagueiro") {
    rawIndex = 0.55 * pontosNorm + 0.45 * assiduidade;
  } else if (params.position === "meia") {
    rawIndex = 0.3 * pontosNorm + 0.25 * assiduidade + 0.3 * assistenciasNorm + 0.15 * golsNorm;
  } else {
    rawIndex = 0.3 * pontosNorm + 0.25 * assiduidade + 0.35 * golsNorm + 0.1 * assistenciasNorm;
  }

  const minJogosConfianca = 5;
  const confidence = clamp((ranking.jogos ?? 0) / minJogosConfianca, 0, 1);
  const adjusted = rawIndex * confidence + 50 * (1 - confidence);
  const value = Math.round(adjusted);
  const overall = clamp(Math.round(40 + value * 0.59), 40, 99);

  return {
    value,
    overall,
    confidence,
    status: confidence >= 1 ? ("ready" as const) : ("provisional" as const),
  };
}

export function buildPremiumAchievements(params: {
  stats: PremiumStats;
  index: PremiumIndex;
}): PremiumAchievement[] {
  const achievements: PremiumAchievement[] = [];

  achievements.push({
    title: params.stats.jogos >= 10 ? "Titular" : "Em Evolucao",
    description: params.stats.jogos >= 10 ? "Jogador confirmado" : "Construindo historia",
    icon: "shirt",
  });

  achievements.push({
    title:
      params.index.status === "ready" && (params.index.overall ?? 0) >= 75 ? "Destaque" : "Foco",
    description:
      params.index.status === "ready" && (params.index.overall ?? 0) >= 75
        ? "Alto desempenho"
        : "Nota em formacao",
    icon: "star",
  });

  achievements.push({
    title: params.stats.jogos >= 50 ? "Veterano" : "Atleta Fut7Pro",
    description: params.stats.jogos >= 50 ? "Experiencia e lideranca" : "Perfil oficial",
    icon: "shield",
  });

  return achievements;
}

export function buildPremiumBadges(stats: PremiumStats): PremiumBadge[] {
  return [
    { key: "jogos", label: "Jogos", value: stats.jogos },
    { key: "gols", label: "Gols", value: stats.gols },
    { key: "assistencias", label: "Assistências", value: stats.assistencias },
    { key: "titulos", label: "Títulos", value: stats.titulos },
    { key: "media-vitorias", label: "Média de Vitórias", value: stats.media.toFixed(2) },
    { key: "pontos", label: "Pontos", value: stats.pontos },
    { key: "campeao-dia", label: "Campeão do Dia", value: stats.campeaoDia ?? 0 },
    { key: "assiduidade", label: "Assiduidade", value: `${stats.assiduidade}%` },
  ];
}
