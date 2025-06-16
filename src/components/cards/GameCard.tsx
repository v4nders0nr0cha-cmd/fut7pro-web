"use client";

import Image from "next/image";

export default function GameCard({
  teamA,
  teamB,
  score,
}: {
  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
  score: string;
}) {
  return (
    <div className="flex items-center justify-between bg-[#2A2A2A] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Image
          src={teamA.logo}
          alt={`Escudo do ${teamA.name}`}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-white text-sm">{teamA.name}</span>
      </div>
      <span className="text-yellow-400 text-lg font-bold">{score}</span>
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">{teamB.name}</span>
        <Image
          src={teamB.logo}
          alt={`Escudo do ${teamB.name}`}
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
    </div>
  );
}
