"use client";

import Image from "next/image";
import Link from "next/link";

type ChampionBannerProps = {
  image: string;
  date: string;
  players: string[];
  href: string; // rota dinâmica, obrigatória
};

const ChampionBanner = ({ image, date, players, href }: ChampionBannerProps) => {
  const bannerImage = image && image.length > 0 ? image : "/images/torneios/torneio-matador.jpg";

  const altText = `Imagem do Time Campeão do Dia - ${date}`;

  return (
    <Link href={href} className="block mb-10">
      <div className="flex flex-col md:flex-row items-center bg-[#1a1a1a] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#FFD700] group">
        <div className="w-full md:w-2/3 aspect-[16/9] relative">
          <Image
            src={bannerImage}
            alt={altText}
            fill
            className="object-cover brightness-90"
            priority
          />
        </div>
        <div className="w-full md:w-1/3 flex flex-col justify-center items-center md:items-start p-6 text-center md:text-left">
          <p className="text-yellow-400 text-xl sm:text-2xl md:text-3xl uppercase font-extrabold mb-2 drop-shadow-[0_0_5px_#FFD700]">
            Time Campeão do Dia
          </p>
          <p className="text-white text-base sm:text-lg md:text-xl font-semibold mb-2">{date}</p>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
            {players.length ? players.join(", ") : "Jogadores não cadastrados"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ChampionBanner;
