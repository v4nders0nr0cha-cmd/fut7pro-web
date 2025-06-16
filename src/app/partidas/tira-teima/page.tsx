"use client";

import { useSearchParams } from "next/navigation";
import { atletasMock } from "@/components/lists/mockAtletas";
import Image from "next/image";
import Link from "next/link";

export default function TiraTeimaPage() {
  const searchParams = useSearchParams();
  const slug1 = searchParams?.get("atleta1") ?? "";
  const slug2 = searchParams?.get("atleta2") ?? "";

  const atleta1 = atletasMock.find((a) => a.slug === slug1);
  const atleta2 = atletasMock.find((a) => a.slug === slug2);

  if (!atleta1 || !atleta2) {
    return (
      <div className="p-6 text-center text-white">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Tira Teima</h1>
        <p className="text-red-400">Atleta(s) não encontrado(s). Verifique os slugs na URL.</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">⚔️ Tira Teima</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AtletaComparado atleta={atleta1} lado="esquerdo" />
        <AtletaComparado atleta={atleta2} lado="direito" />
      </div>

      <div className="text-center mt-8">
        <Link
          href="/atletas"
          className="text-blue-500 hover:underline"
          title="Buscar outros atletas para comparar"
        >
          🔄 Comparar outros atletas
        </Link>
      </div>
    </div>
  );
}

function AtletaComparado({
  atleta,
  lado,
}: {
  atleta: (typeof atletasMock)[0];
  lado: "esquerdo" | "direito";
}) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 shadow-md text-center">
      <Image
        src={atleta.foto}
        alt={`Foto do atleta ${atleta.nome}`}
        width={100}
        height={100}
        className="mx-auto mb-2 rounded-full object-cover"
      />
      <h2 className="text-xl font-bold text-yellow-400">{atleta.nome}</h2>
      <p className="text-gray-400 mb-2">
        {atleta.posicao} | {atleta.status}
      </p>
      {atleta.mensalista && <p className="text-green-400 mb-2">💰 MENSALISTA ATIVO</p>}

      <div className="grid grid-cols-2 gap-3 text-sm mt-4">
        <Card label="Jogos" valor={atleta.estatisticas.jogos} />
        <Card label="Gols" valor={atleta.estatisticas.gols} />
        <Card label="Assistências" valor={atleta.estatisticas.assistencias} />
        <Card label="Pontuação" valor={atleta.estatisticas.pontuacao} />
        <Card label="Campeão do Dia" valor={atleta.estatisticas.campeaoDia} />
        <Card label="Média Vitórias" valor={atleta.estatisticas.mediaVitorias.toFixed(2)} />
      </div>

      <Link
        href={`/atletas/${atleta.slug}`}
        className="inline-block mt-4 text-blue-400 hover:underline"
        title={`Ver perfil completo de ${atleta.nome}`}
      >
        🔍 Ver perfil completo
      </Link>
    </div>
  );
}

function Card({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="bg-zinc-800 p-3 rounded text-center">
      <h3 className="text-xs text-gray-400">{label}</h3>
      <p className="text-lg font-bold text-white">{valor}</p>
    </div>
  );
}
