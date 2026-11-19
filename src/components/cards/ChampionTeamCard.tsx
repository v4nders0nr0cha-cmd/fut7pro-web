"use client";

import { TeamBadge } from "@/components/teams/TeamBadge";
import Link from "next/link";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type ChampionTeamCardProps = {
  teamName: string;
  image?: string | null;
};

const ChampionTeamCard = ({ teamName, image }: ChampionTeamCardProps) => {
  const { publicHref } = usePublicLinks();

  return (
    <Link href={publicHref("/partidas")}>
      <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 mb-4 cursor-pointer hover:bg-[#2a2a2a] transition-all">
        <TeamBadge name={teamName} logo={image} size={64} />
        <div className="text-sm">
          <p className="text-[10px] font-bold uppercase text-brand">Time Campeão do Dia</p>
          <p className="font-semibold text-white">{teamName}</p>
        </div>
      </div>
    </Link>
  );
};

export default ChampionTeamCard;
