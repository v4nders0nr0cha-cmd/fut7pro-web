// src/components/admin/CardTimeCampeaoDoDia.tsx
"use client";

import Image from "next/image";
import { FaCamera, FaUserEdit } from "react-icons/fa";
import Link from "next/link";
import { useRacha } from "@/context/RachaContext";
import { usePublicDestaquesDoDia } from "@/hooks/usePublicDestaquesDoDia";
import type { PublicMatch } from "@/types/partida";

type Props = {
  editLink?: string;
  matches?: PublicMatch[];
  confrontos?: unknown[];
  times?: unknown[];
  slug?: string;
  isLoading?: boolean;
};

const DEFAULT_TIME_CAMPEAO_CARD_IMAGE = "/images/Timecampeao.jpg";

function getOfficialDateKey(date?: string | null) {
  if (!date) return null;
  const isoDate = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toISOString().slice(0, 10);
}

function buildChampionDayEditLink(editLink: string, officialDateKey?: string | null) {
  if (!officialDateKey) return editLink;

  const [pathWithQuery, hash = ""] = editLink.split("#");
  const [path, query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);
  params.delete("date");
  params.set("data", officialDateKey);

  const queryString = params.toString();
  return `${path}${queryString ? `?${queryString}` : ""}${hash ? `#${hash}` : ""}`;
}

export default function CardTimeCampeaoDoDia({
  editLink = "/admin/partidas/time-campeao-do-dia",
  slug,
  isLoading,
}: Props) {
  const { tenantSlug } = useRacha();
  const slugFinal = (slug ?? tenantSlug ?? "").trim();
  const {
    destaque,
    isLoading: loadingDestaque,
    isError,
  } = usePublicDestaquesDoDia({
    slug: slugFinal,
    enabled: Boolean(slugFinal),
  });

  const campeao = destaque?.timeCampeaoDoDia ?? null;
  const loading = isLoading || loadingDestaque;
  const foto = DEFAULT_TIME_CAMPEAO_CARD_IMAGE;
  const titulo = "Time Campeão do Dia";
  const labelData =
    destaque?.date != null ? new Date(destaque.date).toLocaleDateString("pt-BR") : undefined;
  const officialDateKey = getOfficialDateKey(destaque?.date);
  const href = campeao ? buildChampionDayEditLink(editLink, officialDateKey) : editLink;

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
      href={href}
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
