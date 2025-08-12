"use client";

import Link from "next/link";
import { FaRandom, FaUsers, FaTrophy } from "react-icons/fa";
import Image from "next/image";

export default function DestaquesFuncionalidades() {
  return (
    <section className="w-full grid gap-6 grid-cols-1 md:grid-cols-3 mt-2">
      {/* Sorteio Inteligente */}
      <Link
        href="/admin/partidas/sorteio-inteligente"
        className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#ffdf38] cursor-pointer group"
        aria-label="Sorteio Inteligente"
      >
        <FaRandom className="text-[#ffdf38] w-10 h-10 mb-2 group-hover:rotate-12 transition" />
        <span className="text-xl font-bold text-white mb-1">Sorteio Inteligente</span>
        <span className="text-sm text-gray-400 mb-2 text-center">
          Monte os times de forma automática, balanceada e transparente.
        </span>
        <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-[#ffdf38] text-xs font-semibold">
          Acessar Sorteio
        </span>
      </Link>

      {/* Times do Dia */}
      <Link
        href="/partidas/times-do-dia"
        className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#00d3d4] cursor-pointer group"
        aria-label="Times do Dia"
      >
        <FaUsers className="text-[#00d3d4] w-10 h-10 mb-2 group-hover:scale-110 transition" />
        <span className="text-xl font-bold text-white mb-1">Times do Dia</span>
        <span className="text-sm text-gray-400 mb-2 text-center">
          Veja as escalações e confrontos automáticos do racha de hoje.
        </span>
        <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-[#00d3d4] text-xs font-semibold">
          Ver Escalações
        </span>
      </Link>

      {/* Card do Time Campeão do Dia */}
      <Link
        href="/admin/partidas/time-campeao-do-dia"
        className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#ffd600] cursor-pointer group"
        aria-label="Time Campeão do Dia"
      >
        <div className="relative w-28 h-20 mb-2">
          <Image
            src="/images/times/time_campeao_padrao_01.png"
            alt="Foto do Time Campeão do Dia"
            fill
            className="rounded-xl object-cover border-4 border-[#ffd600]"
            sizes="112px"
            priority
          />
        </div>
        <span className="text-xl font-bold text-[#ffd600] mb-1">Time Campeão do Dia</span>
        <span className="text-sm text-gray-400 mb-2 text-center">
          Veja a foto, os jogadores e a conquista do time campeão do racha.
        </span>
        <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-[#ffd600] text-xs font-semibold">
          Ver Campeão
        </span>
      </Link>
    </section>
  );
}
