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
  const imagePath = image && image.length > 0 ? image : "/images/jogadores/default.png";

  // Tooltip institucional
  const getTooltip = () => {
    if (title.toLowerCase().includes("atacante")) return "Melhor atacante do time campeão";
    if (title.toLowerCase().includes("meia")) return "Melhor meia do time campeão";
    if (title.toLowerCase().includes("zagueiro")) return "Zagueiro destaque do time campeão";
    if (title.toLowerCase().includes("goleiro")) return "Goleiro do time campeão";
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
      <div className="flex items-center gap-4 w-full">
        <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] relative rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={imagePath}
            alt={getAltText()}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 640px) 64px, 80px"
            priority
          />
        </div>
        <div className="flex flex-col justify-center w-full">
          <p className="text-[12px] text-[#FFCC00] font-bold uppercase leading-none">{title}</p>
          <p className="text-base font-semibold text-white leading-tight break-words">{name}</p>
          {/* Só mostra o value se existir */}
          {value && <p className="text-sm text-yellow-400 font-medium">{value}</p>}
        </div>
      </div>
      {showTrophy && <div className="text-3xl">🏆</div>}
    </div>
  );

  // Retorna com ou sem link
  return href ? <Link href={href}>{content}</Link> : content;
}
