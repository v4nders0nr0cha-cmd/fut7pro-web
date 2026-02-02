"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { FaExclamationTriangle } from "react-icons/fa";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { useProximosRachas } from "@/hooks/useProximosRachas";
import type { PublicMatch } from "@/types/partida";
import type { ProximoRachaItem } from "@/types/agenda";

const STATUS_STORAGE_KEY = "fut7pro_match_status";
const ROTATION_MS = 10000;
const ITEM_HEIGHT = 80;
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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

function buildOccurrenceDate(item: ProximoRachaItem | null) {
  if (!item?.date || !item?.time) return null;
  const [year, month, day] = item.date.split("-").map((part) => Number(part));
  const [hour, minute] = item.time.split(":").map((part) => Number(part));
  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) return null;
  return new Date(year, month - 1, day, hour, minute);
}

function formatUpcomingLabel(item: ProximoRachaItem | null) {
  const date = buildOccurrenceDate(item);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const weekday = WEEKDAYS_SHORT[date.getDay()] || "";
  return `${weekday} ${day}/${month}/${year}`;
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
  const { items: proximosRachas } = useProximosRachas({ limit: 10 });
  const [showBanner, setShowBanner] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, MatchStatus>>({});

  useEffect(() => {
    setStatusMap(loadStatusMap());
  }, []);

  const feriadoRacha = useMemo(
    () => proximosRachas.find((racha) => racha.holiday),
    [proximosRachas]
  );

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
      const label = formatUpcomingLabel(feriadoRacha);
      items.push({
        id: "holiday-warning",
        message: `Atenção: Seu racha está agendado para um dia de feriado (${label}${
          feriadoRacha.holidayName ? ` - ${feriadoRacha.holidayName}` : ""
        }). Confirme se o racha irá acontecer normalmente ou reagende.`,
      });
    }

    if (pendingInfo) {
      items.push({
        id: "pending-results",
        message: `Atenção: ${pendingInfo.count} ${
          pendingInfo.count === 1 ? "confronto" : "confrontos"
        } sem resultado pendente${
          pendingInfo.count === 1 ? "" : "s"
        } desde ${format(pendingInfo.oldestDate, "dd/MM/yyyy")}. Publique os resultados para atualizar rankings e histórico.`,
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
