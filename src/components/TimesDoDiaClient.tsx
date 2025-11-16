"use client";

import { useMemo } from "react";
import CardTimeDoDia from "@/components/cards/CardTimeDoDia";
import ConfrontosDoDia from "@/components/lists/ConfrontosDoDia";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { rachaConfig } from "@/config/racha.config";
import {
  buildTimesDoDiaFromMatches,
  buildConfrontosFromMatches,
  determineChampionTeam,
} from "@/utils/match-adapters";

export default function TimesDoDiaClient() {
  const { matches, isLoading, isError } = usePublicMatches({
    slug: rachaConfig.slug,
    params: { limit: 20 },
  });

  const latestDateMatches = useMemo(() => {
    if (!Array.isArray(matches) || matches.length === 0) return [];
    const grouped = matches.reduce<Record<string, typeof matches>>((acc, match) => {
      const dateOnly = match.date.slice(0, 10);
      if (!acc[dateOnly]) acc[dateOnly] = [];
      acc[dateOnly].push(match);
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));
    const latest = sortedDates[0];
    return latest ? grouped[latest] ?? [] : [];
  }, [matches]);

  const times = useMemo(() => buildTimesDoDiaFromMatches(latestDateMatches), [latestDateMatches]);
  const confrontos = useMemo(
    () => buildConfrontosFromMatches(latestDateMatches),
    [latestDateMatches],
  );

  const championKey = useMemo(
    () => determineChampionTeam(latestDateMatches),
    [latestDateMatches],
  );

  const timesWithChampion = useMemo(
    () =>
      times.map((time) => ({
        ...time,
        ehTimeCampeao: championKey ? time.id === championKey : false,
      })),
    [times, championKey],
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="text-yellow-400 font-semibold">Carregando partidas...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="text-red-400 font-semibold">Falha ao carregar partidas do dia.</span>
      </div>
    );
  }

  if (!latestDateMatches.length) {
    return (
      <div className="w-full flex flex-col items-center gap-6 py-10 text-center">
        <span className="text-yellow-300 font-semibold">
          Ainda nao temos partidas registradas para hoje.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {timesWithChampion.map((time) => (
          <CardTimeDoDia key={time.id} time={time} />
        ))}
      </section>
      <ConfrontosDoDia confrontos={confrontos} />
    </div>
  );
}
