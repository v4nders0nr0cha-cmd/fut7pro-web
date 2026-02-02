"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { useRacha } from "@/context/RachaContext";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ListaAtletasSlugPage() {
  const { slug } = useParams() as { slug: string };
  const [busca, setBusca] = useState("");
  const { setTenantSlug } = useRacha();
  const { publicHref } = usePublicLinks();

  useEffect(() => {
    if (slug) setTenantSlug(slug);
  }, [slug, setTenantSlug]);

  const { rankings, isLoading, isError } = usePublicPlayerRankings({
    slug,
    type: "geral",
    period: "all",
    limit: 200,
  });

  const atletasFiltrados = useMemo(() => {
    const ordered = [...rankings].sort((a, b) => a.nome.localeCompare(b.nome));
    return ordered.filter((atleta) => atleta.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [rankings, busca]);

  return (
    <>
      <Head>
        <title>Perfis dos Atletas | Estatísticas e Conquistas | Fut7Pro</title>
        <meta
          name="description"
          content="Conheça o perfil completo de todos os atletas do seu racha: estatísticas, conquistas, posição em campo e evolução ao longo das temporadas."
        />
        <meta
          name="keywords"
          content="fut7, atletas, jogadores, racha, futebol 7, estatisticas, conquistas, perfil, sistema, SaaS"
        />
      </Head>

      <h1 className="mt-10 mb-3 text-3xl md:text-4xl font-extrabold text-brand text-center leading-tight drop-shadow-sm">
        Perfis dos Atletas
      </h1>
      <p className="mb-7 text-base md:text-lg text-gray-300 text-center max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed font-medium">
        Descubra tudo sobre os <strong>atletas do seu racha</strong>! Acesse o{" "}
        <strong>perfil completo de cada jogador</strong> com estatísticas, conquistas, posição em
        campo, histórico de partidas e evolução por temporada.
      </p>

      <input
        type="text"
        placeholder="Digite o nome do atleta..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full p-2 rounded bg-zinc-800 text-white mb-6 outline-none focus:ring-2 focus:ring-brand"
        maxLength={20}
        aria-label="Buscar atleta"
      />

      {isLoading && <div className="text-gray-300">Carregando atletas...</div>}
      {isError && <div className="text-red-300">Falha ao carregar atletas.</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {atletasFiltrados.map((atleta) => {
            const profileSlug = atleta.slug?.trim() ? atleta.slug : atleta.id;
            const slugLabel = atleta.slug && !UUID_REGEX.test(atleta.slug) ? atleta.slug : null;

            return (
              <div
                key={atleta.slug || atleta.id}
                className="bg-neutral-900 rounded-xl p-4 shadow-md border border-neutral-800 hover:border-brand transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={atleta.foto || "/images/jogadores/jogador_padrao_01.jpg"}
                    alt={`Foto do atleta ${atleta.nome}`}
                    width={48}
                    height={48}
                    className="rounded-full border border-neutral-700"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-brand">{atleta.nome}</h2>
                    {slugLabel && <p className="text-sm text-gray-400">{slugLabel}</p>}
                  </div>
                </div>
                <div className="text-sm text-gray-300 space-y-1 mb-3">
                  <p>
                    <span className="font-bold text-brand">Jogos:</span> {atleta.jogos}
                  </p>
                  <p>
                    <span className="font-bold text-brand">Gols:</span> {atleta.gols} |{" "}
                    <span className="font-bold text-brand">Assist:</span> {atleta.assistencias}
                  </p>
                  <p>
                    <span className="font-bold text-brand">Ranking:</span> {atleta.pontos} pts
                  </p>
                </div>
                <Link
                  href={publicHref(`/atletas/${profileSlug}`)}
                  className="inline-block w-full text-center bg-brand-strong hover:bg-brand-strong text-black font-bold px-3 py-2 rounded-lg text-sm transition"
                >
                  Ver Perfil
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
