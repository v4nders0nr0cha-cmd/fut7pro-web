"use client";

import Image from "next/image";
import Link from "next/link";
import { torneiosMock } from "@/components/lists/mockTorneios";

interface Torneio {
  nome: string;
  slug: string;
  ano: number;
  campeao: string;
  imagem: string;
}

export default function GrandesTorneiosPage() {
  return (
    <div className="min-h-screen bg-fundo text-white px-4 pt-6 pb-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Grandes Torneios</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {torneiosMock.map((torneio: Torneio, idx: number) => (
          <TorneioCard key={idx} {...torneio} />
        ))}
      </div>
    </div>
  );
}

function TorneioCard({ nome, slug, ano, campeao, imagem }: Torneio) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 shadow-md hover:shadow-yellow-500 transition-all">
      <Image
        src={imagem}
        alt={`Imagem do torneio ${nome}`}
        width={400}
        height={200}
        className="rounded-md object-cover mb-3 w-full h-40"
      />
      <h3 className="text-lg font-bold text-yellow-400 mb-1">{nome}</h3>
      <p className="text-sm text-gray-300 mb-2">Ano: {ano}</p>
      <p className="text-sm text-white">
        Campeão:{" "}
        <Link
          href={`/atletas/${slug}`}
          className="text-blue-400 hover:underline"
          title={`Ver perfil de ${campeao}`}
        >
          {campeao}
        </Link>
      </p>
    </div>
  );
}
