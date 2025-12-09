import { usePublicMatches } from "./usePublicMatches";
import type { PublicMatch } from "@/types/partida";

export type JogoDoDia = {
  id: string;
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
};

function mapMatch(match: PublicMatch): JogoDoDia {
  return {
    id: match.id,
    timeA: match.teamA?.name || "Time A",
    timeB: match.teamB?.name || "Time B",
    golsTimeA: Number(match.score?.teamA ?? match.scoreA ?? 0),
    golsTimeB: Number(match.score?.teamB ?? match.scoreB ?? 0),
  };
}

export function useJogosDoDia(slug?: string) {
  const { matches, isLoading, isError, error, mutate } = usePublicMatches({
    slug,
    scope: "today",
    limit: 6,
  });

  return {
    jogos: matches.map(mapMatch),
    isLoading,
    isError,
    error,
    mutate,
  };
}
