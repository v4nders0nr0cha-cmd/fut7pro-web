"use client";

import Image from "next/image";
import Link from "next/link";

type ChampionBannerProps = {
  image: string;
  date: string;
  players: string[];
  href: string; // rota dinâmica, obrigatória
};

const ChampionBanner = ({
  image,
  date,
  players,
  href,
}: ChampionBannerProps) => {
  const bannerImage =
    image && image.length > 0
      ? image
      : "/images/timecampeao/time-campeao-do-dia.png";

  const altText = `Imagem do Time Campeão do Dia - ${date}`;

  return (
    <Link href={href} className="mb-10 block">
      <div className="group flex flex-col items-center overflow-hidden rounded-xl bg-[#1a1a1a] shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#FFD700] md:flex-row">
        <div className="relative aspect-[16/9] w-full md:w-2/3">
          <Image
            src={bannerImage}
            alt={altText}
            fill
            className="object-cover brightness-90"
            priority
          />
        </div>
        <div className="flex w-full flex-col items-center justify-center p-6 text-center md:w-1/3 md:items-start md:text-left">
          <p className="mb-2 text-xl font-extrabold uppercase text-yellow-400 drop-shadow-[0_0_5px_#FFD700] sm:text-2xl md:text-3xl">
            Time Campeão do Dia
          </p>
          <p className="mb-2 text-base font-semibold text-white sm:text-lg md:text-xl">
            {date}
          </p>
          <p className="text-sm leading-relaxed text-gray-300 sm:text-base md:text-lg">
            {players.length ? players.join(", ") : "Jogadores não cadastrados"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ChampionBanner;
