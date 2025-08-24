"use client";

import Image from "next/image";
import Link from "next/link";

type ChampionTeamCardProps = {
  teamName: string;
  image: string;
};

const ChampionTeamCard = ({ teamName, image }: ChampionTeamCardProps) => {
  const teamImage =
    image && image.length > 0
      ? image
      : "/images/times/time_campeao_padrao_01.png";

  return (
    <Link href="/partidas">
      <div className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl bg-[#1a1a1a] p-3 transition-all hover:bg-[#2a2a2a]">
        <Image
          src={teamImage}
          alt={teamName}
          width={64}
          height={64}
          className="h-[64px] w-[64px] rounded-lg object-cover"
        />
        <div className="text-sm">
          <p className="text-[10px] font-bold uppercase text-yellow-400">
            Time Campeão do Dia
          </p>
          <p className="font-semibold text-white">{teamName}</p>
        </div>
      </div>
    </Link>
  );
};

export default ChampionTeamCard;
