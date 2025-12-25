"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { usePublicMatch } from "@/hooks/usePublicMatch";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const FALLBACK_LOGO = "/images/times/time_padrao_01.png";

export default function PartidaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = typeof params?.id === "string" ? params.id : "";
  const { publicHref, publicSlug } = usePublicLinks();
  const { match, isLoading, isError, error } = usePublicMatch(matchId, publicSlug);

  const lineups = useMemo(() => {
    if (!match?.presences?.length) return { timeA: [], timeB: [] as { nome: string }[] };
    const timeAPlayers: { nome: string }[] = [];
    const timeBPlayers: { nome: string }[] = [];
    match.presences.forEach((presence) => {
      const nome = presence.athlete?.name || "Jogador";
      const target =
        presence.teamId === match.teamA.id || presence.team?.id === match.teamA.id
          ? timeAPlayers
          : timeBPlayers;
      target.push({ nome });
    });
    return { timeA: timeAPlayers, timeB: timeBPlayers };
  }, [match]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Carregando detalhes da partida...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar partida</h1>
          <p className="text-red-300 text-sm break-all">{String(error)}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <h1 className="text-2xl text-yellow-400 font-bold mb-4">Partida não encontrada</h1>
        <p className="text-textoSuave">Verifique o ID da partida ou volte ao histórico.</p>
        <Link
          href={publicHref("/partidas")}
          className="mt-4 inline-block bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
        >
          Voltar ao histórico
        </Link>
      </div>
    );
  }

  const dataLabel = match.date
    ? format(new Date(match.date), "dd/MM/yyyy 'às' HH:mm")
    : "Data não informada";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">Detalhes da Partida</h1>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-lg border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-neutral-400">Data</p>
            <p className="text-lg font-semibold">{dataLabel}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Local</p>
            <p className="text-lg font-semibold">{match.location || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Status</p>
            <span className="px-3 py-1 rounded-xl text-xs w-fit bg-green-700 text-white">
              Finalizado
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 my-6">
          <div className="flex items-center gap-6 justify-center">
            <div className="flex flex-col items-center gap-1">
              <Image
                src={match.teamA.logoUrl || FALLBACK_LOGO}
                alt={`Logo do time ${match.teamA.name}`}
                width={48}
                height={48}
                className="rounded"
              />
              <span className="font-bold text-lg">{match.teamA.name}</span>
            </div>
            <span className="text-4xl font-extrabold">
              {match.score.teamA}
              <span className="mx-2 text-yellow-400 font-bold">x</span>
              {match.score.teamB}
            </span>
            <div className="flex flex-col items-center gap-1">
              <Image
                src={match.teamB.logoUrl || FALLBACK_LOGO}
                alt={`Logo do time ${match.teamB.name}`}
                width={48}
                height={48}
                className="rounded"
              />
              <span className="font-bold text-lg">{match.teamB.name}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">Time {match.teamA.name}</h2>
            {lineups.timeA.length ? (
              <ul className="text-sm text-neutral-200 space-y-1">
                {lineups.timeA.map((jogador, idx) => (
                  <li key={`a-${idx}`}>{jogador.nome}</li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-400 text-sm">Jogadores não informados.</p>
            )}
          </div>

          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">Time {match.teamB.name}</h2>
            {lineups.timeB.length ? (
              <ul className="text-sm text-neutral-200 space-y-1">
                {lineups.timeB.map((jogador, idx) => (
                  <li key={`b-${idx}`}>{jogador.nome}</li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-400 text-sm">Jogadores não informados.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Link
            href={publicHref("/partidas")}
            className="text-sm text-yellow-400 underline hover:text-yellow-300 transition"
          >
            Voltar ao histórico
          </Link>
          <button
            onClick={() => router.back()}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
