"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { PublicMatch } from "@/types/partida";

const FALLBACK_LOGO = "/images/times/time_padrao_01.png";

function parseMatchDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function HistoricoPartidas() {
  const { publicSlug, publicHref } = usePublicLinks();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const { matches, isLoading, isError, error } = usePublicMatches({
    slug: publicSlug,
    from: monthStart.toISOString(),
    to: monthEnd.toISOString(),
  });

  const calendarDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [monthStart, monthEnd]);

  const matchDates = useMemo(() => {
    const dates = new Set<string>();
    matches.forEach((match) => {
      const date = parseMatchDate(match.date);
      if (date) {
        dates.add(format(date, "yyyy-MM-dd"));
      }
    });
    return dates;
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (!selectedDate) return matches;
    return matches.filter((match) => {
      const date = parseMatchDate(match.date);
      return date ? isSameDay(date, selectedDate) : false;
    });
  }, [matches, selectedDate]);

  const selectedLabel = selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <div className="bg-[#1A1A1A] border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              setCurrentMonth((prev) => addMonths(prev, -1));
              setSelectedDate(undefined);
            }}
            className="text-sm text-neutral-300 hover:text-yellow-400 transition"
          >
            {"<"}
          </button>
          <div className="text-sm font-semibold text-yellow-400">
            {format(currentMonth, "MM/yyyy")}
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentMonth((prev) => addMonths(prev, 1));
              setSelectedDate(undefined);
            }}
            className="text-sm text-neutral-300 hover:text-yellow-400 transition"
          >
            {">"}
          </button>
        </div>

        <div className="grid grid-cols-7 text-xs text-center text-neutral-500 mb-2">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const isCurrent = isSameMonth(day, monthStart);
            const hasMatch = matchDates.has(dayKey);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={dayKey}
                type="button"
                disabled={!isCurrent}
                onClick={() => {
                  if (isCurrent) setSelectedDate(day);
                }}
                className={`h-9 rounded-lg text-xs flex flex-col items-center justify-center transition ${
                  isSelected
                    ? "bg-yellow-400 text-black font-semibold"
                    : isCurrent
                      ? "text-neutral-200 hover:bg-neutral-800"
                      : "text-neutral-600"
                }`}
              >
                <span>{format(day, "d")}</span>
                {hasMatch && <span className="mt-1 h-1 w-1 rounded-full bg-yellow-400" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
          <span>{selectedDate ? `Selecionado: ${selectedLabel}` : "Selecione um dia"}</span>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(undefined)}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-neutral-300">Carregando partidas...</div>
        ) : isError ? (
          <div className="text-center text-red-400">
            Falha ao carregar partidas. {error instanceof Error ? error.message : ""}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center text-neutral-300">
            Nenhuma partida encontrada para o periodo selecionado.
          </div>
        ) : (
          filteredMatches.map((match: PublicMatch) => {
            const date = parseMatchDate(match.date);
            const dateLabel = date ? format(date, "dd/MM/yyyy HH:mm") : "Data nao informada";
            const hasScore = match.scoreA !== null && match.scoreB !== null;
            const scoreA = hasScore ? Number(match.scoreA) : null;
            const scoreB = hasScore ? Number(match.scoreB) : null;
            const winner = hasScore
              ? scoreA === scoreB
                ? "Empate"
                : scoreA > scoreB
                  ? match.teamA.name
                  : match.teamB.name
              : "A definir";

            return (
              <div
                key={match.id}
                className="bg-[#1A1A1A] border border-neutral-800 rounded-2xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">{dateLabel}</p>
                    <p className="text-sm text-neutral-300">
                      Local: {match.location || "Local nao informado"}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src={match.teamA.logoUrl || FALLBACK_LOGO}
                        alt={`Logo ${match.teamA.name}`}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold">{match.teamA.name}</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-400">
                      {hasScore ? `${scoreA} x ${scoreB}` : "-- x --"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Image
                        src={match.teamB.logoUrl || FALLBACK_LOGO}
                        alt={`Logo ${match.teamB.name}`}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold">{match.teamB.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-neutral-400">
                      {hasScore ? `Vencedor: ${winner}` : "Aguardando resultado"}
                    </span>
                    <Link
                      href={publicHref(`/partidas/detalhes/${match.id}`)}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition underline"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
