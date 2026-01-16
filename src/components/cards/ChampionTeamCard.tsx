"use client";

import Image from "next/image";
import Link from "next/link";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type ChampionTeamCardProps = {
  teamName: string;
  image: string;
};

const ChampionTeamCard = ({ teamName, image }: ChampionTeamCardProps) => {
  const teamImage = image && image.length > 0 ? image : "/images/times/time_padrao_01.png";
  const { publicHref } = usePublicLinks();

  return (
    <Link href={publicHref("/partidas")}>
      <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 mb-4 cursor-pointer hover:bg-[#2a2a2a] transition-all">
        <Image
          src={teamImage}
          alt={teamName}
          width={64}
          height={64}
          className="rounded-lg w-[64px] h-[64px] object-cover"
        />
        <div className="text-sm">
          <p className="text-[10px] font-bold uppercase text-yellow-400">Time Campeão do Dia</p>
          <p className="font-semibold text-white">{teamName}</p>
        </div>
      </div>
    </Link>
  );
};

export default ChampionTeamCard;
