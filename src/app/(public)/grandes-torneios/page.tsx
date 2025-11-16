"use client";

import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { usePublicTorneios } from "@/hooks/usePublicTorneios";

export default function GrandesTorneiosPage() {
  const tenantSlug = usePublicTenantSlug();
  const { torneios, isLoading, isError, error } = usePublicTorneios(tenantSlug);

  const destaque = torneios.find((t) => t.destacarNoSite);
  const demais = torneios.filter((t) => !t.destacarNoSite);

  return (
    <>
      <Head>
        <title>Grandes Torneios | Fut7Pro</title>
        <meta
          name="description"
          content="Veja os torneios mais importantes do Fut7Pro e os campeões de cada edição."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, grandes torneios, campeões, eventos especiais, racha"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white pt-8 pb-20">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="mt-10 mb-3 text-3xl md:text-4xl font-extrabold text-yellow-400 text-center leading-tight drop-shadow-sm">
            Grandes Torneios
          </h1>

          <p className="mb-8 text-base md:text-lg text-gray-300 text-center max-w-4xl mx-auto leading-relaxed font-medium">
            Acompanhe os torneios especiais do seu racha, com banners, campeões e atletas destaques.
          </p>

          {isError && (
            <div className="text-center text-red-300 bg-red-900/30 border border-red-700/30 px-4 py-3 rounded-lg mb-6">
              {error ?? "Não foi possível carregar os torneios."}
            </div>
          )}

          {isLoading && torneios.length === 0 && (
            <div className="text-center text-gray-400 py-10">Carregando torneios...</div>
          )}

          {destaque && (
            <div className="bg-zinc-900 border border-yellow-600 rounded-xl overflow-hidden shadow-lg mb-8">
              <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 w-full">
                <Image
                  src={destaque.bannerUrl || "/images/torneios/placeholder.jpg"}
                  alt={`Banner do torneio ${destaque.nome}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                />
                <div className="absolute inset-0 bg-black/60 flex items-end">
                  <div className="p-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">
                      {destaque.nome}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      {destaque.descricaoResumida ??
                        "Edição especial com os campeões do seu racha."}
                    </p>
                    <Link
                      href={`/${tenantSlug}/grandes-torneios/${destaque.slug}`}
                      className="inline-block mt-1 text-sm font-semibold text-yellow-400 hover:underline"
                    >
                      Ver Detalhes →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demais.map((torneio) => (
              <div
                key={torneio.id}
                className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={torneio.bannerUrl || "/images/torneios/placeholder.jpg"}
                    alt={`Banner do ${torneio.nome}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    {torneio.nome}
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 rounded px-2 py-0.5">
                      {torneio.ano}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {torneio.descricaoResumida ?? "Torneio especial do racha."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Campeão: <b className="text-yellow-300">{torneio.campeao ?? "-"}</b>
                    </span>
                    <Link
                      href={`/${tenantSlug}/grandes-torneios/${torneio.slug}`}
                      className="text-yellow-400 hover:underline text-sm font-semibold"
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && torneios.length === 0 && (
            <p className="text-center text-gray-500 italic mt-6 text-sm">
              Nenhum torneio publicado ainda.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
