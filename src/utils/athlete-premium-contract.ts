import type { AthletePremiumProfilePayload } from "@/types/athlete-premium-profile";
import type {
  PremiumAchievement,
  PremiumAchievementGroups,
  PremiumBadge,
  PremiumIndex,
  PremiumStats,
} from "@/utils/athlete-premium";
import { normalizePremiumPosition } from "@/utils/athlete-premium";

export function mapPremiumPayloadToView(payload: AthletePremiumProfilePayload, titles = 0) {
  const position = normalizePremiumPosition(payload.athlete.position);
  const stats: PremiumStats = {
    jogos: payload.stats.games,
    vitorias: payload.stats.wins,
    empates: payload.stats.draws,
    derrotas: payload.stats.losses,
    pontos: payload.stats.points,
    gols: payload.stats.goals,
    assistencias: payload.stats.assists,
    titulos: payload.stats.titles ?? titles,
    rank: null,
    media:
      typeof payload.stats.winRate === "number"
        ? payload.stats.winRate
        : payload.stats.games > 0
          ? Number((payload.stats.wins / payload.stats.games).toFixed(2))
          : 0,
    assiduidade:
      typeof payload.stats.attendancePercent === "number"
        ? payload.stats.attendancePercent
        : Math.round(payload.legendaryProgress.attendance.rawProgressPercent),
    campeaoDia: payload.stats.championOfDay ?? payload.legendaryProgress.championOfDay.championDays,
  };
  const index: PremiumIndex = {
    value: payload.fut7ProIndex.overall,
    overall: payload.fut7ProIndex.overall,
    confidence: payload.fut7ProIndex.confidence,
    status:
      payload.fut7ProIndex.confidence >= 1
        ? "ready"
        : payload.stats.games > 0
          ? "provisional"
          : "insufficient_data",
  };

  return {
    athlete: {
      name: payload.athlete.firstName,
      nickname: payload.athlete.cardName ?? payload.athlete.nickname,
      avatarUrl: payload.athlete.avatarUrl,
      position,
      positionLabel: payload.athlete.positionLabel,
      positionSecondaryLabel: payload.athlete.positionSecondaryLabel,
      membershipLabel:
        payload.athlete.membershipLabel ?? (payload.athlete.mensalista ? "Mensalista" : "Avulso"),
      activityStatusLabel: payload.athlete.activityStatusLabel ?? "Inativo",
    },
    tenant: payload.tenant,
    stats,
    index,
    achievements: buildContractAchievements(payload),
    achievementGroups: normalizeAchievementGroups(payload.achievements),
    badges: buildContractBadges(stats),
    legendaryProgress: {
      seasonLabel: payload.legendaryProgress.season.label,
      status: payload.legendaryProgress.status,
      progressPercent: payload.legendaryProgress.progressPercent,
      isSeasonForming: payload.legendaryProgress.isSeasonForming ?? false,
      registeredGameDays: payload.legendaryProgress.attendance.rachaDays,
      requiredRachaDaysToUnlock:
        payload.legendaryProgress.requiredRachaDaysToUnlock ??
        payload.legendaryProgress.rules.minRachaDaysToUnlock,
      remainingRachaDaysToUnlock: payload.legendaryProgress.remainingRachaDaysToUnlock ?? 0,
      attendance: {
        current: payload.legendaryProgress.attendance.presences,
        target: payload.legendaryProgress.attendance.targetPresences,
        score: payload.legendaryProgress.attendance.score,
      },
      championOfDay: {
        current: payload.legendaryProgress.championOfDay.championDays,
        target: payload.legendaryProgress.championOfDay.targetChampionDays,
        score: payload.legendaryProgress.championOfDay.score,
      },
      nextGoalMessage: payload.legendaryProgress.nextGoalMessage,
    },
  };
}

function normalizeAchievementGroups(
  groups?: AthletePremiumProfilePayload["achievements"]
): PremiumAchievementGroups {
  return {
    titulosGrandesTorneios: groups?.titulosGrandesTorneios ?? [],
    titulosAnuais: groups?.titulosAnuais ?? [],
    titulosQuadrimestrais: groups?.titulosQuadrimestrais ?? [],
    conquistasIndividuaisFut7Pro: groups?.conquistasIndividuaisFut7Pro ?? [],
  };
}

function buildContractAchievements(payload: AthletePremiumProfilePayload): PremiumAchievement[] {
  const base: PremiumAchievement[] = payload.badges.slice(0, 3).map((badge) => {
    const icon: PremiumAchievement["icon"] = badge.variant === "legendary" ? "trophy" : "shield";
    return {
      title: badge.label,
      description: badge.description,
      icon,
    };
  });

  if (base.length >= 3) return base;

  const fallback: PremiumAchievement[] = [
    ...base,
    {
      title: payload.legendaryProgress.isLegendary ? "Card Lendário" : "Atleta Fut7Pro",
      description: payload.legendaryProgress.isLegendary
        ? `Lendário da temporada ${payload.legendaryProgress.season.year}`
        : "Card Oficial Fut7Pro",
      icon: payload.legendaryProgress.isLegendary ? "trophy" : "shield",
    },
    {
      title: "Assiduidade",
      description: `${payload.legendaryProgress.attendance.presences}/${payload.legendaryProgress.attendance.targetPresences} presenças`,
      icon: "shirt",
    },
    {
      title: "Campeão do Dia",
      description: `${payload.legendaryProgress.championOfDay.championDays}/${payload.legendaryProgress.championOfDay.targetChampionDays} conquistas`,
      icon: "star",
    },
  ];

  return fallback.slice(0, 3);
}

function buildContractBadges(stats: PremiumStats): PremiumBadge[] {
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
