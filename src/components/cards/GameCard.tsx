"use client";

import { TeamBadge } from "@/components/teams/TeamBadge";

export default function GameCard({
  teamA,
  teamB,
  score,
}: {
  teamA: { name: string; logo?: string | null; color?: string | null };
  teamB: { name: string; logo?: string | null; color?: string | null };
  score: string;
}) {
  return (
    <div className="flex items-center justify-between bg-[#2A2A2A] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <TeamBadge name={teamA.name} color={teamA.color} logo={teamA.logo} size={32} />
        <span className="text-white text-sm">{teamA.name}</span>
      </div>
      <span className="text-brand text-lg font-bold">{score}</span>
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">{teamB.name}</span>
        <TeamBadge name={teamB.name} color={teamB.color} logo={teamB.logo} size={32} />
      </div>
    </div>
  );
}
