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
  const atleta = atletasMock.find((a) => a.slug === slug);
  if (!atleta) return notFound();

  // Agora só existem os filtros "temporada" e "historico"
  const [filtroStats, setFiltroStats] = useState<"temporada" | "historico">(
    "temporada",
  );
  const stats =
    filtroStats === "temporada"
      ? (atleta.estatisticas.anual?.[temporadaAtual] ??
        atleta.estatisticas.historico)
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
        <title>
          Perfil de {atleta.nome} | Estatísticas, Conquistas e Histórico |
          Fut7Pro
        </title>
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
        Perfil do atleta {atleta.nome} – Estatísticas, Conquistas e Histórico |
        Fut7Pro
      </h1>

      {/* Wrapper externo SEM max-w/mx-auto */}
      <div>
        {/* Bloco centralizador */}
        <div className="mb-10 mt-8 flex w-full max-w-2xl flex-col gap-8 md:mx-auto md:flex-row">
          <div className="flex-shrink-0">
            <Image
              src={atleta.foto}
              alt={`Foto de ${atleta.nome}`}
              width={160}
              height={160}
              className="mx-auto rounded-full border-4 border-yellow-400 md:mx-0"
            />
          </div>
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <h2 className="mb-1 text-4xl font-bold text-yellow-400">
              {atleta.nome}
            </h2>
            {atleta.apelido && (
              <p className="mb-1 text-lg text-yellow-300">
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
            <p className="mt-1 text-base">
              {atleta.mensalista ? (
                <span className="font-bold text-green-400">
                  💰 MENSALISTA ATIVO
                </span>
              ) : (
                <span className="font-bold text-zinc-400">
                  NÃO É MENSALISTA
                </span>
              )}
            </p>
            <p className="mt-1 text-base">
              <span className="font-bold">🔁 Nível de Assiduidade:</span>{" "}
              {nivelAssiduidade(atleta.totalJogos)}
            </p>
          </div>
        </div>

        {/* Filtro de estatísticas */}
        <div className="mb-2 flex w-full max-w-2xl flex-col items-center justify-center gap-2 md:mx-auto md:flex-row md:justify-start md:gap-4">
          <span className="mb-1 text-lg font-semibold text-yellow-400 md:mb-0">
            Estatísticas:
          </span>
          <div className="flex flex-row gap-2">
            <button
              className={`rounded border px-3 py-1 font-semibold transition ${
                filtroStats === "temporada"
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-yellow-400 bg-zinc-900 text-yellow-300"
              }`}
              onClick={() => setFiltroStats("temporada")}
            >
              Temporada atual
            </button>
            <button
              className={`rounded border px-3 py-1 font-semibold transition ${
                filtroStats === "historico"
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-yellow-400 bg-zinc-900 text-yellow-300"
              }`}
              onClick={() => setFiltroStats("historico")}
            >
              Todas as Temporadas
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <section className="w-full max-w-2xl md:mx-auto">
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[
              { label: "Jogos", valor: stats.jogos ?? "-" },
              { label: "Gols", valor: stats.gols ?? "-" },
              { label: "Assistências", valor: stats.assistencias ?? "-" },
              { label: "Campeão do Dia", valor: stats.campeaoDia ?? "-" },
              {
                label: "Média Vitórias",
                valor:
                  typeof stats.mediaVitorias === "number"
                    ? stats.mediaVitorias.toFixed(2)
                    : "-",
              },
              { label: "Pontuação", valor: stats.pontuacao ?? "-" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded bg-zinc-800 p-4 text-center shadow-md"
              >
                <p className="text-xl font-bold text-yellow-400">
                  {item.valor}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{item.label}</p>
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
            <div className="w-full overflow-x-auto">
              <HistoricoJogos historico={atleta.historico} />
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/atletas/${atleta.slug}/historico`}
                className="inline-block text-sm text-yellow-400 hover:underline"
              >
                Ver histórico completo →
              </Link>
            </div>
          </section>
        )}

        {/* Comparador */}
        <div className="mt-10 w-full max-w-2xl text-center md:mx-auto md:text-right">
          <Link
            href={`/estatisticas/tira-teima?atleta1=${atleta.slug}`}
            className="inline-block rounded bg-yellow-500 px-4 py-2 font-bold text-black hover:bg-yellow-400"
          >
            ⚔️ Comparar com outro atleta
          </Link>
        </div>
      </div>
    </>
  );
}
