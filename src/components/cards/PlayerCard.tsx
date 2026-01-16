"use client";

import Image from "next/image";
import Link from "next/link";

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
    highlightText?: string;
    highlightDescription?: string;
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
}: PlayerCardProps) {
  const normalizedPlayer =
    player ||
    ({
      id: name || "player",
      name: name || "Jogador",
      posicao: title,
      foto: image,
      highlightText: value,
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
    highlightText,
    highlightDescription,
  } = normalizedPlayer;

  const imagePath = foto && foto.length > 0 ? foto : "/images/jogadores/jogador_padrao_01.jpg";
  const safeName = playerName || name || "Jogador";

  const attendancePercent = partidas > 0 ? `${Math.round((presencas / partidas) * 100)}%` : "0%";

  const isHighlight = Boolean(highlightText || highlightDescription);

  const content = isHighlight ? (
    <article
      className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex gap-4 items-center justify-between mb-4 shadow-md transition-all duration-300 hover:bg-[#222] w-full max-w-full"
      aria-label={`CartÆo do jogador ${safeName}`}
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
          {highlightText ? (
            <p className="text-sm font-semibold text-yellow-300 mt-1">{highlightText}</p>
          ) : null}
          {highlightDescription ? (
            <p className="text-xs text-gray-400 mt-1 leading-snug">{highlightDescription}</p>
          ) : null}
        </div>
      </div>
      {status !== "titular" ? (
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}>
          {status}
        </div>
      ) : null}
    </article>
  ) : (
    <article
      className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex gap-4 items-center justify-between mb-4 shadow-md transition-all duration-300 hover:bg-[#222] w-full max-w-full"
      aria-label={`Cartão do jogador ${safeName}`}
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
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Assistências">
              {assistencias}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Partidas">
              {partidas}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800" title="Presenças">
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
              <p className="text-gray-400">Assistências</p>
              <p>{assistencias}</p>
            </div>
            <div>
              <p className="text-gray-400">Partidas</p>
              <p>{partidas}</p>
            </div>
            <div>
              <p className="text-gray-400">Presenças</p>
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
