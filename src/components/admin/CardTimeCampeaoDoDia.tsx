// src/components/admin/CardTimeCampeaoDoDia.tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { FaCamera, FaUserEdit } from "react-icons/fa";
import Link from "next/link";
import { useRacha } from "@/context/RachaContext";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import {
  buildDestaquesDoDia,
  getTimeCampeao,
  type ConfrontoV2,
  type TimeDestaque,
} from "@/utils/destaquesDoDia";
import type { PublicMatch } from "@/types/partida";

type Props = {
  fotoUrl?: string;
  nomeTime?: string;
  editLink?: string;
  matches?: PublicMatch[];
  confrontos?: ConfrontoV2[];
  times?: TimeDestaque[];
  slug?: string;
  isLoading?: boolean;
};

export default function CardTimeCampeaoDoDia({
  fotoUrl = "/images/times/time_padrao_01.png",
  nomeTime = "Time Campeão do Dia",
  editLink = "/admin/partidas/time-campeao-do-dia",
  matches,
  confrontos,
  times,
  slug,
  isLoading,
}: Props) {
  const { tenantSlug } = useRacha();
  const slugFinal = (slug ?? tenantSlug ?? "").trim();

  const shouldFetchMatches =
    Boolean(slugFinal) && !matches && (!confrontos || confrontos.length === 0);
  const {
    matches: fetchedMatches,
    isLoading: loadingMatches,
    isError,
  } = usePublicMatches({
    slug: slugFinal,
    scope: "recent",
    limit: 4,
    enabled: shouldFetchMatches,
  });

  const {
    confrontos: computedConfrontos,
    times: computedTimes,
    dataReferencia,
  } = useMemo(
    () =>
      (matches ?? fetchedMatches)?.length
        ? buildDestaquesDoDia(matches ?? fetchedMatches)
        : {
            confrontos: confrontos ?? [],
            times: times ?? [],
            dataReferencia: null as string | null,
          },
    [matches, fetchedMatches, confrontos, times]
  );

  const campeao = useMemo(
    () => getTimeCampeao(computedConfrontos, computedTimes),
    [computedConfrontos, computedTimes]
  );

  const loading = isLoading || (shouldFetchMatches && loadingMatches);
  const foto = campeao?.time?.logoUrl || fotoUrl || "/images/torneios/torneio-matador.jpg";
  const titulo = campeao?.time?.nome || nomeTime || "Time Campeão do Dia";
  const labelData =
    dataReferencia != null ? new Date(dataReferencia).toLocaleDateString("pt-BR") : undefined;

  if (loading) {
    return (
      <div className="relative flex flex-col items-center justify-center bg-[#23272F] rounded-xl shadow-lg px-6 py-7 h-full animate-pulse min-h-[240px]">
        <div className="w-24 h-16 mb-4 bg-zinc-700 rounded-xl" />
        <div className="h-5 w-40 bg-zinc-700 rounded mb-2" />
        <div className="h-4 w-56 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <Link
      href={editLink}
      className="relative flex flex-col items-center justify-center bg-[#23272F] rounded-xl shadow-lg px-6 py-7 h-full transition hover:scale-[1.025] hover:ring-2 hover:ring-[#ffd600] cursor-pointer group outline-none"
      tabIndex={0}
      aria-label={`Editar ${titulo}`}
      data-testid="admin-dashboard-card-time-campeao"
    >
      <div className="relative w-28 h-20 mb-3">
        <Image
          src={foto}
          alt={`Foto do ${titulo}`}
          fill
          className="rounded-xl object-cover border-4 border-[#ffd600] shadow-md"
          sizes="112px"
          priority
        />
        <div className="absolute bottom-1 right-1 bg-[#ffd600] p-1 rounded-full">
          <FaCamera className="text-black w-4 h-4" />
        </div>
      </div>
      <span className="text-xl font-bold text-[#ffd600] mb-1 text-center">{titulo}</span>
      <span className="text-sm text-gray-400 mb-4 text-center">
        {campeao
          ? `Campeão definido em ${labelData ?? "data mais recente"}.`
          : !slugFinal
            ? "Selecione um racha no Hub para carregar os dados do dia."
            : isError
              ? "Erro ao carregar resultados. Clique para ajustar."
              : "Cadastre foto, gols, passes e resultados do dia."}
      </span>
      <span className="mt-2 px-4 py-1 rounded bg-[#ffd600] text-black text-xs font-bold flex items-center gap-2 shadow transition group-hover:bg-yellow-400">
        <FaUserEdit /> {campeao ? "Editar Campeão" : "Cadastrar Campeão"}
      </span>
    </Link>
  );
}
