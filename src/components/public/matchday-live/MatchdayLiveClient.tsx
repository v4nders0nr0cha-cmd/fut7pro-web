"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { MatchdayLiveResponse, MatchdayStatus } from "@/types/partida";
import { LiveEmptyState } from "./LiveEmptyState";
import { LiveHighlightsPanel } from "./LiveHighlightsPanel";
import { LiveMatchCard } from "./LiveMatchCard";
import { LiveStandingsTable } from "./LiveStandingsTable";
import { LiveTimeline } from "./LiveTimeline";

const STATUS_LABELS: Record<MatchdayStatus, string> = {
  not_started: "Rodada não iniciada",
  in_progress: "Rodada em andamento",
  finished: "Rodada finalizada",
};

async function fetcher(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MatchdayLiveClient() {
  const { publicSlug } = usePublicLinks();
  const date = useMemo(() => todayKey(), []);
  const key = publicSlug
    ? `/api/public/${encodeURIComponent(publicSlug)}/matchday-live?date=${date}`
    : null;

  const { data, error, isLoading } = useSWR<MatchdayLiveResponse>(key, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: (current) => {
      if (!current) return 15000;
      if (current.status === "in_progress") return 5000;
      if (current.status === "finished") return 60000;
      return 15000;
    },
    dedupingInterval: 4000,
  });

  return (
    <main className="min-h-screen bg-fundo px-4 pb-20 pt-10 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Partidas</p>
          <h1 className="text-3xl font-bold md:text-4xl">Placar Ao Vivo</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
            <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-brand">
              {STATUS_LABELS[data?.status ?? "not_started"]}
            </span>
            <span>
              {data?.updatedAt
                ? `Atualizado às ${new Date(data.updatedAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Aguardando registros do admin"}
            </span>
          </div>
        </header>

        {!publicSlug ? (
          <LiveEmptyState />
        ) : isLoading ? (
          <div className="rounded-2xl border border-neutral-800 bg-[#161616] p-8 text-center text-sm text-neutral-300">
            Carregando placar ao vivo...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            Falha ao carregar o placar ao vivo.
          </div>
        ) : !data || data.matches.length === 0 ? (
          <LiveEmptyState />
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.matches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </section>

            <LiveStandingsTable rows={data.standings} />
            <LiveHighlightsPanel highlights={data.highlights} />
            <LiveTimeline events={data.timeline} />
          </>
        )}
      </div>
    </main>
  );
}
