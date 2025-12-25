"use client";

import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import Image from "next/image";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GrandesTorneiosPage() {
  const { publicHref, publicSlug } = usePublicLinks();
  const { data: torneios } = useSWR(`/api/public/${publicSlug}/torneios`, fetcher, {
    revalidateOnFocus: false,
  });

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

          <p
            className="
            mb-8 text-base md:text-lg text-gray-300 text-center 
            max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto
            leading-relaxed font-medium
          "
          >
            Aqui você confere todos os nossos <strong>Grandes Torneios</strong>. Conquistas
            marcantes de <strong>campeonatos de confraternização</strong>,{" "}
            <strong>eventos únicos</strong> e memoráveis.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {(torneios || []).map((torneio: any) => (
              <div
                key={torneio.slug}
                className="bg-zinc-900 border border-yellow-600 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 w-full">
                  <Image
                    src={torneio.bannerUrl || torneio.banner || "/images/torneios/placeholder.jpg"}
                    alt={`Banner do torneio ${torneio.nome}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 900px"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-end">
                    <div className="p-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">
                        🏆 {torneio.nome}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        Edição {torneio.ano || "especial"} com os melhores jogadores do racha.
                      </p>
                      <Link
                        href={publicHref(`/grandes-torneios/${torneio.slug}`)}
                        className="inline-block mt-1 text-sm font-semibold text-yellow-400 hover:underline"
                      >
                        Ver Detalhes →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!torneios && (
              <p className="text-center text-gray-500 italic mt-6 text-sm">
                Em breve, novos torneios estarão disponíveis nesta página.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
