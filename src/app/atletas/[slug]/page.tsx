"use client";

import { useParams } from "next/navigation";
import { atletasMock } from "@/components/lists/mockAtletas";
import ConquistasDoAtleta from "@/components/lists/ConquistasDoAtleta";
import Image from "next/image";
import Link from "next/link";

export default function PerfilAtletaPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const atleta = atletasMock.find((a) => a.slug === slug);

  if (!atleta)
    return <p className="text-red-500 p-4 text-center font-semibold">Atleta não encontrado.</p>;

  return (
    <div className="p-6">
      {/* Header do Atleta */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Image
          src={atleta.foto}
          alt={`Foto do atleta ${atleta.nome}`}
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-yellow-400">{atleta.nome}</h1>
          <p className="text-gray-300">
            {atleta.posicao} | {atleta.status}
          </p>
          {atleta.mensalista && <p className="text-green-400">💰 MENSALISTA ATIVO</p>}
        </div>
      </div>

      {/* Estatísticas Individuais */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card titulo="Jogos" valor={atleta.estatisticas.jogos} />
        <Card titulo="Gols" valor={atleta.estatisticas.gols} />
        <Card titulo="Assistências" valor={atleta.estatisticas.assistencias} />
        <Card titulo="Campeão do Dia" valor={atleta.estatisticas.campeaoDia} />
        <Card titulo="Média Vitórias" valor={atleta.estatisticas.mediaVitorias.toFixed(2)} />
        <Card titulo="Pontuação Total" valor={atleta.estatisticas.pontuacao} />
      </div>

      {/* Botão Comparador */}
      <Link
        href={`/tira-teima?atleta1=${atleta.slug}`}
        className="inline-block px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white mb-6"
        title={`Comparar ${atleta.nome} com outro atleta`}
      >
        ⚔️ Compare com outro atleta
      </Link>

      {/* Conquistas */}
      <ConquistasDoAtleta slug={atleta.slug} />
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <div className="bg-zinc-800 p-4 rounded shadow text-center">
      <h2 className="text-sm text-gray-400">{titulo}</h2>
      <p className="text-xl font-bold text-white">{valor}</p>
    </div>
  );
}
