"use client";

import Image from "next/image";
import Link from "next/link";
import { rachaConfig } from "@/config/racha.config";

interface PlayerCardProps {
  title: string;
  name: string;
  value?: string; // Opcional (gols, assistências etc)
  image: string;
  href?: string; // Opcional
  showTrophy?: boolean; // Opcional
}

export default function PlayerCard({
  title,
  name,
  value,
  image,
  href,
  showTrophy = false,
}: PlayerCardProps) {
  // fallback para imagem padrão se não vier nenhuma
  const imagePath =
    image && image.length > 0 ? image : "/images/jogadores/default.png";

  // Tooltip institucional
  const getTooltip = () => {
    if (title.toLowerCase().includes("atacante"))
      return "Melhor atacante do time campeão";
    if (title.toLowerCase().includes("meia"))
      return "Melhor meia do time campeão";
    if (title.toLowerCase().includes("zagueiro"))
      return "Zagueiro destaque do time campeão";
    if (title.toLowerCase().includes("goleiro"))
      return "Goleiro do time campeão";
    return name;
  };

  // ALT institucional SEO
  const getAltText = () => {
    const cargo = title.replace(" do Dia", "");
    return `${cargo} do dia - ${name} | ${rachaConfig.nome}`;
  };

  // Layout base
  const cardClasses =
    "bg-[#1a1a1a] rounded-xl px-4 py-3 flex gap-4 items-center justify-between mb-4 shadow-md transition-all duration-300 hover:bg-[#222] hover:shadow-[0_0_10px_2px_#FFCC00] cursor-pointer w-full max-w-full";

  const content = (
    <div className={cardClasses} title={getTooltip()}>
      <div className="flex w-full items-center gap-4">
        <div className="relative h-[64px] w-[64px] flex-shrink-0 overflow-hidden rounded-md sm:h-[80px] sm:w-[80px]">
          <Image
            src={imagePath}
            alt={getAltText()}
            fill
            className="rounded-md object-cover"
            sizes="(max-width: 640px) 64px, 80px"
            priority
          />
        </div>
        <div className="flex w-full flex-col justify-center">
          <p className="text-[12px] font-bold uppercase leading-none text-[#FFCC00]">
            {title}
          </p>
          <p className="break-words text-base font-semibold leading-tight text-white">
            {name}
          </p>
          {/* Só mostra o value se existir */}
          {value && (
            <p className="text-sm font-medium text-yellow-400">{value}</p>
          )}
        </div>
      </div>
      {showTrophy && <div className="text-3xl">🏆</div>}
    </div>
  );

  // Retorna com ou sem link
  return href ? <Link href={href}>{content}</Link> : content;
}
