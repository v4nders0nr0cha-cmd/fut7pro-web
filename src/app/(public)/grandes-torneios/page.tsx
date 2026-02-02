"use client";

import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type PublicTorneiosResponse = {
  slug?: string;
  total?: number;
  results?: Array<{
    id: string;
    slug: string;
    nome: string;
    ano?: number | null;
    bannerUrl?: string | null;
    banner?: string | null;
    logoUrl?: string | null;
    campeao?: string | null;
    dataInicio?: string | null;
    dataFim?: string | null;
    descricaoResumida?: string | null;
  }>;
};

const EMPTY_TORNEIOS: PublicTorneiosResponse["results"] = [];

const fetcher = async (url: string): Promise<PublicTorneiosResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json();
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateRange = (start?: string | null, end?: string | null, year?: number | null) => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (startDate && endDate) {
    return `${startDate.toLocaleDateString("pt-BR")} - ${endDate.toLocaleDateString("pt-BR")}`;
  }
  if (startDate) {
    return startDate.toLocaleDateString("pt-BR");
  }
  if (year) {
    return `Ano ${year}`;
  }
  return "Data a definir";
};

export default function GrandesTorneiosPage() {
  const { publicHref, publicSlug } = usePublicLinks();
  const { data, error, isLoading } = useSWR<PublicTorneiosResponse>(
    `/api/public/${publicSlug}/torneios`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  const torneios = useMemo(() => data?.results ?? EMPTY_TORNEIOS, [data?.results]);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    torneios.forEach((torneio) => {
      if (torneio.ano) {
        years.add(torneio.ano);
        return;
      }
      const parsed = parseDate(torneio.dataInicio);
      if (parsed) {
        years.add(parsed.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [torneios]);
  const filteredTorneios = useMemo(() => {
    if (selectedYear === "all") return torneios;
    return torneios.filter((torneio) => torneio.ano === selectedYear);
  }, [selectedYear, torneios]);
  const isError = Boolean(error);
  const isEmpty = !isLoading && !isError && filteredTorneios.length === 0;

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
          <h1 className="mt-10 mb-3 text-3xl md:text-4xl font-extrabold text-brand text-center leading-tight drop-shadow-sm">
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

          {availableYears.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
              <label className="text-sm text-gray-300 font-semibold" htmlFor="torneios-ano">
                Filtrar por ano:
              </label>
              <select
                id="torneios-ano"
                className="bg-zinc-900 border border-brand-strong text-white rounded px-3 py-2 text-sm"
                value={selectedYear}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedYear(value === "all" ? "all" : Number(value));
                }}
              >
                <option value="all">Todos</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {isLoading && (
              <p className="text-center text-gray-500 italic mt-6 text-sm">
                Carregando torneios...
              </p>
            )}
            {isError && (
              <p className="text-center text-red-400 italic mt-6 text-sm">
                Não foi possível carregar os torneios agora.
              </p>
            )}
            {!isLoading &&
              !isError &&
              filteredTorneios.map((torneio) => {
                const dateLabel = formatDateRange(torneio.dataInicio, torneio.dataFim, torneio.ano);
                const logo =
                  torneio.logoUrl ||
                  torneio.bannerUrl ||
                  torneio.banner ||
                  "/images/torneios/placeholder.jpg";

                return (
                  <div
                    key={torneio.slug}
                    className="bg-zinc-900 border border-brand-strong rounded-xl overflow-hidden shadow-lg"
                  >
                    <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 w-full">
                      <Image
                        src={
                          torneio.bannerUrl || torneio.banner || "/images/torneios/placeholder.jpg"
                        }
                        alt={`Banner do torneio ${torneio.nome}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 900px"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-end">
                        <div className="p-4">
                          <h3 className="text-xl sm:text-2xl font-bold text-brand mb-1">
                            ?? {torneio.nome}
                          </h3>
                          <p className="text-sm text-gray-300 mb-2">
                            {torneio.descricaoResumida ||
                              `Edição ${torneio.ano || "especial"} com os melhores jogadores do racha.`}
                          </p>
                          <Link
                            href={publicHref(`/grandes-torneios/${torneio.slug}`)}
                            className="inline-block mt-1 text-sm font-semibold text-brand hover:underline"
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border-t border-zinc-800">
                      <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border border-brand-strong/70 bg-zinc-950">
                        <Image
                          src={logo}
                          alt={`Escudo do time campeão ${torneio.campeao || "A definir"}`}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Time campeão
                        </p>
                        <p className="text-sm font-semibold text-brand-soft">
                          {torneio.campeao || "A definir"}
                        </p>
                        <p className="text-xs text-gray-400">{dateLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            {isEmpty && (
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
