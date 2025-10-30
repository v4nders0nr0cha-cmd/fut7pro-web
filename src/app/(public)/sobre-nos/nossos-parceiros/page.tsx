"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";
import { rachaConfig } from "@/config/racha.config";
import type { Patrocinador } from "@/types/patrocinador";

const seo = {
  title: "Nossos Parceiros | Fut7Pro – Patrocinadores e apoio ao futebol 7",
  description:
    "Conheça os patrocinadores do Fut7Pro: empresas que apoiam nosso racha com descontos, doações e parcerias. Sua marca também pode aparecer aqui!",
  keywords:
    "parceiros fut7pro, patrocinadores futebol 7, descontos racha, apoio esporte, fut7pro parceiros",
  url: "https://fut7pro.com.br/sobre-nos/nossos-parceiros",
};

const FALLBACK_SPONSORS: Patrocinador[] = [
  {
    id: "fallback-fut7pro",
    name: "Fut7Pro",
    logoUrl: "https://app.fut7pro.com.br/images/logos/logo_fut7pro.png",
    tier: "PRO",
    displayOrder: 1,
    showOnFooter: true,
    about:
      "Plataforma oficial de gestão de rachas e estatísticas do Futebol 7 no Brasil. Sorteio inteligente, rankings, site público e painel admin em um só lugar.",
    link: "https://fut7pro.com.br",
    status: "ativo",
  },
];

function resolveSlug(pathname: string | null): string | null {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return null;
  const first = segments[0];
  if (first === "sobre-nos") return null;
  return first;
}

export default function NossosParceiros() {
  const { user } = useAuth();
  const pathname = usePathname();
  const slugFromPath = useMemo(() => resolveSlug(pathname), [pathname]);
  const slug = user?.tenantSlug ?? slugFromPath ?? rachaConfig.slug;
  const { patrocinadores, isLoading } = usePublicSponsors(slug);

  const parceiros = patrocinadores.length > 0 ? patrocinadores : FALLBACK_SPONSORS;

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <link rel="canonical" href={seo.url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.url} />
      </Head>

      <main className="w-full pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mb-2 flex items-center justify-center gap-2">
            Nossos Parceiros
            <span
              role="img"
              aria-label="aperto de mãos"
              className="text-yellow-300 text-2xl md:text-3xl"
            >
              🤝
            </span>
          </h1>
          <p className="text-center text-base md:text-lg text-neutral-200 mb-10 max-w-2xl font-medium">
            Ajude quem fortalece o nosso racha! Valorize quem acredita na nossa equipe. Siga,
            prestigie e dê preferência aos nossos parceiros — eles apoiam o racha com descontos,
            patrocínios, produtos e serviços de qualidade.
          </p>

          <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {parceiros.map((parceiro) => (
              <div
                key={parceiro.id}
                className="flex flex-col items-center bg-neutral-800 rounded-2xl border border-neutral-700 p-5 text-center h-full transition hover:border-yellow-400"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-2">
                  <Image
                    src={parceiro.logoUrl}
                    alt={`Logo de ${parceiro.name}`}
                    width={64}
                    height={64}
                    className="rounded-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-lg font-bold text-yellow-300 mb-1">{parceiro.name}</span>
                {parceiro.ramo && (
                  <span className="text-sm text-neutral-400 mb-2">{parceiro.ramo}</span>
                )}
                {parceiro.about && (
                  <p className="text-sm text-neutral-200 mb-2">{parceiro.about}</p>
                )}
                <span className="text-xs uppercase text-neutral-400 mb-2">
                  Tier: {parceiro.tier}
                </span>
                <Link
                  href={parceiro.link || "#"}
                  target="_blank"
                  className="inline-block mt-auto px-3 py-1 rounded-full text-sm font-semibold bg-neutral-900 text-yellow-300 border border-yellow-400 hover:bg-yellow-400 hover:text-neutral-900 transition disabled:opacity-50"
                  rel="noopener noreferrer"
                >
                  {parceiro.link ? "Visitar" : "Em breve"}
                </Link>
              </div>
            ))}
          </section>

          {isLoading && (
            <p className="text-center text-neutral-400 text-sm md:text-base mb-10 max-w-2xl">
              Carregando parceiros cadastrados...
            </p>
          )}

          <p className="text-center text-neutral-400 text-sm md:text-base mb-10 max-w-2xl">
            Quer apoiar nosso racha, divulgar sua empresa e fortalecer o futebol 7 entre amigos?
            Fale com a administração e saiba como ser um parceiro.
          </p>
        </div>
      </main>
    </>
  );
}
