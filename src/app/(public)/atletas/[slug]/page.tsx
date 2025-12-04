"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { atletasMock } from "@/components/lists/mockAtletas";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import Head from "next/head";

const temporadaAtual = 2025;

export default function PerfilAtletaPage() {
  const { slug } = useParams() as { slug: string };
  // Agora só existem os filtros "temporada" e "historico"
  const [filtroStats, setFiltroStats] = useState<"temporada" | "historico">("temporada");
  const atleta = atletasMock.find((a) => a.slug === slug);
  if (!atleta) return notFound();

  const stats =
    filtroStats === "temporada"
      ? (atleta.estatisticas.anual?.[temporadaAtual] ?? atleta.estatisticas.historico)
      : atleta.estatisticas.historico;

  // Níveis de assiduidade padronizados Fut7Pro
  const nivelAssiduidade = (jogos: number) => {
    if (jogos >= 100) return "🐐 Lenda";
    if (jogos >= 50) return "🦾 Veterano";
    if (jogos >= 20) return "✨ Destaque";
    if (jogos >= 10) return "🧢 Titular";
    if (jogos >= 3) return "🔄 Juvenil";
    return "🎓 Novato";
  };

  const {
    titulosGrandesTorneios = [],
    titulosAnuais = [],
    titulosQuadrimestrais = [],
  } = atleta.conquistas ?? {};

  return (
    <>
      <Head>
        <title>Perfil de {atleta.nome} | Estatísticas, Conquistas e Histórico | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja o perfil completo de ${atleta.nome}: estatísticas, conquistas, assiduidade, histórico de jogos e muito mais no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`fut7, atleta, perfil, ${atleta.nome}, estatísticas, conquistas, histórico, futebol 7, racha`}
        />
      </Head>

      <h1 className="sr-only">
        Perfil do atleta {atleta.nome} – Estatísticas, Conquistas e Histórico | Fut7Pro
      </h1>

      {/* Wrapper externo SEM max-w/mx-auto */}
      <div>
        {/* Bloco centralizador */}
        <div className="flex flex-col md:flex-row gap-8 mt-8 mb-10 w-full max-w-2xl md:mx-auto">
          <div className="flex-shrink-0">
            <Image
              src={atleta.foto}
              alt={`Foto de ${atleta.nome}`}
              width={160}
              height={160}
              className="rounded-full border-4 border-yellow-400 mx-auto md:mx-0"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <h2 className="text-4xl font-bold text-yellow-400 mb-1">{atleta.nome}</h2>
            {atleta.apelido && (
              <p className="text-yellow-300 mb-1 text-lg">
                Apelido: <span className="font-semibold">{atleta.apelido}</span>
              </p>
            )}
            <p className="text-base">
              Posição: <span className="font-semibold">{atleta.posicao}</span>
            </p>
            <p
              className="text-base text-zinc-300"
              title={`Último jogo: ${atleta.ultimaPartida ?? "Data não registrada"}`}
            >
              Status: <span className="font-semibold">{atleta.status}</span>
            </p>
            <p className="text-base mt-1">
              {atleta.mensalista ? (
                <span className="text-green-400 font-bold">💰 MENSALISTA ATIVO</span>
              ) : (
                <span className="text-zinc-400 font-bold">NÃO É MENSALISTA</span>
              )}
            </p>
            <p className="text-base mt-1">
              <span className="font-bold">🔁 Nível de Assiduidade:</span>{" "}
              {nivelAssiduidade(atleta.totalJogos)}
            </p>
          </div>
        </div>

        {/* Filtro de estatísticas */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 items-center justify-center md:justify-start w-full max-w-2xl md:mx-auto">
          <span className="font-semibold text-yellow-400 text-lg mb-1 md:mb-0">Estatísticas:</span>
          <div className="flex flex-row gap-2">
            <button
              className={`px-3 py-1 rounded font-semibold border transition ${
                filtroStats === "temporada"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-zinc-900 text-yellow-300 border-yellow-400"
              }`}
              onClick={() => setFiltroStats("temporada")}
            >
              Temporada atual
            </button>
            <button
              className={`px-3 py-1 rounded font-semibold border transition ${
                filtroStats === "historico"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-zinc-900 text-yellow-300 border-yellow-400"
              }`}
              onClick={() => setFiltroStats("historico")}
            >
              Todas as Temporadas
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <section className="w-full max-w-2xl md:mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
            {[
              { label: "Jogos", valor: stats.jogos ?? "-" },
              { label: "Gols", valor: stats.gols ?? "-" },
              { label: "Assistências", valor: stats.assistencias ?? "-" },
              { label: "Campeão do Dia", valor: stats.campeaoDia ?? "-" },
              {
                label: "Média Vitórias",
                valor:
                  typeof stats.mediaVitorias === "number" ? stats.mediaVitorias.toFixed(2) : "-",
              },
              { label: "Pontuação", valor: stats.pontuacao ?? "-" },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-800 p-4 rounded text-center shadow-md">
                <p className="text-xl font-bold text-yellow-400">{item.valor}</p>
                <p className="text-sm text-zinc-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conquistas */}
        <section className="mt-12 w-full max-w-2xl md:mx-auto">
          <ConquistasDoAtleta
            slug={atleta.slug}
            titulosGrandesTorneios={titulosGrandesTorneios}
            titulosAnuais={titulosAnuais}
            titulosQuadrimestrais={titulosQuadrimestrais}
          />
        </section>

        {/* Histórico */}
        {atleta.historico && atleta.historico.length > 0 && (
          <section className="mt-12 w-full max-w-2xl md:mx-auto">
            <div className="overflow-x-auto w-full">
              <HistoricoJogos historico={atleta.historico} />
            </div>
            <div className="text-center mt-4">
              <Link
                href={`/atletas/${atleta.slug}/historico`}
                className="inline-block text-yellow-400 hover:underline text-sm"
              >
                Ver histórico completo →
              </Link>
            </div>
          </section>
        )}

        {/* Comparador */}
        <div className="mt-10 text-center md:text-right w-full max-w-2xl md:mx-auto">
          <Link
            href={`/estatisticas/tira-teima?atleta1=${atleta.slug}`}
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
          >
            ⚔️ Comparar com outro atleta
          </Link>
        </div>
      </div>
    </>
  );
}
