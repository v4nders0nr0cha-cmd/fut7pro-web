"use client";

import Image from "next/image";
import Link from "next/link";

type PlayerCardProps = {
  title: string;
  name: string;
  value: string;
  image: string;
  href?: string;
};

export default function PlayerCard({ title, name, value, image, href }: PlayerCardProps) {
  const imagePath = image && image.length > 0 ? image : "/images/jogadores/default.png";

  const getTooltip = () => {
    if (title.toLowerCase().includes("zagueiro")) {
      return "Melhor zagueiro do dia";
    }
    if (title.toLowerCase().includes("goleiro")) {
      return "Melhor goleiro do dia";
    }
    return value;
  };

  const getAltText = () => {
    const cargo = title.replace(" do Dia", "");
    return `${cargo} do dia - ${name}`;
  };

  const content = (
    <div
      className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex gap-4 items-center mb-4 shadow-md transition-all duration-300 hover:bg-[#2a2a2a] hover:shadow-[0_0_10px_2px_#FFCC00] cursor-pointer"
      title={getTooltip()}
    >
      <div className="w-[80px] h-[80px] relative rounded-md overflow-hidden flex-shrink-0">
        <Image src={imagePath} alt={getAltText()} fill className="object-cover rounded-md" />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-[12px] text-[#FFCC00] font-bold uppercase leading-none">{title}</p>
        <p className="text-base font-semibold text-white leading-tight">{name}</p>
        <p className="text-sm text-yellow-400 font-medium">{value}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
