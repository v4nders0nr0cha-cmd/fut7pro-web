"use client";

import Link from "next/link";
import { FaBalanceScale } from "react-icons/fa";

export default function TiraTeimaCard() {
  return (
    <Link
      href="/partidas/tira-teima?atleta1=craque-master&atleta2=goleador-king"
      title="Comparar dois atletas no Tira Teima"
      aria-label="Card de acesso ao comparador Tira Teima"
      className="flex flex-col items-center justify-center rounded-2xl bg-[#1A1A1A] p-6 text-center text-white shadow-md transition-all hover:shadow-[0_0_12px_2px_#FFCC00]"
    >
      <FaBalanceScale className="mb-3 text-3xl text-yellow-400" />
      <h3 className="text-lg font-bold text-yellow-400">Tira Teima</h3>
      <p className="mt-1 text-sm text-gray-400">
        Compare estatísticas entre dois jogadores lado a lado.
      </p>
    </Link>
  );
}
