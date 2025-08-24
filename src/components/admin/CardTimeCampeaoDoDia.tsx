// src/components/admin/CardTimeCampeaoDoDia.tsx
"use client";

import Image from "next/image";
import { FaCamera, FaUserEdit } from "react-icons/fa";
import Link from "next/link";

type Props = {
  fotoUrl?: string;
  nomeTime?: string;
  editLink?: string;
};

export default function CardTimeCampeaoDoDia({
  fotoUrl = "/images/times/time_campeao_padrao_01.png",
  nomeTime = "Time Campeão do Dia",
  editLink = "/admin/partidas/time-campeao-do-dia",
}: Props) {
  return (
    <Link
      href={editLink}
      className="group relative flex h-full cursor-pointer flex-col items-center justify-center rounded-xl bg-[#23272F] px-6 py-7 shadow-lg outline-none transition hover:scale-[1.025] hover:ring-2 hover:ring-[#ffd600]"
      tabIndex={0}
      aria-label={`Editar ${nomeTime}`}
    >
      <div className="relative mb-3 h-20 w-28">
        <Image
          src={fotoUrl}
          alt={`Foto do ${nomeTime}`}
          fill
          className="rounded-xl border-4 border-[#ffd600] object-cover shadow-md"
          sizes="112px"
          priority
        />
        <div className="absolute bottom-1 right-1 rounded-full bg-[#ffd600] p-1">
          <FaCamera className="h-4 w-4 text-black" />
        </div>
      </div>
      <span className="mb-1 text-xl font-bold text-[#ffd600]">{nomeTime}</span>
      <span className="mb-4 text-center text-sm text-gray-400">
        Clique para cadastrar foto, gols, passes e resultados do dia.
      </span>
      <span className="mt-2 flex items-center gap-2 rounded bg-[#ffd600] px-4 py-1 text-xs font-bold text-black shadow transition group-hover:bg-yellow-400">
        <FaUserEdit /> Editar Campeão
      </span>
    </Link>
  );
}
