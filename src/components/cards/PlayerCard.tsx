"use client";

import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import type { MouseEvent } from "react";

import type { Role } from "@/common/enums";

type PlayerStatus = "titular" | "substituto" | "ausente";

interface PlayerCardProps {
  player?: {
    id: string;
    name: string;
    email?: string;
    role?: Role | string;
    tenantId?: string;
    foto?: string | null;
    telefone?: string;
    posicao?: string;
    gols?: number;
    assistencias?: number;
    partidas?: number;
    presencas?: number;
    status?: PlayerStatus;
    highlightBadge?: string;
    highlightCriteria?: string;
    highlightValue?: number | null;
    highlightValueLabel?: string;
    highlightFooterText?: string;
    highlightIcon?: string;
  };
  racha?: {
    id: string;
    name: string;
    tenantId?: string;
  };
  href?: string;
  // Suporte a props legadas usadas em algumas páginas públicas
  title?: string;
  name?: string;
  value?: string;
  image?: string;
  onRulesClick?: () => void;
}

function getStatusStyle(status?: PlayerStatus) {
  if (status === "substituto") return "bg-yellow-500 text-black";
  if (status === "ausente") return "bg-red-500 text-white";
  return "bg-green-500 text-white";
}

export default function PlayerCard({
  player,
  racha,
  href,
  title,
  name,
  value,
  image,
  onRulesClick,
}: PlayerCardProps) {
  const normalizedPlayer =
    player ||
    ({
      id: name || "player",
      name: name || "Jogador",
      posicao: title,
      foto: image,
      highlightFooterText: value,
    } as PlayerCardProps["player"]);

  const {
    name: playerName,
    foto,
    posicao,
    gols = 0,
    assistencias = 0,
    partidas = 0,
    presencas = 0,
    status = "titular",
    highlightBadge,
    highlightCriteria,
    highlightValue,
    highlightValueLabel,
    highlightFooterText,
    highlightIcon,
  } = normalizedPlayer;

  const imagePath = foto && foto.length > 0 ? foto : "/images/jogadores/jogador_padrao_01.jpg";
  const safeName = playerName || name || "Jogador";

  const attendancePercent = partidas > 0 ? `${Math.round((presencas / partidas) * 100)}%` : "0%";

  const hasHighlightValue = typeof highlightValue === "number";
  const isHighlight = Boolean(
    highlightCriteria || highlightFooterText || highlightBadge || highlightIcon || hasHighlightValue
  );
  const badgeStyle =
    highlightBadge?.toLowerCase().includes("manual") === true
      ? "bg-red-500/20 text-red-200 border-red-500/40"
      : "bg-yellow-400/15 text-yellow-200 border-yellow-400/40";
  const footerText = highlightFooterText || highlightBadge || "";

  const handleRulesClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onRulesClick?.();
  };

  const content = isHighlight ? (
    <article
      className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex flex-col gap-3 mb-4 shadow-md transition-all duration-300 hover:bg-[#222] w-full max-w-full"
      aria-label={`Cartao do jogador ${safeName}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] uppercase font-bold text-yellow-400 tracking-wide truncate">
            {posicao || "Jogador"}
          </p>
          {highlightBadge ? (
            <span
              className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${badgeStyle}`}
            >
              {highlightBadge}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {highlightIcon ? (
            <Image
              src={highlightIcon}
              alt={`Premio ${posicao || "Destaque"}`}
              width={22}
              height={22}
              className="object-contain"
            />
          ) : null}
          {onRulesClick ? (
            <button
              type="button"
              onClick={handleRulesClick}
              aria-label="Regras dos Destaques do Dia"
              className="rounded-full border border-white/10 bg-white/5 p-1 text-gray-200 hover:text-yellow-300"
            >
              <Info size={14} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-14 h-14 relative rounded-md overflow-hidden flex-shrink-0 bg-[#111]">
          <Image
            src={imagePath}
            alt={safeName}
            fill
            className="object-cover rounded-md"
            sizes="56px"
            priority
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-base font-semibold text-white truncate">{playerName}</p>
          {highlightCriteria ? (
            <p className="text-xs text-gray-400 truncate">{highlightCriteria}</p>
          ) : null}
        </div>
      </div>
      <div className="flex items-end justify-between border-t border-white/10 pt-2">
        {hasHighlightValue ? (
          <div className="flex items-baseline gap-1 text-yellow-300">
            <span className="text-2xl font-bold text-yellow-400">{highlightValue}</span>
            <span className="text-xs uppercase">{highlightValueLabel}</span>
          </div>
        ) : footerText ? (
          <span className="text-sm font-semibold text-yellow-300">{footerText}</span>
        ) : (
          <span className="text-xs text-gray-500">Sem destaque</span>
        )}
      </div>
    </article>
  ) : (
    <article
      className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex gap-4 items-center justify-between mb-4 shadow-md transition-all duration-300 hover:bg-[#222] w-full max-w-full"
      aria-label={`Cartao do jogador ${safeName}`}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] relative rounded-md overflow-hidden flex-shrink-0 bg-[#111]">
          <Image
            src={imagePath}
            alt={safeName}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 640px) 64px, 80px"
            priority
          />
        </div>
        <div className="flex flex-col justify-center w-full">
          <p className="text-[12px] text-[#FFCC00] font-bold uppercase leading-none">
            {posicao || "Jogador"}
          </p>
          <p className="text-base font-semibold text-white leading-tight break-words">
            {playerName}
          </p>
          <div className="flex gap-2 mt-1 text-xs text-gray-300">
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Gols">
              {gols}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Assistencias">
              {assistencias}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Partidas">
              {partidas}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Presencas">
              {presencas}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Assiduidade">
              {attendancePercent}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-white">
            <div>
              <p className="text-gray-400">Gols</p>
              <p>{gols}</p>
            </div>
            <div>
              <p className="text-gray-400">Assistencias</p>
              <p>{assistencias}</p>
            </div>
            <div>
              <p className="text-gray-400">Partidas</p>
              <p>{partidas}</p>
            </div>
            <div>
              <p className="text-gray-400">Presencas</p>
              <p>{presencas}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}>
        {status}
      </div>
    </article>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
