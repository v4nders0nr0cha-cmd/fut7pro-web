"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRacha } from "@/context/RachaContext";
import { usePublicMatches } from "@/hooks/usePublicMatches";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatDateLabel(value?: string | null) {
  if (!value) return "Data indefinida";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Data indefinida";
  const weekday = WEEKDAYS[parsed.getDay()] || "";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${weekday} ${day}/${month} • ${hour}:${minute}`;
}

export default function CardProximosJogos() {
  const { tenantSlug } = useRacha();
  const { matches, isLoading } = usePublicMatches({
    slug: tenantSlug || "",
    scope: "upcoming",
    limit: 4,
    enabled: Boolean(tenantSlug),
  });

  const proximosJogos = useMemo(() => {
    return matches.map((match) => {
      const label = formatDateLabel(match.date);
      const opponent =
        match.teamA?.name && match.teamB?.name
          ? `${match.teamA.name} x ${match.teamB.name}`
          : "Confronto a definir";
      return { id: match.id, label, opponent };
    });
  }, [matches]);

  return (
    <div className="bg-[#23272F] rounded-xl p-6 shadow flex flex-col h-full min-h-[140px]">
      <span className="text-[#41b6e6] font-bold text-lg">Próximos Jogos</span>
      {isLoading ? (
        <span className="mt-3 text-sm text-gray-400">Carregando jogos...</span>
      ) : proximosJogos.length > 0 ? (
        <div className="flex flex-col mt-2 gap-1">
          {proximosJogos.map((jogo) => (
            <div
              key={jogo.id}
              className="flex items-center justify-between text-white text-sm gap-4"
            >
              <span>{jogo.label}</span>
              <span className="font-semibold text-[#fff200] text-right">{jogo.opponent}</span>
            </div>
          ))}
        </div>
      ) : (
        <span className="mt-3 text-sm text-gray-400">Nenhum jogo agendado.</span>
      )}
      <Link href="/admin/partidas/proximos-rachas" className="text-xs text-gray-400 mt-2 underline">
        Ver agenda completa
      </Link>
    </div>
  );
}
