"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { useRacha } from "@/context/RachaContext";
import { useBranding } from "@/hooks/useBranding";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";
import { recordSponsorMetric } from "@/lib/sponsor-metrics";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/$/,
  ""
);

const resolveCategoria = (ramo?: string | null) => {
  const trimmed = ramo?.trim();
  if (!trimmed) return "Parceiro do racha";
  const normalized = trimmed.toLowerCase();
  if (
    normalized === "plano basic" ||
    normalized === "plano plus" ||
    normalized === "plano pro" ||
    normalized === "basic" ||
    normalized === "plus" ||
    normalized === "pro"
  ) {
    return "Parceiro do racha";
  }
  return trimmed;
};

export default function NossosParceiros() {
  const { tenantSlug } = useRacha();
  const { publicSlug } = usePublicLinks();
  const slug = publicSlug.trim() || tenantSlug.trim() || "";
  const { nome: brandName } = useBranding({ scope: "public", slug });
  const { sponsors, isLoading, isError } = usePublicSponsors(slug);
  const impressionRef = useRef(new Set<string>());

  const parceiros = useMemo(
    () =>
      sponsors.map((sponsor) => ({
        id: sponsor.id,
        nome: sponsor.name,
        logo: sponsor.logoUrl,
        categoria: resolveCategoria(sponsor.ramo),
        descricao:
          sponsor.about || sponsor.benefit || sponsor.coupon || "Patrocinador parceiro do racha.",
        link: sponsor.link,
        destaque: sponsor.tier === "PRO" || sponsor.showOnFooter,
        status: sponsor.status,
        isPlaceholder: sponsor.isPlaceholder,
      })),
    [sponsors]
  );

  useEffect(() => {
    if (!parceiros.length) return;
    const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;
    parceiros.forEach((patro) => {
      if (patro.isPlaceholder) return;
      if (impressionRef.current.has(patro.id)) return;
      impressionRef.current.add(patro.id);
      recordSponsorMetric({
        slug,
        sponsorId: patro.id,
        type: "impression",
        targetUrl: patro.link,
        currentUrl,
      });
    });
  }, [parceiros, slug]);

  const seoTitle = `Nossos Parceiros | ${brandName}`;
  const seoDescription = `Conheça os patrocinadores e apoiadores do ${brandName}.`;
  const seoUrl = `${APP_URL}/${slug}/sobre-nos/nossos-parceiros`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="parceiros, patrocinadores, futebol 7, racha, apoio, descontos, fut7pro"
        />
        <link rel="canonical" href={seoUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoUrl} />
      </Head>

      <main className="w-full pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-brand text-center mb-2">
            Nossos Parceiros
          </h1>
          <p className="text-center text-base md:text-lg text-neutral-200 mb-10 max-w-2xl font-medium">
            Ajude quem fortalece o nosso racha! <br />
            Valorize quem acredita na nossa equipe. Siga, prestigie e dê preferência aos nossos
            parceiros, empresas e profissionais que apoiam o racha com descontos, patrocínios,
            produtos e serviços de qualidade.
          </p>

          {isLoading && <div className="text-gray-300 py-6">Carregando patrocinadores...</div>}

          {isError && !isLoading && (
            <div className="text-red-300 py-6">
              Não foi possível carregar os patrocinadores no momento.
            </div>
          )}

          {!isLoading && !isError && parceiros.length === 0 && (
            <div className="text-gray-400 py-6">Nenhum patrocinador publicado ainda.</div>
          )}

          {!isLoading && !isError && parceiros.length > 0 && (
            <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {parceiros.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center bg-neutral-800 rounded-2xl border border-neutral-700 p-5 text-center h-full transition hover:border-brand"
                >
                  <div className="w-full h-24 flex items-center justify-center mb-3 rounded-xl bg-neutral-900 border border-neutral-700">
                    <Image
                      src={p.logo}
                      alt={`Logo de ${p.nome}`}
                      width={160}
                      height={96}
                      className="h-16 w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-lg font-bold text-brand-soft mb-1">{p.nome}</span>
                  <span className="text-sm text-neutral-400 mb-2">{p.categoria}</span>
                  <p className="text-sm text-neutral-200 mb-2">{p.descricao}</p>
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      className={`inline-block mt-auto px-3 py-1 rounded-full text-sm font-semibold ${
                        p.destaque
                          ? "bg-brand text-neutral-900 hover:bg-brand-soft"
                          : "bg-neutral-900 text-brand-soft border border-brand hover:bg-brand hover:text-neutral-900"
                      } transition`}
                      rel="noopener noreferrer"
                      onClick={() =>
                        !p.isPlaceholder &&
                        recordSponsorMetric({
                          slug,
                          sponsorId: p.id,
                          type: "click",
                          targetUrl: p.link,
                          currentUrl:
                            typeof window !== "undefined" ? window.location.href : undefined,
                        })
                      }
                    >
                      {p.destaque ? "Site oficial" : "Saiba mais"}
                    </a>
                  ) : (
                    <span className="inline-block mt-auto px-3 py-1 rounded-full text-sm font-semibold bg-neutral-900 text-neutral-400 border border-neutral-700">
                      Sem link
                    </span>
                  )}
                </div>
              ))}
            </section>
          )}

          <p className="text-center text-neutral-400 text-sm md:text-base mb-10 max-w-2xl">
            Quer apoiar nosso racha, divulgar sua empresa e fortalecer o futebol 7 entre amigos?
            <br />
            Fale com a administração e saiba como ser um parceiro.
          </p>
        </div>
      </main>
    </>
  );
}
