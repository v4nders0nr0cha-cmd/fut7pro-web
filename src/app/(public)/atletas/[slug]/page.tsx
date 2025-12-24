"use client";

import Head from "next/head";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

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

export default function PerfilAtletaPage() {
  const { slug } = useParams() as { slug: string };
  const { tenantSlug } = useRacha();
  const {
    athlete,
    conquistas,
    isLoading: isLoadingAthlete,
    isError: isErrorAthlete,
  } = usePublicAthlete({
    tenantSlug,
    athleteSlug: slug,
  });

  const {
    rankings,
    isLoading: isLoadingRankings,
    isError: isErrorRankings,
  } = usePublicPlayerRankings({
    slug: tenantSlug,
    type: "geral",
    period: "all",
    limit: 400,
  });

  const atletaRanking = rankings.find((item) => item.slug === slug);

  if (isLoadingAthlete || isLoadingRankings) {
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
  const backToListHref = tenantSlug ? `/${tenantSlug}/atletas` : "/atletas";

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
              </div>
              <p className="mt-2 text-xs text-zinc-400">Slug: {athlete.slug}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-200">
            <div>
              <p className="text-gray-400">Jogos</p>
              <p className="text-lg font-bold">{atletaRanking?.jogos ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Gols</p>
              <p className="text-lg font-bold">{atletaRanking?.gols ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Assistencias</p>
              <p className="text-lg font-bold">{atletaRanking?.assistencias ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Vitorias</p>
              <p className="text-lg font-bold">{atletaRanking?.vitorias ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Derrotas</p>
              <p className="text-lg font-bold">{atletaRanking?.derrotas ?? 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Pontos</p>
              <p className="text-lg font-bold text-yellow-300">{atletaRanking?.pontos ?? 0}</p>
            </div>
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
