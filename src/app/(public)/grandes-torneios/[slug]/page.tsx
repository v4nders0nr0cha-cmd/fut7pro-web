"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { FaTrophy } from "react-icons/fa";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type PublicTorneioJogadorRaw = {
  id?: string | null;
  athleteId?: string | null;
  athleteSlug?: string | null;
  slug?: string | null;
  nome?: string | null;
  name?: string | null;
  posicao?: string | null;
  position?: string | null;
  fotoUrl?: string | null;
  foto?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  athlete?: PublicTorneioJogadorRaw | null;
  jogador?: PublicTorneioJogadorRaw | null;
};

type PublicTorneioRaw = {
  nome?: string | null;
  ano?: number | null;
  bannerUrl?: string | null;
  banner?: string | null;
  logoUrl?: string | null;
  logo?: string | null;
  campeao?: string | null;
  jogadoresCampeoes?: PublicTorneioJogadorRaw[] | null;
  campeoes?: PublicTorneioJogadorRaw[] | null;
  atletasCampeoes?: PublicTorneioJogadorRaw[] | null;
  torneio?: PublicTorneioRaw | null;
};

type PublicTorneioJogador = {
  key: string;
  nome: string;
  posicao: string;
  fotoUrl: string;
  slug?: string | null;
};

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  });

const normalizeCampeao = (
  jogador: PublicTorneioJogadorRaw,
  index: number
): PublicTorneioJogador | null => {
  const nested = jogador.athlete ?? jogador.jogador ?? null;
  const source = nested ? { ...jogador, ...nested } : jogador;
  const nome = source.nome ?? source.name ?? null;
  if (!nome) return null;

  const slug = source.athleteSlug ?? source.slug ?? null;
  const key = source.athleteId ?? source.id ?? slug ?? `${nome}-${index}`;

  return {
    key,
    nome,
    posicao: source.posicao ?? source.position ?? "Atleta",
    fotoUrl:
      source.fotoUrl ??
      source.avatarUrl ??
      source.avatar ??
      source.foto ??
      "/images/jogadores/jogador_padrao_01.jpg",
    slug,
  };
};

export default function DetalheTorneioPage() {
  const params = useParams() as { slug?: string; torneioSlug?: string };
  const torneioSlug = params.torneioSlug || params.slug;
  const { publicHref, publicSlug } = usePublicLinks();
  const { data: rawTorneio, error } = useSWR<PublicTorneioRaw>(
    torneioSlug ? `/api/public/${publicSlug}/torneios/${torneioSlug}` : null,
    fetcher
  );

  if (error?.message === "404") return notFound();

  const torneio = rawTorneio?.torneio ?? rawTorneio;
  const campeoes = (
    torneio?.jogadoresCampeoes ??
    torneio?.campeoes ??
    torneio?.atletasCampeoes ??
    []
  )
    .map(normalizeCampeao)
    .filter((jogador): jogador is PublicTorneioJogador => Boolean(jogador));

  return (
    <main className="min-h-screen bg-fundo text-white pt-6 pb-20">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-brand mb-2 text-center">
          {torneio?.nome || "Torneio"}
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm md:text-base">
          Edição especial realizada em {torneio?.ano || "----"} com os jogadores mais lendários do
          racha!
        </p>

        <div className="relative w-full h-64 md:h-96 mb-4">
          <Image
            src={torneio?.bannerUrl || torneio?.banner || "/images/torneios/placeholder.jpg"}
            alt={`Banner do torneio ${torneio?.nome || ""}`}
            fill
            className="object-cover rounded-xl border border-brand-strong"
            priority
          />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-brand font-bold text-lg mb-2">TIME CAMPEÃO</h2>
          <Image
            src={torneio?.logoUrl || torneio?.logo || "/images/torneios/placeholder.jpg"}
            alt={`Logo do time campeão ${torneio?.campeao || ""}`}
            width={96}
            height={96}
            className="rounded-xl bg-white p-2 mx-auto object-contain"
          />
          <div className="text-white font-semibold mt-2">{torneio?.campeao || "A definir"}</div>
        </div>

        {campeoes.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 flex items-center justify-center gap-2 text-2xl font-bold text-brand">
              <FaTrophy aria-hidden />
              Atletas campeões
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {campeoes.map((jogador) => {
                const content = (
                  <>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-brand-strong bg-zinc-950">
                      <Image
                        src={jogador.fotoUrl}
                        alt={`Foto de ${jogador.nome}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{jogador.nome}</p>
                      <p className="text-sm font-semibold text-brand">{jogador.posicao}</p>
                    </div>
                  </>
                );

                const className =
                  "flex items-center gap-3 rounded-lg border border-brand-strong bg-zinc-900/80 p-3 transition hover:border-brand hover:bg-zinc-800/80";

                return jogador.slug ? (
                  <Link
                    key={jogador.key}
                    href={publicHref(`/atletas/${jogador.slug}`)}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={jogador.key} className={className}>
                    {content}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
