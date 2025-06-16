"use client";

import Link from "next/link";
import { FaBalanceScale } from "react-icons/fa";

export default function TiraTeimaCard() {
  return (
    <Link
      href="/partidas/tira-teima?atleta1=craque-master&atleta2=goleador-king"
      title="Comparar dois atletas no Tira Teima"
      aria-label="Card de acesso ao comparador Tira Teima"
      className="bg-[#1A1A1A] rounded-2xl p-6 shadow-md hover:shadow-[0_0_12px_2px_#FFCC00] transition-all text-white flex flex-col items-center justify-center text-center"
    >
      <FaBalanceScale className="text-3xl text-yellow-400 mb-3" />
      <h3 className="text-lg font-bold text-yellow-400">Tira Teima</h3>
      <p className="text-sm text-gray-400 mt-1">
        Compare estatísticas entre dois jogadores lado a lado.
      </p>
    </Link>
  );
}
