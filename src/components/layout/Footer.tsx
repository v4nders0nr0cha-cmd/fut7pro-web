"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { FaFacebookF, FaWhatsapp, FaInstagram, FaYoutube, FaGlobe } from "react-icons/fa";
import { useTema } from "@/hooks/useTema";
import { rachaConfig } from "@/config/racha.config";
import { useRacha } from "@/context/RachaContext";
import { useAboutPublic } from "@/hooks/useAbout";
import { useFooterConfigPublic } from "@/hooks/useFooterConfig";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";
import { useSocialLinksPublic } from "@/hooks/useSocialLinks";
import { recordSponsorMetric } from "@/lib/sponsor-metrics";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { buildMapsEmbedUrl } from "@/utils/maps";
import { normalizeSocialUrl } from "@/utils/social-links";

export default function Footer() {
  const tema = useTema();
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { about } = useAboutPublic(slug);
  const { footer } = useFooterConfigPublic(slug);
  const { socialLinks } = useSocialLinksPublic(slug);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const impressionRef = useRef(new Set<string>());
  const { slots, isLoading } = usePublicSponsors(slug);
  const { publicHref } = usePublicLinks();

  const campoAbout = useMemo(() => {
    if (about?.campoAtual) return about.campoAtual;
    if (about?.camposHistoricos?.length) return about.camposHistoricos[0];
    return null;
  }, [about]);

  const campoNome = footer?.campo?.nome || campoAbout?.nome;
  const campoEndereco = footer?.campo?.endereco || campoAbout?.endereco || tema.endereco;
  const mapaBase = footer?.campo?.mapa || campoAbout?.mapa;
  const mapaQuery = campoEndereco || campoNome || campoAbout?.endereco || campoAbout?.nome;
  const campoMapa = buildMapsEmbedUrl(mapaBase, mapaQuery);

  const legenda =
    footer?.legenda && footer.legenda.trim().length > 0
      ? footer.legenda
      : rachaConfig.frases.principal;

  const topicosPadrao = useMemo(
    () => [
      { id: "ranking", label: "Sistema de Ranking", href: publicHref("/estatisticas") },
      { id: "premiacao", label: "Sistema de Premiação", href: publicHref("/os-campeoes") },
      {
        id: "balanceamento",
        label: "Sistema de Balanceamento",
        href: publicHref("/sorteio-inteligente"),
      },
      { id: "como-funciona", label: "Como Funciona", href: publicHref("/sobre-nos") },
      { id: "sobre", label: `Sobre o ${tema.nome}`, href: publicHref("/sobre-nos") },
      { id: "termos", label: "Termos de Uso", href: publicHref("/termos") },
      { id: "privacidade", label: "Política de Privacidade", href: publicHref("/privacidade") },
    ],
    [publicHref, tema.nome]
  );

  const topicosOcultos = footer?.topicosOcultos ?? [];
  const topicosExtras = footer?.topicosExtras ?? [];
  const topicosVisiveis = topicosPadrao.filter(
    (topico) => !topicosOcultos.includes(topico.id) && !topicosOcultos.includes(topico.label)
  );

  const patrocinadoresVisiveis = useMemo(() => slots.slice(0, 10), [slots]);

  const patrocinadoresLoop = useMemo(() => {
    if (!patrocinadoresVisiveis.length) return [];
    return [...patrocinadoresVisiveis, ...patrocinadoresVisiveis];
  }, [patrocinadoresVisiveis]);

  const socialItems = useMemo(
    () => [
      {
        id: "instagram",
        label: "Instagram",
        href: normalizeSocialUrl(socialLinks?.instagramUrl),
        icon: <FaInstagram className="text-brand hover:text-black text-lg" />,
      },
      {
        id: "facebook",
        label: "Facebook",
        href: normalizeSocialUrl(socialLinks?.facebookUrl),
        icon: <FaFacebookF className="text-brand hover:text-black text-lg" />,
      },
      {
        id: "youtube",
        label: "YouTube",
        href: normalizeSocialUrl(socialLinks?.youtubeUrl),
        icon: <FaYoutube className="text-brand hover:text-black text-lg" />,
      },
      {
        id: "website",
        label: "Site",
        href: normalizeSocialUrl(socialLinks?.websiteUrl),
        icon: <FaGlobe className="text-brand hover:text-black text-lg" />,
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        href: normalizeSocialUrl(socialLinks?.whatsappGroupUrl),
        icon: <FaWhatsapp className="text-brand hover:text-black text-lg" />,
      },
    ],
    [socialLinks]
  );

  const socialVisible = useMemo(
    () => socialItems.filter((item) => Boolean(item.href)),
    [socialItems]
  );

  useEffect(() => {
    const scroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth) {
          carouselRef.current.scrollLeft = 0;
        } else {
          carouselRef.current.scrollLeft += 1;
        }
      }
    };
    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!patrocinadoresVisiveis.length) return;
    const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;
    patrocinadoresVisiveis.forEach((patro) => {
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
  }, [patrocinadoresVisiveis, slug]);

  const handleManualScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="bg-[#0e0e0e] text-white mt-t border-t border-brand">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-center text-xl font-bold text-brand mb-6 animate-pulse">
          <span className="bg-gradient-to-r from-[var(--brand-soft)] via-[var(--brand)] to-[var(--brand-soft)] bg-clip-text text-transparent">
            NOSSOS PATROCINADORES
          </span>
        </h2>

        <div className="relative overflow-hidden group mb-12">
          <button
            onClick={() => handleManualScroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 p-2 rounded-full text-brand hover:bg-brand hover:text-black"
          >
            &#9664;
          </button>
          <button
            onClick={() => handleManualScroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 p-2 rounded-full text-brand hover:bg-brand hover:text-black"
          >
            &#9654;
          </button>
          <div
            ref={carouselRef}
            className="w-full flex gap-12 overflow-x-auto whitespace-nowrap scrollbar-hide scrollbar-theme"
          >
            {isLoading && patrocinadoresLoop.length === 0 ? (
              <div className="w-full text-center text-gray-400 py-8">
                Carregando patrocinadores...
              </div>
            ) : patrocinadoresLoop.length === 0 ? (
              <div className="w-full text-center text-gray-400 py-8">
                Nenhum patrocinador publicado ainda.
              </div>
            ) : (
              patrocinadoresLoop.map((patro, index) => {
                const image = (
                  <Image
                    src={patro.logoUrl}
                    alt={`Logo do patrocinador ${patro.name} - sistema de racha ${tema.nome}`}
                    width={160}
                    height={96}
                    className="h-16 w-auto max-w-[160px] object-contain opacity-80 hover:opacity-100 transition duration-300"
                  />
                );

                return (
                  <div
                    key={`${patro.id}-${index}`}
                    className="min-w-[160px] flex justify-center items-center"
                  >
                    {patro.link ? (
                      <a
                        href={patro.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          !patro.isPlaceholder &&
                          recordSponsorMetric({
                            slug,
                            sponsorId: patro.id,
                            type: "click",
                            targetUrl: patro.link,
                            currentUrl:
                              typeof window !== "undefined" ? window.location.href : undefined,
                          })
                        }
                        aria-label={`Visitar site do patrocinador ${patro.name}`}
                      >
                        {image}
                      </a>
                    ) : (
                      image
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-3 gap-10 items-start">
          <div>
            <p className="text-brand font-bold mb-2">NOSSO CAMPO OFICIAL</p>
            {campoNome ? <p className="text-gray-100 font-semibold mb-1">{campoNome}</p> : null}
            <p className="text-gray-300 mb-3">{campoEndereco || "Endereço não informado"}</p>
            <iframe
              src={campoMapa}
              width="100%"
              height="150"
              className="rounded-md border-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa do campo oficial do racha ${tema.nome}`}
              allowFullScreen
            ></iframe>
          </div>

          <div className="flex flex-col items-center justify-start gap-2">
            <p className="text-brand font-bold mb-2">Siga-nos</p>
            <div className="flex gap-3">
              {socialVisible.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  <div className="border border-brand p-2 rounded-md hover:bg-brand transition cursor-pointer">
                    {item.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-right text-gray-300">
            {topicosVisiveis.map((topico) => (
              <Link key={topico.id} href={topico.href} className="hover:underline">
                {topico.label}
              </Link>
            ))}
            {topicosExtras.map((topico, idx) => (
              <span key={`${topico}-${idx}`} className="text-gray-300">
                {topico}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href={rachaConfig.urls.site}
            target="_blank"
            aria-label={`Site ${rachaConfig.nome}`}
          >
            <Image
              src={rachaConfig.logo}
              alt={`Logo ${rachaConfig.nome} sistema de futebol 7 entre amigos`}
              width={64}
              height={64}
              className="mx-auto mb-2"
              priority
            />
          </Link>
          <p className="text-sm text-gray-400">{legenda}</p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {tema.nome}. Todos os direitos reservados. v1.0
        </div>
      </div>
    </footer>
  );
}
