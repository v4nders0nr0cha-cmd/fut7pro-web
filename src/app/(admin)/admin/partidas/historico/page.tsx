"use client";

import Head from "next/head";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CalendarioHistorico from "@/components/partidas/CalendarioHistorico";
import { useAuth } from "@/hooks/useAuth";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { rachaConfig } from "@/config/racha.config";
import type { Match } from "@/types/partida";

const DEFAULT_TEAM_LOGO = "/images/times/time_padrao_01.png";

type GroupedMatches = Record<
  string,
  {
    key: string;
    dateLabel: string;
    locationLabel: string;
    matches: Match[];
  }
>;

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function groupMatchesByDateAndLocation(matches: Match[], selected?: Date): GroupedMatches {
  const filtered = selected
    ? matches.filter((match) => {
        const matchDate = new Date(match.date);
        return matchDate.toDateString() === selected.toDateString();
      })
    : matches;

  return filtered.reduce<GroupedMatches>((acc, match) => {
    const dateKey = match.date.slice(0, 10);
    const location = match.location ?? "Local nao informado";
    const compositeKey = `${dateKey}||${location}`;

    if (!acc[compositeKey]) {
      acc[compositeKey] = {
        key: compositeKey,
        dateLabel: formatDateLabel(match.date),
        locationLabel: location,
        matches: [],
      };
    }

    acc[compositeKey].matches.push(match);
    return acc;
  }, {});
}

function resolveTeam(
  match: Match,
  side: "A" | "B",
): { nome: string; logo: string; gols: number | null } {
  const teamInfo = side === "A" ? match.teamA : match.teamB;
  const score =
    match.score?.[side === "A" ? "teamA" : "teamB"] ??
    (side === "A" ? match.scoreA : match.scoreB) ??
    null;

  return {
    nome: teamInfo?.name ?? (side === "A" ? "Time A" : "Time B"),
    logo: teamInfo?.logoUrl ?? DEFAULT_TEAM_LOGO,
    gols: score,
  };
}

export default function AdminHistoricoPartidasPage() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug && user.tenantSlug.length > 0 ? user.tenantSlug : null;
  const effectiveSlug = tenantSlug ?? rachaConfig.slug;

  const { matches, isLoading, isError, error } = useAdminMatches({
    slug: effectiveSlug,
    params: { limit: 100 },
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const diasComPartida = useMemo(() => {
    const uniqueDates = new Set(matches.map((match) => match.date.slice(0, 10)));
    return Array.from(uniqueDates).map((iso) => new Date(`${iso}T00:00:00`));
  }, [matches]);

  const groupedMatches = useMemo(
    () => groupMatchesByDateAndLocation(matches, selectedDate),
    [matches, selectedDate],
  );

  const sortedGroups = useMemo(() => {
    return Object.values(groupedMatches).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [groupedMatches]);

  return (
    <>
      <Head>
        <title>Historico de Partidas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Visualize os confrontos registrados no backend, filtre por data e acompanhe os detalhes de cada partida para auditoria rapida."
        />
        <meta
          name="keywords"
          content="admin fut7, partidas, auditoria, resultados, historico, futebol 7"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-5xl mx-auto text-white">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 text-center">
          Historico de Partidas (Admin)
        </h1>
        <p className="text-base md:text-lg mb-6 text-textoSuave text-center">
          Selecione um dia para conferir todos os confrontos registrados no backend e facilite a
          revisao dos resultados do seu racha.
        </p>

        <div className="flex justify-end mb-6">
          <button
            ref={buttonRef}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition shadow"
            onClick={() => setCalendarOpen((current) => !current)}
            aria-label="Filtrar por data"
            type="button"
          >
            <span role="img" aria-hidden>
              📅
            </span>
            {selectedDate
              ? selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Filtrar por data"}
          </button>
        </div>

        <CalendarioHistorico
          diasComPartida={diasComPartida}
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setCalendarOpen(false);
          }}
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          anchorRef={buttonRef}
        />

        {isLoading && (
          <div className="bg-zinc-800 rounded-2xl shadow p-6 text-center mt-6">
            <span className="text-yellow-400 font-semibold">Carregando partidas...</span>
          </div>
        )}

        {isError && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl shadow p-6 text-center mt-6">
            <p className="text-red-300 font-semibold">
              Nao foi possivel carregar as partidas: {error ?? "erro desconhecido"}.
            </p>
            <p className="text-red-200 text-sm mt-2">
              Verifique se existe historico registrado para este tenant e tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && sortedGroups.length === 0 && (
          <div className="bg-zinc-800 rounded-2xl shadow p-6 text-center mt-6">
            <p className="text-textoSuave">
              Nenhuma partida encontrada {selectedDate ? "para a data selecionada." : "no historico."}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8 mt-8">
          {sortedGroups.map((group) => (
            <section
              key={group.key}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden"
            >
              <header className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/70">
                <h2 className="text-xl font-semibold text-yellow-300">{group.dateLabel}</h2>
                <p className="text-sm text-zinc-400">{group.locationLabel}</p>
              </header>
              <div className="divide-y divide-zinc-800">
                {group.matches.map((match) => {
                  const teamA = resolveTeam(match, "A");
                  const teamB = resolveTeam(match, "B");
                  const matchDate = new Date(match.date);
                  const horario = matchDate.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <article key={match.id} className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Image
                            src={teamA.logo}
                            alt={`Logo ${teamA.nome}`}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                          <span className="font-semibold">{teamA.nome}</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-300 min-w-[90px] text-center">
                          {teamA.gols ?? "-"} <span className="text-yellow-500">x</span>{" "}
                          {teamB.gols ?? "-"}
                        </div>
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Image
                            src={teamB.logo}
                            alt={`Logo ${teamB.nome}`}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                          <span className="font-semibold">{teamB.nome}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-zinc-400 md:w-[160px]">
                        <span>
                          Horario: <strong>{horario}</strong>
                        </span>
                        <span>
                          Presencas registradas: <strong>{match.presences.length}</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/partidas/${match.id}`}
                          className="px-3 py-1.5 rounded bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition"
                        >
                          Ver no site
                        </Link>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded border border-zinc-700 text-sm text-zinc-300 hover:border-yellow-400 transition"
                          onClick={() => {
                            alert("Edicao de partidas sera integrada apos exposicao dos endpoints.");
                          }}
                        >
                          Ajustar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
