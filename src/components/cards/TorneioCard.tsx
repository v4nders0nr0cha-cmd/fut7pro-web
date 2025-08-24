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
    <div className="min-h-screen bg-fundo px-4 pb-10 pt-6 text-white">
      <h1 className="mb-6 text-center text-3xl font-bold text-yellow-400">
        Grandes Torneios
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {torneiosMock.map((torneio: Torneio, idx: number) => (
          <TorneioCard key={idx} {...torneio} />
        ))}
      </div>
    </div>
  );
}

function TorneioCard({ nome, slug, ano, campeao, imagem }: Torneio) {
  return (
    <div className="rounded-xl bg-[#1A1A1A] p-4 shadow-md transition-all hover:shadow-yellow-500">
      <Image
        src={imagem}
        alt={`Imagem do torneio ${nome}`}
        width={400}
        height={200}
        className="mb-3 h-40 w-full rounded-md object-cover"
      />
      <h3 className="mb-1 text-lg font-bold text-yellow-400">{nome}</h3>
      <p className="mb-2 text-sm text-gray-300">Ano: {ano}</p>
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
