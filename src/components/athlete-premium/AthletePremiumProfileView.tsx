"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCopy,
  FaCrown,
  FaDownload,
  FaFutbol,
  FaImage,
  FaInfoCircle,
  FaMedal,
  FaShareAlt,
  FaShieldAlt,
  FaTimes,
  FaTrophy,
  FaTshirt,
  FaWhatsapp,
} from "react-icons/fa";
import type {
  PremiumAchievement,
  PremiumAchievementGroups,
  PremiumBadge,
  PremiumIndex,
  PremiumPosition,
  PremiumStats,
} from "@/utils/athlete-premium";
import { getPremiumPositionLabel, getPremiumPositionShortLabel } from "@/utils/athlete-premium";
import ShareablePremiumCardStory from "./ShareablePremiumCardStory";

type LegendaryProgress = {
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

type AthletePremiumProfileViewProps = {
  mode: "public" | "owner" | "admin";
  athlete: {
    name: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    position: PremiumPosition;
    positionLabel?: string | null;
    positionSecondaryLabel?: string | null;
    membershipLabel?: string | null;
    activityStatusLabel?: string | null;
  };
  tenant?: {
    name?: string | null;
    slug?: string | null;
  };
  stats: PremiumStats;
  index: PremiumIndex;
  achievements: PremiumAchievement[];
  achievementGroups?: PremiumAchievementGroups;
  badges: PremiumBadge[];
  legendaryProgress?: LegendaryProgress;
  links?: {
    statsUrl?: string;
    achievementsUrl?: string;
    historyUrl?: string;
  };
  ownerActions?: React.ReactNode;
  statsPeriod?: "current" | "all";
  onStatsPeriodChange?: (period: "current" | "all") => void;
};

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

function PremiumPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#b88922]/45 bg-[#060706]/80 shadow-[0_18px_45px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,223,139,0.12)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(248,198,74,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_38%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function MetricWidget({
  label,
  value,
  detail,
  variant = "level",
}: {
  label: string;
  value: string | number;
  detail: string;
  variant?: "level" | "index";
}) {
  const chart = [22, 31, 28, 42, 38, 52, 47, 65, 59, 78];

  return (
    <PremiumPanel className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-300">{label}</p>
          <div className="mt-1 text-4xl font-black leading-none text-[#f8c64a] drop-shadow-[0_0_16px_rgba(248,198,74,0.35)]">
            {value}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f8c64a]/35 bg-[#f8c64a]/10 text-[#f8c64a]">
          {variant === "level" ? <FaBolt /> : <FaChartBar />}
        </div>
      </div>

      {variant === "level" ? (
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-white/14">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#9b680e] via-[#f8c64a] to-[#fff0a8] shadow-[0_0_16px_rgba(248,198,74,0.48)]" />
          </div>
        </div>
      ) : (
        <div className="mt-3 flex h-10 items-end gap-1.5">
          {chart.map((height, indexItem) => (
            <span
              key={indexItem}
              className="flex-1 rounded-t bg-gradient-to-t from-[#9a6409] to-[#ffd15a]"
              style={{ height: `${height}%`, opacity: 0.5 + indexItem * 0.045 }}
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-sm text-zinc-300">{detail}</p>
    </PremiumPanel>
  );
}

function LegendaryProgressPanel({ progress }: { progress: LegendaryProgress }) {
  const isUnlocked = progress.status === "unlocked";

  return (
    <PremiumPanel className={isUnlocked ? "p-4 shadow-[0_0_42px_rgba(248,198,74,0.16)]" : "p-4"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f8c64a]">
            {isUnlocked ? "Lendário desbloqueado" : "Rumo ao Lendário"}
          </p>
          <h2 className="mt-1 text-lg font-black uppercase text-white">{progress.seasonLabel}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f8c64a]/50 bg-[#f8c64a]/12 text-[#f8c64a] shadow-[0_0_18px_rgba(248,198,74,0.28)]">
          {isUnlocked ? <FaCrown /> : <FaMedal />}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold text-zinc-300">Progresso</span>
          <strong className="text-3xl font-black text-[#f8c64a]">
            {progress.progressPercent}%
          </strong>
        </div>
        <div className="relative mt-2 h-3 overflow-hidden rounded-full border border-[#f8c64a]/25 bg-black/45">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8f5f08] via-[#f8c64a] to-[#fff0a8] shadow-[0_0_18px_rgba(248,198,74,0.55)]"
            style={{ width: `${Math.min(100, Math.max(4, progress.progressPercent))}%` }}
          />
          {isUnlocked && (
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <LegendaryMiniStat
          label="Assiduidade"
          value={`${progress.attendance.current}/${progress.attendance.target}`}
          score={progress.attendance.score}
        />
        <LegendaryMiniStat
          label="Campeão do Dia"
          value={`${progress.championOfDay.current}/${progress.championOfDay.target}`}
          score={progress.championOfDay.score}
        />
      </div>

      <p className="mt-3 rounded-lg border border-[#f8c64a]/18 bg-black/35 p-3 text-sm leading-relaxed text-zinc-300">
        {progress.nextGoalMessage}
      </p>
    </PremiumPanel>
  );
}

function LegendaryMiniStat({
  label,
  value,
  score,
}: {
  label: string;
  value: string;
  score: number;
}) {
  return (
    <div className="rounded-lg border border-[#f8c64a]/16 bg-black/30 p-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">{label}</div>
      <div className="mt-1 text-xl font-black text-[#f8c64a]">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {score.toFixed(1)} pts
      </div>
    </div>
  );
}

function MedalStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#f8c64a]/16 bg-black/32 px-2 py-2 text-center sm:px-2.5">
      <div className="text-[8px] font-bold uppercase tracking-[0.13em] text-zinc-400 sm:text-[10px] sm:tracking-[0.16em]">
        {label}
      </div>
      <div className="mt-1 text-base font-black text-[#f8c64a] sm:text-lg">{value}</div>
    </div>
  );
}

function PremiumAthleteMedallion({
  athlete,
  index,
  tenant,
  legendaryProgress,
}: {
  athlete: AthletePremiumProfileViewProps["athlete"];
  index: PremiumIndex;
  tenant?: AthletePremiumProfileViewProps["tenant"];
  legendaryProgress?: LegendaryProgress;
}) {
  const avatar = athlete.avatarUrl || DEFAULT_AVATAR;
  const shortPosition = getPremiumPositionShortLabel(athlete.position);
  const displayName = athlete.nickname || athlete.name;
  const positionTitle = athlete.positionLabel || getPremiumPositionLabel(athlete.position);
  const isLegendary = legendaryProgress?.status === "unlocked";
  const medalAsset = isLegendary
    ? "/images/athlete-premium/medals/medalhao-lendario.png"
    : "/images/athlete-premium/medals/medalhao-oficial.png";

  return (
    <article className="relative mx-auto w-full max-w-[860px]">
      <div className="absolute -inset-4 rounded-[42px] bg-[#f8c64a]/18 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-[#d5a432]/70 bg-[#050505] px-3 py-3 shadow-[0_0_0_5px_rgba(248,198,74,0.08),0_20px_50px_rgba(0,0,0,0.68),0_0_52px_rgba(248,198,74,0.32)] sm:px-6 sm:py-3.5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,229,141,0.34),transparent_29%),radial-gradient(circle_at_18%_40%,rgba(248,198,74,0.14),transparent_30%),radial-gradient(circle_at_82%_40%,rgba(248,198,74,0.14),transparent_30%),linear-gradient(145deg,#1c1710_0%,#050505_48%,#171008_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(132deg,transparent_0_15%,rgba(248,198,74,0.25)_15.2%,transparent_16.4%_43%,rgba(248,198,74,0.14)_43.2%,transparent_44.4%_100%)]" />
        <div className="pointer-events-none absolute inset-x-5 bottom-5 top-5 rounded-[26px] border border-[#f8c64a]/35" />
        <div className="pointer-events-none absolute inset-x-9 bottom-9 top-9 rounded-[22px] border border-[#6f4507]/55" />

        {isLegendary && (
          <>
            <div className="pointer-events-none absolute left-1/2 top-[43%] h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 animate-[spin_22s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(248,198,74,0.42),transparent,rgba(255,240,168,0.32),transparent)] blur-xl opacity-55 sm:h-[370px] sm:w-[370px]" />
            <span className="pointer-events-none absolute left-[33%] top-[17%] h-1.5 w-1.5 rounded-full bg-[#fff0a8] shadow-[0_0_12px_rgba(255,240,168,0.9)] animate-pulse" />
            <span className="pointer-events-none absolute right-[34%] top-[24%] h-1 w-1 rounded-full bg-[#f8c64a] shadow-[0_0_10px_rgba(248,198,74,0.9)] animate-pulse" />
            <span className="pointer-events-none absolute left-[43%] bottom-[26%] h-1 w-1 rounded-full bg-[#fff0a8] shadow-[0_0_10px_rgba(255,240,168,0.9)] animate-pulse" />
          </>
        )}

        <div className="relative z-10 grid grid-cols-[68px_1fr_68px] items-center gap-1.5 sm:grid-cols-[130px_1fr_130px] sm:gap-5">
          <div className="relative z-20 flex h-[142px] flex-col items-center justify-center rounded-[18px] border border-[#f8c64a]/38 bg-black/70 shadow-[inset_0_0_28px_rgba(248,198,74,0.08)] sm:h-[218px] sm:bg-black/46">
            <div className="text-3xl font-black leading-none text-[#f8c64a] drop-shadow-[0_0_18px_rgba(248,198,74,0.42)] sm:text-5xl">
              {index.overall ?? "--"}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-white sm:text-xl">
              {shortPosition}
              <span
                title={`${shortPosition} = ${positionTitle}`}
                className="text-[10px] text-[#f8c64a]/80 sm:text-xs"
              >
                <FaInfoCircle />
              </span>
            </div>
            <div className="mt-2 h-px w-9 bg-[#f8c64a]/45 sm:w-14" />
            <div className="mt-2 rounded border border-[#f8c64a]/35 bg-[#f8c64a]/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-[#fff0a8] sm:text-[10px]">
              {athlete.membershipLabel || "Avulso"}
            </div>
            <div className="mt-2 rounded border border-white/18 bg-black/55 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-zinc-100 sm:text-[10px]">
              {athlete.activityStatusLabel || "Inativo"}
            </div>
          </div>

          <div className="relative z-10 mx-auto flex h-[195px] w-full items-center justify-center sm:h-[254px]">
            <div className="absolute h-[200px] w-[200px] rounded-full bg-[#f8c64a]/20 blur-2xl sm:h-[260px] sm:w-[260px]" />
            <div className="relative h-[178px] w-[178px] sm:h-[266px] sm:w-[266px]">
              <div className="absolute left-[25.5%] top-[27%] z-0 h-[48%] w-[49%] overflow-hidden rounded-full bg-zinc-950">
                <img
                  src={avatar}
                  alt={`Foto de ${athlete.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {isLegendary && (
                <div className="absolute inset-[8%] z-[1] animate-[pulse_2.8s_ease-in-out_infinite] rounded-full border border-[#fff0a8]/30 shadow-[0_0_28px_rgba(248,198,74,0.52)]" />
              )}
              <img
                src={medalAsset}
                alt={isLegendary ? "Medalhão lendário Fut7Pro" : "Medalhão oficial Fut7Pro"}
                className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_24px_rgba(248,198,74,0.45)]"
              />
            </div>
          </div>

          <div className="relative z-20 flex h-[142px] flex-col items-center justify-center rounded-[18px] border border-[#f8c64a]/38 bg-black/70 px-2 text-center shadow-[inset_0_0_28px_rgba(248,198,74,0.08)] sm:h-[218px] sm:bg-black/46 sm:px-4">
            <div className="hidden items-center justify-center rounded-xl border border-[#f8c64a]/50 bg-black/50 text-[#f8c64a] shadow-[0_0_18px_rgba(248,198,74,0.20)] sm:flex sm:h-14 sm:w-14">
              <FaShieldAlt size={24} />
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-zinc-400 sm:mt-3 sm:text-[9px] sm:tracking-[0.18em]">
              {isLegendary ? "Lendário" : "Oficial"}
            </div>
            <div className="mt-1 max-w-[64px] text-[10px] font-black uppercase leading-tight text-[#f8c64a] sm:max-w-none sm:text-base">
              {tenant?.name || "Fut7Pro"}
            </div>
            <div className="mt-2 h-px w-9 bg-[#f8c64a]/45 sm:w-14" />
            <div className="mt-2 text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-300 sm:text-[9px] sm:tracking-[0.18em]">
              Temporada
            </div>
            <div className="mt-1 text-lg font-black text-[#f8c64a] sm:text-xl">2026</div>
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-1.5 w-full max-w-[480px] rounded-2xl border border-[#f8c64a]/70 bg-[linear-gradient(180deg,rgba(58,38,11,0.98),rgba(6,5,3,0.98))] px-4 py-2.5 text-center shadow-[0_0_24px_rgba(248,198,74,0.28),inset_0_1px_0_rgba(255,240,168,0.18)] sm:mt-2 sm:py-2">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#fff0a8]/80 to-transparent" />
          <h2 className="whitespace-nowrap text-2xl font-black uppercase leading-none text-[#fff2bd] drop-shadow-[0_0_16px_rgba(248,198,74,0.30)] sm:text-3xl">
            {displayName}
          </h2>
          <div className="mt-1 text-xs font-black uppercase tracking-[0.20em] text-[#f8c64a] sm:text-[13px]">
            {isLegendary ? "Card Lendário Fut7Pro" : "Card Oficial Fut7Pro"}
          </div>
        </div>
      </div>
    </article>
  );
}

function PerformanceSummary({ badges }: { badges: PremiumBadge[] }) {
  const icons: Record<string, typeof FaFutbol> = {
    jogos: FaClock,
    gols: FaFutbol,
    assistencias: FaTshirt,
    titulos: FaTrophy,
    "media-vitorias": FaChartLine,
    pontos: FaMedal,
    "campeao-dia": FaCrown,
    assiduidade: FaCheckCircle,
  };

  return (
    <PremiumPanel className="p-4">
      <h2 className="text-base font-black uppercase tracking-[0.16em] text-[#f8c64a]">
        Desempenho Geral
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {badges.map((badge, indexItem) => {
          const Icon = icons[badge.key] ?? FaMedal;

          return (
            <div
              key={badge.key}
              className="rounded-lg border border-[#f8c64a]/18 bg-black/30 px-2 py-2.5 text-center"
            >
              <Icon className="mx-auto text-base text-[#f8c64a]" />
              <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                {badge.label}
              </div>
              <div className="mt-0.5 text-xl font-black text-[#f8c64a]">{badge.value}</div>
            </div>
          );
        })}
      </div>
    </PremiumPanel>
  );
}

function PeriodSelector({
  value,
  onChange,
}: {
  value?: "current" | "all";
  onChange?: (period: "current" | "all") => void;
}) {
  if (!onChange) return null;
  const selected = value ?? "current";
  const options: Array<{ value: "current" | "all"; label: string }> = [
    { value: "current", label: "Temporada atual" },
    { value: "all", label: "Todas as temporadas" },
  ];

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        Estatísticas
      </span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
            selected === option.value
              ? "border-[#f8c64a] bg-[#f8c64a] text-black"
              : "border-[#f8c64a]/45 bg-black/45 text-[#f8c64a] hover:border-[#f8c64a]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function AchievementsSection({ groups }: { groups?: PremiumAchievementGroups }) {
  const normalized: PremiumAchievementGroups = groups ?? {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
    conquistasIndividuaisFut7Pro: [],
  };
  const sections = [
    { title: "Títulos (Grandes Torneios)", items: normalized.titulosGrandesTorneios, icon: "🏆" },
    { title: "Títulos Anuais", items: normalized.titulosAnuais, icon: "👑" },
    { title: "Títulos Quadrimestrais", items: normalized.titulosQuadrimestrais, icon: "🥈" },
    {
      title: "Conquistas Individuais Fut7Pro",
      items: normalized.conquistasIndividuaisFut7Pro,
      icon: "⭐",
    },
  ];
  const hasAny = sections.some((section) => section.items.length > 0);

  return (
    <PremiumPanel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black uppercase tracking-[0.16em] text-[#f8c64a]">
          Minhas Conquistas
        </h2>
        <FaTrophy className="text-[#f8c64a]" />
      </div>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-black uppercase tracking-[0.10em] text-white">
              {section.title}
            </h3>
            {section.items.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {section.items.map((item, indexItem) => (
                  <span
                    key={`${section.title}-${item.descricao}-${item.ano}-${indexItem}`}
                    className="rounded-full border border-[#f8c64a]/20 bg-[#f8c64a]/10 px-3 py-1.5 text-xs font-bold text-[#ffe08a]"
                  >
                    <span className="mr-1">{section.icon}</span>
                    {item.descricao} <span className="text-zinc-400">{item.ano}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">
                Nenhuma conquista registrada nesta categoria.
              </p>
            )}
          </div>
        ))}
      </div>
      {!hasAny && (
        <p className="mt-4 rounded-lg border border-[#f8c64a]/15 bg-black/30 p-3 text-sm text-zinc-400">
          As conquistas do atleta aparecerão aqui conforme forem registradas no racha.
        </p>
      )}
    </PremiumPanel>
  );
}

function VisualOnlyActions({
  statsUrl,
  isLegendary,
  isGenerating,
  onDownload,
  onShare,
}: {
  statsUrl?: string;
  isLegendary?: boolean;
  isGenerating?: boolean;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
      {statsUrl && (
        <Link
          href={statsUrl}
          className="inline-flex min-h-[54px] flex-1 items-center justify-center gap-3 rounded-lg border border-[#f8c64a]/55 bg-black/35 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#f8c64a] transition hover:bg-[#f8c64a] hover:text-black"
        >
          Ver estatísticas completas
          <FaArrowRight />
        </Link>
      )}
      <button
        type="button"
        onClick={onDownload}
        disabled={isGenerating}
        className="inline-flex min-h-[54px] flex-1 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#b97808] via-[#f8c64a] to-[#fff0a8] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_12px_28px_rgba(248,198,74,0.22)]"
      >
        <FaDownload />
        {isGenerating ? "Gerando..." : isLegendary ? "Baixar card lendário" : "Baixar card oficial"}
      </button>
      <button
        type="button"
        onClick={onShare}
        disabled={isGenerating}
        className="inline-flex min-h-[54px] flex-1 items-center justify-center gap-3 rounded-lg border border-[#f8c64a]/70 bg-black/35 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#f8c64a] transition hover:bg-[#f8c64a] hover:text-black"
      >
        <FaShareAlt />
        {isGenerating ? "Gerando..." : isLegendary ? "Compartilhar lendário" : "Compartilhar card"}
      </button>
    </div>
  );
}

type GeneratedShareCard = {
  blob: Blob;
  file: File;
  fileName: string;
  url: string;
};

type ClipboardWithImages = Clipboard & {
  write?: (items: ClipboardItem[]) => Promise<void>;
};

type ShareNavigator = Navigator & {
  canShare?: (data: ShareData & { files?: File[] }) => boolean;
  share?: (data: ShareData & { files?: File[] }) => Promise<void>;
};

function ShareReadyModal({
  isOpen,
  isLegendary,
  generatedCard,
  profileUrl,
  feedback,
  onClose,
  onDownload,
  onCopyImage,
  onCopyLink,
  onNativeShare,
  onWhatsapp,
}: {
  isOpen: boolean;
  isLegendary: boolean;
  generatedCard: GeneratedShareCard | null;
  profileUrl: string;
  feedback?: string | null;
  onClose: () => void;
  onDownload: () => void;
  onCopyImage: () => void;
  onCopyLink: () => void;
  onNativeShare: () => void;
  onWhatsapp: () => void;
}) {
  if (!isOpen || !generatedCard) return null;

  const nav = typeof navigator !== "undefined" ? (navigator as ShareNavigator) : null;
  const isLikelyMobile =
    typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 767px)").matches);
  const canNativeShare = Boolean(
    isLikelyMobile && nav?.share && (!nav.canShare || nav.canShare({ files: [generatedCard.file] }))
  );
  const canCopyImage =
    typeof window !== "undefined" &&
    "ClipboardItem" in window &&
    Boolean((navigator.clipboard as ClipboardWithImages | undefined)?.write);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-[980px] overflow-hidden rounded-2xl border border-[#f8c64a]/55 bg-[#050505] shadow-[0_0_0_1px_rgba(255,240,168,0.08),0_30px_90px_rgba(0,0,0,0.78),0_0_60px_rgba(248,198,74,0.20)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(248,198,74,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_36%)]" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-zinc-200 transition hover:border-[#f8c64a]/70 hover:text-[#f8c64a]"
          aria-label="Fechar"
        >
          <FaTimes />
        </button>

        <div className="relative z-10 grid gap-6 p-4 sm:p-6 lg:grid-cols-[360px_1fr] lg:p-7">
          <div className="mx-auto w-full max-w-[310px] overflow-hidden rounded-[24px] border border-[#f8c64a]/45 bg-black shadow-[0_20px_48px_rgba(0,0,0,0.55),0_0_28px_rgba(248,198,74,0.16)] lg:max-w-none">
            <img
              src={generatedCard.url}
              alt={
                isLegendary ? "Previa do Card Lendario Fut7Pro" : "Previa do Card Oficial Fut7Pro"
              }
              className="block aspect-[9/16] h-auto w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f8c64a]">
              Compartilhamento Fut7Pro
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
              Seu card está pronto
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-300">
              {isLegendary
                ? "Compartilhe seu Card Lendário da temporada com o racha."
                : "Compartilhe seu Card Oficial Fut7Pro com o racha."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {canNativeShare && (
                <button
                  type="button"
                  onClick={onNativeShare}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#b97808] via-[#f8c64a] to-[#fff0a8] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
                >
                  <FaShareAlt />
                  Compartilhar imagem
                </button>
              )}
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#b97808] via-[#f8c64a] to-[#fff0a8] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
              >
                <FaDownload />
                Baixar imagem
              </button>
              {canCopyImage && (
                <button
                  type="button"
                  onClick={onCopyImage}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-[#f8c64a]/60 bg-black/45 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#f8c64a] transition hover:bg-[#f8c64a] hover:text-black"
                >
                  <FaImage />
                  Copiar imagem
                </button>
              )}
              <button
                type="button"
                onClick={onCopyLink}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-[#f8c64a]/60 bg-black/45 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#f8c64a] transition hover:bg-[#f8c64a] hover:text-black"
              >
                <FaCopy />
                Copiar link
              </button>
              <button
                type="button"
                onClick={onWhatsapp}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg border border-[#25d366]/55 bg-[#25d366]/10 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8cffb7] transition hover:bg-[#25d366] hover:text-black sm:col-span-2"
              >
                <FaWhatsapp />
                Compartilhar no WhatsApp
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#f8c64a]/18 bg-black/42 p-4">
              <p className="text-sm font-semibold text-zinc-300">
                A imagem foi gerada em 9:16, pronta para Stories, Status e grupos.
              </p>
              <p className="mt-2 break-all text-xs text-zinc-500">{profileUrl}</p>
              {feedback && (
                <p className="mt-3 rounded-lg border border-[#f8c64a]/20 bg-[#f8c64a]/10 px-3 py-2 text-sm font-semibold text-[#ffe08a]">
                  {feedback}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function defaultLegendaryProgress(): LegendaryProgress {
  return {
    seasonLabel: "Temporada 2026",
    status: "in_progress",
    progressPercent: 72,
    attendance: {
      current: 30,
      target: 42,
      score: 35.7,
    },
    championOfDay: {
      current: 8,
      target: 13,
      score: 30.8,
    },
    nextGoalMessage:
      "A corrida lendária está em andamento. Ao completar os requisitos da temporada, este atleta desbloqueia o Card Lendário Fut7Pro.",
  };
}

export default function AthletePremiumProfileView({
  mode,
  athlete,
  tenant,
  stats,
  index,
  achievementGroups,
  badges,
  legendaryProgress,
  links,
  ownerActions,
  statsPeriod,
  onStatsPeriodChange,
}: AthletePremiumProfileViewProps) {
  const athleteName = athlete.name;
  const cardName = athlete.nickname || athlete.name;
  const level = Math.max(1, Math.round(stats.jogos / 4));
  const indexDisplay = index.value !== null ? (index.value / 10).toFixed(1) : "--";
  const progress = legendaryProgress || defaultLegendaryProgress();
  const storyRef = useRef<HTMLDivElement | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [cardActionError, setCardActionError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [generatedShareCard, setGeneratedShareCard] = useState<GeneratedShareCard | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const isLegendary = progress.status === "unlocked";

  useEffect(() => {
    return () => {
      if (generatedShareCard?.url) {
        URL.revokeObjectURL(generatedShareCard.url);
      }
    };
  }, [generatedShareCard?.url]);

  const getProfileUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${window.location.pathname}`;
  };

  const buildFileName = () => {
    const variant = isLegendary ? "lendario" : "oficial";
    const season = progress.seasonLabel.replace("Temporada ", "").trim() || "temporada";
    const normalizedName = athleteName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .toLowerCase();
    return `fut7pro-card-${variant}-${normalizedName || "atleta"}-${season}.png`;
  };

  const captureCardBlob = async () => {
    if (!storyRef.current) {
      throw new Error("Card compartilhável indisponível.");
    }
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(storyRef.current, {
      backgroundColor: "#030404",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 1080,
      height: 1920,
      windowWidth: 1080,
      windowHeight: 1920,
    });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.96)
    );
    if (!blob) {
      throw new Error("Não foi possível gerar a imagem do card.");
    }
    return blob;
  };

  const createGeneratedShareCard = async (): Promise<GeneratedShareCard> => {
    const blob = await captureCardBlob();
    const fileName = buildFileName();
    const file = new File([blob], fileName, { type: "image/png" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      file,
      fileName,
      url,
    };
  };

  const openShareExperience = async () => {
    setIsGeneratingCard(true);
    setCardActionError(null);
    setShareFeedback(null);
    try {
      const nextCard = await createGeneratedShareCard();
      if (generatedShareCard?.url) {
        URL.revokeObjectURL(generatedShareCard.url);
      }
      setGeneratedShareCard(nextCard);
      setShareModalOpen(true);
    } catch (error) {
      setCardActionError(error instanceof Error ? error.message : "Falha ao gerar card.");
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const downloadGeneratedCard = () => {
    if (!generatedShareCard) return;
    const link = document.createElement("a");
    link.href = generatedShareCard.url;
    link.download = generatedShareCard.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShareFeedback("Imagem baixada. Agora é só postar ou enviar no grupo.");
  };

  const copyGeneratedImage = async () => {
    if (!generatedShareCard) return;
    try {
      const clipboard = navigator.clipboard as ClipboardWithImages;
      if (!clipboard.write || typeof ClipboardItem === "undefined") {
        throw new Error("Cópia de imagem não suportada neste navegador.");
      }
      await clipboard.write([new ClipboardItem({ "image/png": generatedShareCard.blob })]);
      setShareFeedback("Imagem copiada. Agora é só colar no app ou conversa.");
    } catch (error) {
      setShareFeedback(
        error instanceof Error ? error.message : "Não foi possível copiar a imagem."
      );
    }
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setShareFeedback("Link do perfil copiado.");
    } catch {
      setShareFeedback("Não foi possível copiar o link automaticamente.");
    }
  };

  const nativeShareGeneratedImage = async () => {
    if (!generatedShareCard) return;
    const nav = navigator as ShareNavigator;
    try {
      if (!nav.share || (nav.canShare && !nav.canShare({ files: [generatedShareCard.file] }))) {
        downloadGeneratedCard();
        setShareFeedback(
          "Compartilhamento de imagem não suportado aqui. Baixei o PNG para você postar."
        );
        return;
      }
      await nav.share({
        files: [generatedShareCard.file],
        title: isLegendary ? "Meu Card Lendário Fut7Pro" : "Meu Card Oficial Fut7Pro",
        text: isLegendary
          ? "Confira meu Card Lendário da temporada no Fut7Pro."
          : "Confira meu Card Oficial Fut7Pro.",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareFeedback(
        "Não foi possível abrir o compartilhamento. Você ainda pode baixar a imagem."
      );
    }
  };

  const openWhatsappShare = () => {
    const text = isLegendary
      ? `Olha meu Card Lendário ${progress.seasonLabel.replace("Temporada ", "")} no Fut7Pro`
      : "Olha meu Card Oficial Fut7Pro";
    const profileUrl = getProfileUrl();
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${profileUrl}`)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareFeedback(null);
  };

  return (
    <section className="relative -mt-10 overflow-hidden bg-[#030404] px-4 pb-10 pt-3 text-white md:px-6 lg:pb-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_21%_24%,rgba(248,198,74,0.20),transparent_25%),radial-gradient(circle_at_78%_54%,rgba(248,198,74,0.13),transparent_27%),linear-gradient(125deg,#060706_0%,#0c0b08_48%,#020202_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(125deg,transparent_0_18%,rgba(248,198,74,0.14)_18.2%,transparent_18.8%_47%,rgba(248,198,74,0.08)_47.2%,transparent_48%_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f8c64a]/65 to-transparent" />

      <div className="relative mx-auto max-w-[1280px]">
        <header className="mx-auto mb-3 max-w-3xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#f8c64a]">
            {mode === "owner" ? "Meu perfil neste racha" : "Perfil do Atleta"}
          </p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-none text-white md:text-4xl">
            {athleteName}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-300 md:text-base">
            Status, conquistas e desempenho do atleta dentro do racha.
          </p>
        </header>

        <div className="mx-auto max-w-[880px]">
          <PremiumAthleteMedallion
            athlete={athlete}
            index={index}
            tenant={tenant}
            legendaryProgress={progress}
          />
        </div>

        <PeriodSelector value={statsPeriod} onChange={onStatsPeriodChange} />

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.45fr] lg:items-start">
          <aside className="grid gap-4">
            <LegendaryProgressPanel progress={progress} />
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricWidget
                label="Nível"
                value={level}
                detail={`${stats.jogos} jogos registrados`}
              />
              <MetricWidget
                label="Índice Fut7Pro"
                value={indexDisplay}
                detail={index.status === "provisional" ? "Índice em formação" : "Baseado no racha"}
                variant="index"
              />
            </div>
          </aside>

          <aside className="grid gap-4">
            <PerformanceSummary badges={badges} />
            {ownerActions}
          </aside>
        </div>

        <div className="mt-4">
          <AchievementsSection groups={achievementGroups} />
        </div>

        <div className="mt-6 lg:mt-8">
          <VisualOnlyActions
            statsUrl={links?.statsUrl}
            isLegendary={isLegendary}
            isGenerating={isGeneratingCard}
            onDownload={openShareExperience}
            onShare={openShareExperience}
          />
          {cardActionError && (
            <div className="mt-3 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
              {cardActionError}
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none fixed left-[-12000px] top-0 z-[-1] h-[1920px] w-[1080px] overflow-hidden">
        <ShareablePremiumCardStory
          ref={storyRef}
          athlete={{ ...athlete, nickname: cardName }}
          tenant={tenant}
          stats={stats}
          index={index}
          legendaryProgress={progress}
        />
      </div>

      <ShareReadyModal
        isOpen={shareModalOpen}
        isLegendary={isLegendary}
        generatedCard={generatedShareCard}
        profileUrl={getProfileUrl()}
        feedback={shareFeedback}
        onClose={closeShareModal}
        onDownload={downloadGeneratedCard}
        onCopyImage={copyGeneratedImage}
        onCopyLink={copyProfileLink}
        onNativeShare={nativeShareGeneratedImage}
        onWhatsapp={openWhatsappShare}
      />
    </section>
  );
}
