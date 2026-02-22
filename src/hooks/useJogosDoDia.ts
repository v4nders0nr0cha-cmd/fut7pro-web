import { usePublicMatches } from "./usePublicMatches";
import type { PublicMatch } from "@/types/partida";

export type JogoDoDia = {
  id: string;
  timeA: string;
  timeB: string;
  logoTimeA: string | null;
  logoTimeB: string | null;
  golsTimeA: number;
  golsTimeB: number;
};

function mapMatch(match: PublicMatch): JogoDoDia {
  const nomeTimeA = match.teamA?.name?.trim();
  const nomeTimeB = match.teamB?.name?.trim();
  const logoTimeA = match.teamA?.logoUrl?.trim() || null;
  const logoTimeB = match.teamB?.logoUrl?.trim() || null;

  return {
    id: match.id,
    timeA: nomeTimeA || "Equipe mandante",
    timeB: nomeTimeB || "Equipe visitante",
    logoTimeA,
    logoTimeB,
    golsTimeA: Number(match.score?.teamA ?? match.scoreA ?? 0),
    golsTimeB: Number(match.score?.teamB ?? match.scoreB ?? 0),
  };
}

function sortMatchesByDateDesc(matches: PublicMatch[]) {
  return [...matches].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });
}

export function useJogosDoDia(slug?: string) {
  const todayQuery = usePublicMatches({
    slug,
    scope: "today",
    limit: 6,
  });

  const hasTodayMatches = todayQuery.matches.length > 0;
  const waitingTodayRefresh = !hasTodayMatches && (todayQuery.isLoading || todayQuery.isValidating);

  const shouldUseRecentFallback = Boolean(slug?.trim()) && !waitingTodayRefresh && !hasTodayMatches;

  const recentQuery = usePublicMatches({
    slug,
    scope: "recent",
    limit: 6,
    enabled: shouldUseRecentFallback,
  });

  const sourceMatches = shouldUseRecentFallback ? recentQuery.matches : todayQuery.matches;
  const hasSourceMatches = sourceMatches.length > 0;

  return {
    jogos: sortMatchesByDateDesc(sourceMatches).map(mapMatch),
    isLoading:
      waitingTodayRefresh ||
      (shouldUseRecentFallback && (recentQuery.isLoading || recentQuery.isValidating)),
    isError: hasSourceMatches
      ? false
      : shouldUseRecentFallback
        ? recentQuery.isError
        : todayQuery.isError,
    error: hasSourceMatches ? null : shouldUseRecentFallback ? recentQuery.error : todayQuery.error,
    mutate: shouldUseRecentFallback ? recentQuery.mutate : todayQuery.mutate,
  };
}
