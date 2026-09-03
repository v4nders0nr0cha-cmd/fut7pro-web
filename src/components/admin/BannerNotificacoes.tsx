"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { FaExclamationTriangle } from "react-icons/fa";
import Link from "next/link";
import { useAdminDestaquesRodadas } from "@/hooks/useAdminDestaquesRodadas";
import { useProximosRachas } from "@/hooks/useProximosRachas";
import type { ProximoRachaItem } from "@/types/agenda";

const ROTATION_MS = 10000;
const ITEM_HEIGHT = 80;
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type NotificationItem = {
  id: string;
  message: string;
  href?: string;
  actionLabel?: string;
};

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

export default function BannerNotificacoes() {
  const { queue } = useAdminDestaquesRodadas();
  const { items: proximosRachas } = useProximosRachas({ limit: 10 });
  const [showBanner, setShowBanner] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const feriadoRacha = useMemo(
    () => proximosRachas.find((racha) => racha.holiday),
    [proximosRachas]
  );

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

    if (queue.rodadasIncompletas.length > 0) {
      items.push({
        id: "pending-results",
        message: `Atenção: você possui ${queue.rodadasIncompletas.length} ${
          queue.rodadasIncompletas.length === 1 ? "rodada" : "rodadas"
        } com resultados pendentes. Conclua os confrontos para atualizar rankings, histórico e liberar o Time Campeão do Dia.`,
        href: "/admin/partidas/historico",
        actionLabel: "Concluir resultados",
      });
    }

    if (queue.rodadasAguardandoCampeao.length > 0) {
      items.push({
        id: "champion-day-pending",
        message: `Atenção: você possui ${queue.rodadasAguardandoCampeao.length} ${
          queue.rodadasAguardandoCampeao.length === 1 ? "rodada concluída" : "rodadas concluídas"
        } aguardando o registro do Time Campeão do Dia e dos destaques.`,
        href: "/admin/partidas/time-campeao-do-dia",
        actionLabel: "Registrar campeões",
      });
    }

    if (queue.rodadasPrecisandoRevisao.length > 0) {
      const firstRound = queue.rodadasPrecisandoRevisao[0];
      items.push({
        id: "champion-day-review-required",
        message: `Atenção: você possui ${queue.rodadasPrecisandoRevisao.length} ${
          queue.rodadasPrecisandoRevisao.length === 1
            ? "rodada publicada com resultados alterados"
            : "rodadas publicadas com resultados alterados"
        }. Revise o Time Campeão e os destaques.`,
        href: firstRound?.reviewUrl || "/admin/partidas/time-campeao-do-dia",
        actionLabel: "Revisar publicação",
      });
    }

    return items;
  }, [
    feriadoRacha,
    queue.rodadasAguardandoCampeao.length,
    queue.rodadasIncompletas.length,
    queue.rodadasPrecisandoRevisao,
  ]);

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
                {item.href && item.actionLabel && (
                  <Link
                    href={item.href}
                    className="ml-auto hidden shrink-0 rounded-md bg-yellow-300 px-3 py-1 text-xs font-bold text-black sm:inline-flex"
                  >
                    {item.actionLabel}
                  </Link>
                )}
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
