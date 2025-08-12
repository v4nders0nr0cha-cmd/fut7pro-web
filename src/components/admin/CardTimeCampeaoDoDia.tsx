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
      className="relative flex flex-col items-center justify-center bg-[#23272F] rounded-xl shadow-lg px-6 py-7 h-full transition hover:scale-[1.025] hover:ring-2 hover:ring-[#ffd600] cursor-pointer group outline-none"
      tabIndex={0}
      aria-label={`Editar ${nomeTime}`}
    >
      <div className="relative w-28 h-20 mb-3">
        <Image
          src={fotoUrl}
          alt={`Foto do ${nomeTime}`}
          fill
          className="rounded-xl object-cover border-4 border-[#ffd600] shadow-md"
          sizes="112px"
          priority
        />
        <div className="absolute bottom-1 right-1 bg-[#ffd600] p-1 rounded-full">
          <FaCamera className="text-black w-4 h-4" />
        </div>
      </div>
      <span className="text-xl font-bold text-[#ffd600] mb-1">{nomeTime}</span>
      <span className="text-sm text-gray-400 mb-4 text-center">
        Clique para cadastrar foto, gols, passes e resultados do dia.
      </span>
      <span className="mt-2 px-4 py-1 rounded bg-[#ffd600] text-black text-xs font-bold flex items-center gap-2 shadow transition group-hover:bg-yellow-400">
        <FaUserEdit /> Editar Campeão
      </span>
    </Link>
  );
}
