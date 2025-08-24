"use client";

import Link from "next/link";
import { FaRandom, FaUsers, FaTrophy } from "react-icons/fa";
import Image from "next/image";

export default function DestaquesFuncionalidades() {
  return (
    <section className="mt-2 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
      {/* Sorteio Inteligente */}
      <Link
        href="/admin/partidas/sorteio-inteligente"
        className="group flex cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow ring-[#ffdf38] transition hover:scale-[1.025] hover:shadow-lg focus:ring-2"
        aria-label="Sorteio Inteligente"
      >
        <FaRandom className="mb-2 h-10 w-10 text-[#ffdf38] transition group-hover:rotate-12" />
        <span className="mb-1 text-xl font-bold text-white">
          Sorteio Inteligente
        </span>
        <span className="mb-2 text-center text-sm text-gray-400">
          Monte os times de forma automática, balanceada e transparente.
        </span>
        <span className="mt-auto rounded bg-[#1a1e22] px-4 py-1 text-xs font-semibold text-[#ffdf38]">
          Acessar Sorteio
        </span>
      </Link>

      {/* Times do Dia */}
      <Link
        href="/partidas/times-do-dia"
        className="group flex cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow ring-[#00d3d4] transition hover:scale-[1.025] hover:shadow-lg focus:ring-2"
        aria-label="Times do Dia"
      >
        <FaUsers className="mb-2 h-10 w-10 text-[#00d3d4] transition group-hover:scale-110" />
        <span className="mb-1 text-xl font-bold text-white">Times do Dia</span>
        <span className="mb-2 text-center text-sm text-gray-400">
          Veja as escalações e confrontos automáticos do racha de hoje.
        </span>
        <span className="mt-auto rounded bg-[#1a1e22] px-4 py-1 text-xs font-semibold text-[#00d3d4]">
          Ver Escalações
        </span>
      </Link>

      {/* Card do Time Campeão do Dia */}
      <Link
        href="/admin/partidas/time-campeao-do-dia"
        className="group flex cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow ring-[#ffd600] transition hover:scale-[1.025] hover:shadow-lg focus:ring-2"
        aria-label="Time Campeão do Dia"
      >
        <div className="relative mb-2 h-20 w-28">
          <Image
            src="/images/times/time_campeao_padrao_01.png"
            alt="Foto do Time Campeão do Dia"
            fill
            className="rounded-xl border-4 border-[#ffd600] object-cover"
            sizes="112px"
            priority
          />
        </div>
        <span className="mb-1 text-xl font-bold text-[#ffd600]">
          Time Campeão do Dia
        </span>
        <span className="mb-2 text-center text-sm text-gray-400">
          Veja a foto, os jogadores e a conquista do time campeão do racha.
        </span>
        <span className="mt-auto rounded bg-[#1a1e22] px-4 py-1 text-xs font-semibold text-[#ffd600]">
          Ver Campeão
        </span>
      </Link>
    </section>
  );
}
