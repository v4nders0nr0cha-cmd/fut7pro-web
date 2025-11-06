"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Head from "next/head";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";

const temporadaAtual = new Date().getFullYear();

export default function PerfilAtletaPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { athlete, isLoading, isError, error } = usePublicAthlete(slug);

  const [filtroStats, setFiltroStats] = useState<"temporada" | "historico">("temporada");

  const stats = useMemo(() => {
    if (!athlete) {
      return null;
    }

    if (filtroStats === "temporada") {
      return athlete.estatisticas.anual[temporadaAtual] ?? athlete.estatisticas.historico;
    }

    return athlete.estatisticas.historico;
  }, [athlete, filtroStats]);

  const conquistas = athlete?.conquistas ?? {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
  };

  const nivelAssiduidade = (jogos: number) => {
    if (jogos >= 100) return "🏆 Lenda";
    if (jogos >= 50) return "🔥 Veterano";
    if (jogos >= 20) return "⭐ Destaque";
    if (jogos >= 10) return "✅ Titular";
    if (jogos >= 3) return "🌱 Juvenil";
    return "🚀 Novato";
  };

  if (!slug) {
    return notFound();
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-fundo text-gray-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
        <p className="mt-4 text-sm">Carregando perfil do atleta...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-fundo text-center px-4">
        <Head>
          <title>Erro ao carregar atleta | Fut7Pro</title>
        </Head>
        <p className="text-red-300 text-lg font-semibold mb-2">
          Não foi possível carregar o atleta.
        </p>
        <p className="text-gray-400 text-sm mb-6">{error ?? "Tente novamente em instantes."}</p>
        <Link
          href="/atletas"
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
        >
          Voltar para a lista de atletas
        </Link>
      </div>
    );
  }

  if (!athlete || !stats) {
    return notFound();
  }

  return (
    <>
      <Head>
        <title>Perfil de {athlete.nome} | Estatísticas, Conquistas e Histórico | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja o perfil completo de ${athlete.nome}: estatísticas, conquistas, assiduidade, histórico de jogos e muito mais no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`fut7, atleta, perfil, ${athlete.nome}, estatísticas, conquistas, histórico, futebol 7, racha`}
        />
      </Head>

      <h1 className="sr-only">
        Perfil do atleta {athlete.nome} - Estatísticas, Conquistas e Histórico | Fut7Pro
      </h1>

      <div>
        <div className="flex flex-col md:flex-row gap-8 mt-8 mb-10 w-full max-w-2xl md:mx-auto">
          <div className="flex-shrink-0">
            <Image
              src={athlete.foto}
              alt={`Foto de ${athlete.nome}`}
              width={160}
              height={160}
              className="rounded-full border-4 border-yellow-400 mx-auto md:mx-0 object-cover"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <h2 className="text-4xl font-bold text-yellow-400 mb-1">{athlete.nome}</h2>
            {athlete.apelido && (
              <p className="text-yellow-300 mb-1 text-lg">
                Apelido: <span className="font-semibold">{athlete.apelido}</span>
              </p>
            )}
            <p className="text-base">
              Posição: <span className="font-semibold">{athlete.posicao}</span>
            </p>
            <p
              className="text-base text-zinc-300"
              title={`Último jogo: ${athlete.ultimaPartida ?? "Data não registrada"}`}
            >
              Status: <span className="font-semibold">{athlete.status}</span>
            </p>
            <p className="text-base mt-1">
              {athlete.mensalista ? (
                <span className="text-green-400 font-bold">💳 MENSALISTA ATIVO</span>
              ) : (
                <span className="text-zinc-400 font-bold">NÃO É MENSALISTA</span>
              )}
            </p>
            <p className="text-base mt-1">
              <span className="font-bold">📈 Nível de Assiduidade:</span>{" "}
              {nivelAssiduidade(athlete.totalJogos)}
            </p>
          </div>
        </div>

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

        <section className="mt-12 w-full max-w-2xl md:mx-auto">
          <ConquistasDoAtleta
            slug={athlete.slug}
            titulosGrandesTorneios={conquistas.titulosGrandesTorneios}
            titulosAnuais={conquistas.titulosAnuais}
            titulosQuadrimestrais={conquistas.titulosQuadrimestrais}
          />
        </section>

        {athlete.historico && athlete.historico.length > 0 && (
          <section className="mt-12 w-full max-w-2xl md:mx-auto">
            <div className="overflow-x-auto w-full">
              <HistoricoJogos historico={athlete.historico} />
            </div>
            <div className="text-center mt-4">
              <Link
                href={`/atletas/${athlete.slug}/historico`}
                className="inline-block text-yellow-400 hover:underline text-sm"
              >
                Ver histórico completo →
              </Link>
            </div>
          </section>
        )}

        <div className="mt-10 text-center md:text-right w-full max-w-2xl md:mx-auto">
          <Link
            href={`/estatisticas/tira-teima?atleta1=${athlete.slug}`}
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded"
          >
            ⚔️ Comparar com outro atleta
          </Link>
        </div>
      </div>
    </>
  );
}
