"use client";

import { forwardRef } from "react";
import type { PremiumIndex, PremiumPosition, PremiumStats } from "@/utils/athlete-premium";
import { getPremiumPositionShortLabel } from "@/utils/athlete-premium";

type StoryLegendaryProgress = {
  seasonLabel: string;
  status: "locked" | "in_progress" | "unlocked";
  progressPercent: number;
  attendance: {
    current: number;
    target: number;
    score: number;
  };
  championOfDay: {
    current: number;
    target: number;
    score: number;
  };
  nextGoalMessage: string;
};

type ShareablePremiumCardStoryProps = {
  athlete: {
    name: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    position: PremiumPosition;
    membershipLabel?: string | null;
    activityStatusLabel?: string | null;
  };
  tenant?: {
    name?: string | null;
    slug?: string | null;
  };
  stats: PremiumStats;
  index: PremiumIndex;
  legendaryProgress: StoryLegendaryProgress;
};

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

const ShareablePremiumCardStory = forwardRef<HTMLDivElement, ShareablePremiumCardStoryProps>(
  function ShareablePremiumCardStory({ athlete, tenant, stats, index, legendaryProgress }, ref) {
    const displayName = athlete.nickname || athlete.name;
    const isLegendary = legendaryProgress.status === "unlocked";
    const seasonYear = legendaryProgress.seasonLabel.replace("Temporada ", "");
    const medalAsset = isLegendary
      ? "/images/athlete-premium/medals/medalhao-lendario.png"
      : "/images/athlete-premium/medals/medalhao-oficial.png";
    const avatar = athlete.avatarUrl || DEFAULT_AVATAR;

    return (
      <div
        ref={ref}
        className="relative h-[1920px] w-[1080px] overflow-hidden bg-[#030404] text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_23%,rgba(248,198,74,0.30),transparent_26%),radial-gradient(circle_at_20%_74%,rgba(248,198,74,0.16),transparent_28%),linear-gradient(145deg,#050505_0%,#11100b_44%,#030303_100%)]" />
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(130deg,transparent_0_18%,rgba(248,198,74,0.18)_18.2%,transparent_19.2%_46%,rgba(248,198,74,0.12)_46.2%,transparent_47.2%_100%)]" />
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-transparent via-[#f8c64a] to-transparent" />

        <header className="relative z-10 px-[78px] pt-24 text-center">
          <div className="text-[26px] font-black uppercase tracking-[0.52em] text-[#f8c64a]">
            Fut7Pro
          </div>
          <h1 className="mt-10 text-[76px] font-black uppercase leading-none tracking-wide text-white">
            {displayName}
          </h1>
          <p className="mt-5 text-[27px] text-zinc-300">
            {tenant?.name || tenant?.slug || "Racha"} • {legendaryProgress.seasonLabel}
          </p>
        </header>

        <section className="relative z-10 mx-auto mt-[72px] w-[900px] rounded-[52px] border border-[#d5a432]/75 bg-black/72 px-10 pb-12 pt-12 shadow-[0_0_0_8px_rgba(248,198,74,0.08),0_36px_90px_rgba(0,0,0,0.70),0_0_80px_rgba(248,198,74,0.28)]">
          <div className="absolute inset-0 rounded-[52px] bg-[radial-gradient(circle_at_50%_34%,rgba(248,198,74,0.22),transparent_30%),linear-gradient(145deg,rgba(255,240,168,0.10),transparent_38%)]" />

          <div className="relative grid grid-cols-[170px_1fr_170px] items-center gap-4">
            <div className="rounded-[28px] border border-[#f8c64a]/42 bg-black/60 px-4 py-8 text-center">
              <div className="text-[76px] font-black leading-none text-[#f8c64a]">
                {index.overall ?? "--"}
              </div>
              <div className="mt-4 text-[34px] font-black text-white">
                {getPremiumPositionShortLabel(athlete.position)}
              </div>
              <div className="mx-auto mt-5 h-px w-24 bg-[#f8c64a]/45" />
              <div className="mt-5 rounded-lg border border-[#f8c64a]/35 bg-[#0c0b07] px-3 py-3 text-[18px] font-black uppercase leading-tight text-[#f8c64a]">
                {athlete.membershipLabel || "Atleta"}
              </div>
              <div className="mt-3 rounded-lg border border-[#f8c64a]/25 bg-black/45 px-3 py-2 text-[16px] font-black uppercase leading-tight text-zinc-200">
                {athlete.activityStatusLabel || "Ativo"}
              </div>
            </div>

            <div className="relative mx-auto h-[438px] w-[438px]">
              <div className="absolute inset-0 rounded-full bg-[#f8c64a]/25 blur-3xl" />
              <div className="absolute left-[25.5%] top-[27%] z-0 h-[48%] w-[49%] overflow-hidden rounded-full bg-zinc-950">
                <img
                  src={avatar}
                  alt={`Foto de ${athlete.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <img
                src={medalAsset}
                alt={isLegendary ? "Medalhão lendário Fut7Pro" : "Medalhão oficial Fut7Pro"}
                className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_42px_rgba(248,198,74,0.55)]"
              />
            </div>

            <div className="rounded-[28px] border border-[#f8c64a]/42 bg-black/60 px-4 py-8 text-center">
              <div className="text-[18px] font-black uppercase tracking-[0.22em] text-zinc-400">
                {isLegendary ? "Lendário" : "Oficial"}
              </div>
              <div className="mt-4 text-[31px] font-black uppercase leading-tight text-[#f8c64a]">
                {tenant?.name || "Fut7Pro"}
              </div>
              <div className="mx-auto mt-5 h-px w-24 bg-[#f8c64a]/45" />
              <div className="mt-5 text-[18px] font-bold uppercase tracking-[0.22em] text-zinc-300">
                Temporada
              </div>
              <div className="mt-2 text-[42px] font-black text-[#f8c64a]">{seasonYear}</div>
            </div>
          </div>

          <div className="relative mx-auto mt-10 w-[640px] rounded-[30px] border border-[#f8c64a]/70 bg-[linear-gradient(180deg,rgba(58,38,11,0.98),rgba(6,5,3,0.98))] px-8 py-7 text-center shadow-[0_0_36px_rgba(248,198,74,0.30)]">
            <div className="text-[52px] font-black uppercase leading-none text-[#fff2bd]">
              {displayName}
            </div>
            <div className="mt-4 text-[22px] font-black uppercase tracking-[0.28em] text-[#f8c64a]">
              {isLegendary ? `Card Lendário ${seasonYear}` : "Card Oficial Fut7Pro"}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto mt-10 w-[900px] rounded-[34px] border border-[#f8c64a]/45 bg-black/62 p-8">
          <div className="grid grid-cols-4 gap-4">
            <StoryStat label="Jogos" value={stats.jogos} />
            <StoryStat label="Gols" value={stats.gols} />
            <StoryStat label="Assist." value={stats.assistencias} />
            <StoryStat label="Pontos" value={stats.pontos} />
            <StoryStat label="Campeão" value={stats.campeaoDia ?? 0} />
            <StoryStat label="Assid." value={`${stats.assiduidade}%`} />
            <StoryStat label="Média" value={stats.media.toFixed(2)} />
            <StoryStat label="Índice" value={index.value ?? "--"} />
          </div>
        </section>

        <section className="relative z-10 mx-auto mt-8 w-[900px] rounded-[34px] border border-[#f8c64a]/45 bg-black/62 p-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[20px] font-black uppercase tracking-[0.24em] text-[#f8c64a]">
                {isLegendary ? "Lendário desbloqueado" : "Rumo ao Lendário"}
              </div>
              <div className="mt-2 text-[34px] font-black text-white">
                {legendaryProgress.seasonLabel}
              </div>
            </div>
            <div className="text-[56px] font-black text-[#f8c64a]">
              {Math.round(legendaryProgress.progressPercent)}%
            </div>
          </div>
          <div className="mt-5 h-5 overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8f5f08] via-[#f8c64a] to-[#fff0a8]"
              style={{ width: `${Math.min(100, Math.max(4, legendaryProgress.progressPercent))}%` }}
            />
          </div>
          <p className="mt-5 text-[23px] leading-relaxed text-zinc-300">
            {legendaryProgress.nextGoalMessage}
          </p>
        </section>

        <footer className="absolute inset-x-0 bottom-16 z-10 text-center">
          <div className="text-[22px] font-black uppercase tracking-[0.38em] text-[#f8c64a]">
            fut7pro.com.br
          </div>
        </footer>
      </div>
    );
  }
);

function StoryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#f8c64a]/24 bg-black/45 px-4 py-5 text-center">
      <div className="text-[16px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-[36px] font-black text-[#f8c64a]">{value}</div>
    </div>
  );
}

export default ShareablePremiumCardStory;
