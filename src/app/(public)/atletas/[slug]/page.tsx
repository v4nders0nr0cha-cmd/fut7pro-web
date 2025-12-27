"use client";

import Head from "next/head";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { PublicMatch } from "@/types/partida";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const FORTALEZA_TZ = "America/Fortaleza";
const STAT_PERIODS = [
  { value: "current", label: "Temporada atual" },
  { value: "all", label: "Todas as Temporadas" },
];

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ADMIN: "Administrador",
};

const POSITION_LABELS: Record<string, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meia: "Meia",
  atacante: "Atacante",
};

function formatPosition(value?: string | null) {
  if (!value) return "Nao informado";
  const normalized = value.toLowerCase();
  return POSITION_LABELS[normalized] ?? value;
}

function formatDateYMD(date: Date, timeZone: string) {
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

function getCurrentYear() {
  const year = new Intl.DateTimeFormat("en-US", {
    timeZone: FORTALEZA_TZ,
    year: "numeric",
  }).format(new Date());
  const parsed = Number.parseInt(year, 10);
  return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
}

function resolveTeamKey(team: PublicMatch["teamA"] | null | undefined, fallback?: string | null) {
  const key = team?.id ?? fallback ?? team?.name ?? "";
  if (!key) return "";
  return String(key);
}

function getMatchScore(match: PublicMatch) {
  const scoreA = match.score?.teamA ?? match.scoreA;
  const scoreB = match.score?.teamB ?? match.scoreB;
  if (typeof scoreA !== "number" || typeof scoreB !== "number") return null;
  return { scoreA, scoreB };
}

function countChampionDays(matches: PublicMatch[], athleteId?: string | null) {
  if (!athleteId) return 0;
  const matchesByDay = new Map<string, PublicMatch[]>();

  matches.forEach((match) => {
    const key = formatDateYMD(new Date(match.date), FORTALEZA_TZ);
    if (!key) return;
    const list = matchesByDay.get(key);
    if (list) {
      list.push(match);
    } else {
      matchesByDay.set(key, [match]);
    }
  });

  let total = 0;
  matchesByDay.forEach((dayMatches) => {
    const points = new Map<string, number>();

    dayMatches.forEach((match) => {
      const score = getMatchScore(match);
      if (!score) return;
      const teamAKey = resolveTeamKey(match.teamA, match.teamA?.id ?? null);
      const teamBKey = resolveTeamKey(match.teamB, match.teamB?.id ?? null);
      if (!teamAKey || !teamBKey) return;

      if (score.scoreA > score.scoreB) {
        points.set(teamAKey, (points.get(teamAKey) ?? 0) + 3);
        points.set(teamBKey, points.get(teamBKey) ?? 0);
      } else if (score.scoreB > score.scoreA) {
        points.set(teamBKey, (points.get(teamBKey) ?? 0) + 3);
        points.set(teamAKey, points.get(teamAKey) ?? 0);
      } else {
        points.set(teamAKey, (points.get(teamAKey) ?? 0) + 1);
        points.set(teamBKey, (points.get(teamBKey) ?? 0) + 1);
      }
    });

    if (!points.size) return;
    const [championKey] = Array.from(points.entries()).sort((a, b) => b[1] - a[1])[0];
    if (!championKey) return;

    const atletaNoTimeCampeao = dayMatches.some((match) =>
      (match.presences ?? []).some((presence) => {
        if (presence.status === "AUSENTE") return false;
        if (presence.athleteId !== athleteId) return false;
        const teamKey = resolveTeamKey(presence.team, presence.teamId ?? null);
        return teamKey === championKey;
      })
    );

    if (atletaNoTimeCampeao) total += 1;
  });

  return total;
}

function resolveAssiduidadeLevel(jogos: number) {
  if (jogos >= 100) return "Lenda";
  if (jogos >= 50) return "Veterano";
  if (jogos >= 20) return "Destaque";
  if (jogos >= 10) return "Titular";
  if (jogos >= 3) return "Juvenil";
  return "Novato";
}

export default function PerfilAtletaPage() {
  const { slug } = useParams() as { slug: string };
  const { tenantSlug } = useRacha();
  const { publicHref, publicSlug } = usePublicLinks();
  const [statsPeriod, setStatsPeriod] = useState<"current" | "all">("current");
  const currentYear = useMemo(() => getCurrentYear(), []);
  const rangeFrom = statsPeriod === "all" ? "2000-01-01" : `${currentYear.toString()}-01-01`;
  const rangeTo =
    statsPeriod === "all" ? formatDateYMD(new Date(), FORTALEZA_TZ) : `${currentYear}-12-31`;
  const {
    athlete,
    conquistas,
    isLoading: isLoadingAthlete,
    isError: isErrorAthlete,
  } = usePublicAthlete({
    tenantSlug: publicSlug || tenantSlug,
    athleteSlug: slug,
  });

  const {
    rankings,
    isLoading: isLoadingRankings,
    isError: isErrorRankings,
  } = usePublicPlayerRankings({
    slug: publicSlug || tenantSlug,
    type: "geral",
    period: statsPeriod === "all" ? "all" : "year",
    year: statsPeriod === "all" ? undefined : currentYear,
  });

  const {
    matches,
    isLoading: isLoadingMatches,
    isError: isErrorMatches,
  } = usePublicMatches({
    slug: publicSlug || tenantSlug,
    from: rangeFrom,
    to: rangeTo,
    enabled: Boolean(publicSlug || tenantSlug),
  });

  const atletaRanking = rankings.find(
    (item) => item.slug === slug || item.id === slug || item.id === athlete?.id
  );
  const athleteId = athlete?.id || atletaRanking?.id;
  const campeaoDia = useMemo(() => countChampionDays(matches, athleteId), [matches, athleteId]);

  if (isLoadingAthlete && !athlete) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 py-12 text-gray-300">Carregando atleta...</div>
    );
  }

  if (isErrorAthlete || !athlete) {
    notFound();
  }

  const displayName = athlete.firstName || atletaRanking?.nome || "Atleta";
  const displayNickname = athlete.nickname;
  const displayAvatar = athlete.avatarUrl || atletaRanking?.foto || DEFAULT_AVATAR;
  const adminLabel = athlete.adminRole
    ? (ROLE_LABELS[athlete.adminRole] ?? athlete.adminRole)
    : null;
  const adminBadgeLabel = adminLabel ?? null;
  const backToListHref = publicHref("/atletas");
  const jogos = atletaRanking?.jogos ?? 0;
  const vitorias = atletaRanking?.vitorias ?? 0;
  const mediaVitorias = jogos > 0 ? (vitorias / jogos).toFixed(2) : "0.00";
  const nivelAssiduidade = resolveAssiduidadeLevel(jogos);
  const campeaoDiaLabel = isLoadingMatches || isErrorMatches ? "-" : campeaoDia;

  return (
    <>
      <Head>
        <title>{displayName} | Fut7Pro</title>
        <meta
          name="description"
          content={`Perfil publico do atleta ${displayName} com estatisticas do racha.`}
        />
      </Head>
      <main className="max-w-5xl mx-auto px-3 py-10">
        <Link href={backToListHref} className="text-yellow-400 underline text-sm">
          Voltar para lista de atletas
        </Link>

        <div className="mt-4 bg-neutral-900 rounded-2xl p-6 border border-neutral-800 shadow">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img
              src={displayAvatar}
              alt={`Foto de ${displayName}`}
              width={96}
              height={96}
              className="rounded-full border border-neutral-700 object-cover"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-yellow-400">{displayName}</h1>
              {displayNickname && (
                <p className="text-yellow-200 font-semibold mt-1">Apelido: {displayNickname}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {adminBadgeLabel && (
                  <span className="inline-flex items-center rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                    {adminBadgeLabel}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full border border-yellow-400 px-3 py-1 text-xs text-yellow-300">
                  Posicao: {formatPosition(athlete.position)}
                </span>
                <span className="inline-flex items-center rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200">
                  Status: {athlete.status || "Nao informado"}
                </span>
                <span className="inline-flex items-center rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200">
                  Mensalista: {athlete.mensalista ? "Ativo" : "Nao"}
                </span>
                <span className="inline-flex items-center rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200">
                  Nivel de Assiduidade: {nivelAssiduidade}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-300">
            <span className="text-gray-400">Estatisticas:</span>
            {STAT_PERIODS.map((period) => (
              <button
                key={period.value}
                type="button"
                className={`px-3 py-1 rounded-full border transition ${
                  statsPeriod === period.value
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-neutral-900 text-yellow-300 border-yellow-400"
                }`}
                onClick={() => setStatsPeriod(period.value as "current" | "all")}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-200">
            {[
              { label: "Jogos", value: jogos },
              { label: "Gols", value: atletaRanking?.gols ?? 0 },
              { label: "Assistencias", value: atletaRanking?.assistencias ?? 0 },
              { label: "Campeao do Dia", value: campeaoDiaLabel },
              { label: "Media Vitorias", value: mediaVitorias },
              { label: "Pontuacao", value: atletaRanking?.pontos ?? 0 },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-gray-400">{item.label}</p>
                <p
                  className={`text-lg font-bold ${
                    item.label === "Pontuacao" ? "text-yellow-300" : ""
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <ConquistasDoAtleta
            slug={athlete.slug}
            titulosGrandesTorneios={conquistas.titulosGrandesTorneios}
            titulosAnuais={conquistas.titulosAnuais}
            titulosQuadrimestrais={conquistas.titulosQuadrimestrais}
          />
        </div>

        {isErrorRankings && (
          <div className="mt-6 text-sm text-red-300">Falha ao carregar estatisticas do atleta.</div>
        )}
      </main>
    </>
  );
}
