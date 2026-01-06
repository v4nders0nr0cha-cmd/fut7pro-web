"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { FaExclamationTriangle } from "react-icons/fa";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import type { PublicMatch } from "@/types/partida";

const STATUS_STORAGE_KEY = "fut7pro_match_status";
const ROTATION_MS = 10000;
const ITEM_HEIGHT = 80;

// MOCK: proximos rachas/feriados (simule integracao real depois)
const PROXIMOS_RACHAS = [
  { data: "Sab 06/07/25", hora: "06:00", feriado: false },
  { data: "Qua 10/07/25", hora: "20:30", feriado: true, feriadoNome: "Feriado Municipal" },
];

type MatchStatus = "not_started" | "in_progress" | "finished";

type NotificationItem = {
  id: string;
  message: string;
};

function parseMatchDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function loadStatusMap() {
  if (typeof window === "undefined") return {} as Record<string, MatchStatus>;
  const raw = window.localStorage.getItem(STATUS_STORAGE_KEY);
  if (!raw) return {} as Record<string, MatchStatus>;
  try {
    const parsed = JSON.parse(raw) as Record<string, MatchStatus>;
    return parsed || {};
  } catch {
    return {} as Record<string, MatchStatus>;
  }
}

function resolveMatchStatus(match: PublicMatch, statusMap: Record<string, MatchStatus>) {
  const override = statusMap[match.id];
  if (override) return override;
  if (match.scoreA === null || match.scoreB === null) {
    const hasGoals = match.presences.some((presence) => Number(presence.goals ?? 0) > 0);
    return hasGoals ? "in_progress" : "not_started";
  }
  return "finished";
}

export default function BannerNotificacoes() {
  const { matches } = useAdminMatches();
  const [showBanner, setShowBanner] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, MatchStatus>>({});

  useEffect(() => {
    setStatusMap(loadStatusMap());
  }, []);

  const feriadoRacha = useMemo(() => PROXIMOS_RACHAS.find((r) => r.feriado), []);

  const pendingInfo = useMemo(() => {
    const today = startOfDay(new Date());
    const pending = matches
      .map((match) => {
        const date = parseMatchDate(match.date);
        if (!date) return null;
        return {
          date,
          status: resolveMatchStatus(match, statusMap),
        };
      })
      .filter(Boolean)
      .filter((item) => {
        const day = startOfDay((item as { date: Date }).date);
        return (
          day.getTime() < today.getTime() && (item as { status: MatchStatus }).status !== "finished"
        );
      }) as Array<{ date: Date; status: MatchStatus }>;

    if (!pending.length) return null;
    pending.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
      count: pending.length,
      oldestDate: pending[0].date,
    };
  }, [matches, statusMap]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    if (feriadoRacha) {
      items.push({
        id: "holiday-warning",
        message: `Atencao: Seu racha esta agendado para um dia de feriado (${feriadoRacha.data}${
          feriadoRacha.feriadoNome ? ` - ${feriadoRacha.feriadoNome}` : ""
        }). Confirme se o racha ira acontecer normalmente ou reagende.`,
      });
    }

    if (pendingInfo) {
      items.push({
        id: "pending-results",
        message: `Atencao: ${pendingInfo.count} ${
          pendingInfo.count === 1 ? "confronto" : "confrontos"
        } sem resultado pendente${
          pendingInfo.count === 1 ? "" : "s"
        } desde ${format(pendingInfo.oldestDate, "dd/MM/yyyy")}. Publique os resultados para atualizar rankings e historico.`,
      });
    }

    return items;
  }, [feriadoRacha, pendingInfo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [notifications.length]);

  useEffect(() => {
    if (!showBanner) return;
    if (isPaused) return;
    if (notifications.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % notifications.length);
    }, ROTATION_MS);

    return () => clearInterval(timer);
  }, [isPaused, notifications.length, showBanner]);

  if (!showBanner || notifications.length === 0) return null;

  const offset = activeIndex * ITEM_HEIGHT;

  return (
    <div className="mb-4">
      <div
        className="relative rounded-lg border-l-4 border-yellow-400 bg-yellow-900/70 text-yellow-200 shadow"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="overflow-hidden" style={{ height: ITEM_HEIGHT }}>
          <div
            className="transition-transform duration-500"
            style={{ transform: `translateY(-${offset}px)` }}
          >
            {notifications.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold"
                style={{ height: ITEM_HEIGHT }}
              >
                <FaExclamationTriangle className="text-yellow-300 text-lg" />
                <span className="leading-snug">{item.message}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="absolute right-3 top-2 text-lg text-yellow-200 hover:text-white transition"
          aria-label="Fechar alerta"
          onClick={() => setShowBanner(false)}
        >
          x
        </button>
      </div>
    </div>
  );
}
