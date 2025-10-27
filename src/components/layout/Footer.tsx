"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaFacebookF, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useTema } from "@/hooks/useTema";
import { rachaConfig } from "@/config/racha.config";
import { usePathname } from "next/navigation";

type SponsorPublic = {
  id: string;
  name: string;
  logoUrl: string;
  link?: string | null;
  tier?: "BASIC" | "PLUS" | "PRO";
  showOnFooter?: boolean;
};

export default function Footer() {
  const tema = useTema();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const slug = (pathname || "/").split("/").filter(Boolean)[0] || "fut7pro";
  const [patros, setPatros] = useState<SponsorPublic[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadSponsors = async () => {
      try {
        const res = await fetch(`/api/public/sponsors?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`status_${res.status}`);
        const payload = (await res.json().catch(() => ({}))) as { data?: SponsorPublic[] };
        const arr = Array.isArray(payload.data) ? payload.data : [];
        if (cancelled) return;
        const visible = arr.filter((sponsor) =>
          sponsor.showOnFooter || sponsor.tier === "PLUS" || sponsor.tier === "PRO"
        );
        setPatros(visible.length ? visible : arr);
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        setPatros([]);
      }
    };

    loadSponsors();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

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
    <footer className="bg-[#0e0e0e] text-white mt-t border-t border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-center text-xl font-bold text-yellow-400 mb-6 animate-pulse">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent">
            NOSSOS PATROCINADORES
          </span>
        </h2>

        {/* Carrossel de Patrocinadores */}
        <div className="relative overflow-hidden group mb-12">
          <button
            onClick={() => handleManualScroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 p-2 rounded-full text-yellow-400 hover:bg-yellow-500 hover:text-black"
          >
            &#9664;
          </button>
          <button
            onClick={() => handleManualScroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/60 p-2 rounded-full text-yellow-400 hover:bg-yellow-500 hover:text-black"
          >
            &#9654;
          </button>
          <div ref={carouselRef} className="w-full flex gap-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {[...patros, ...patros].map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="min-w-[180px] flex justify-center items-center">
                <Image
                  src={p.logoUrl}
                  alt={`Logo do patrocinador ${p.name} - sistema de racha ${rachaConfig.nome}`}
                  width={160}
                  height={96}
                  className="h-24 w-40 object-contain opacity-80 hover:opacity-100 transition duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Grid inferior */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-3 gap-10 items-start">
          {/* Coluna 1 - Campo + Mapa */}
          <div>
            <p className="text-yellow-400 font-bold mb-2">NOSSO CAMPO OFICIAL</p>
            <p className="text-gray-300 mb-3">{tema.endereco || "Endereço não informado"}</p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.532659134175!2d-46.63633848502184!3d-23.58802138466644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59bfd39ab0f1%3A0x17727fd74a3f5b1e!2sCampo%20de%20Futebol%20Exemplo!5e0!3m2!1spt-BR!2sbr!4v1618950669409!5m2!1spt-BR!2sbr"
              width="100%"
              height="150"
              className="rounded-md border-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa do campo oficial do racha ${rachaConfig.nome}`}
            ></iframe>
          </div>

          {/* Coluna 2 - Siga-nos centralizado */}
          <div className="flex flex-col items-center justify-start gap-2">
            <p className="text-yellow-400 font-bold mb-2">Siga - nos</p>
            <div className="flex gap-3">
              <Link href="https://facebook.com/suaPagina" target="_blank" aria-label="Facebook">
                <div className="border border-yellow-400 p-2 rounded-md hover:bg-yellow-400 transition cursor-pointer">
                  <FaFacebookF className="text-yellow-400 hover:text-black text-lg" />
                </div>
              </Link>
              <Link href="https://wa.me/seuNumero" target="_blank" aria-label="WhatsApp">
                <div className="border border-yellow-400 p-2 rounded-md hover:bg-yellow-400 transition cursor-pointer">
                  <FaWhatsapp className="text-yellow-400 hover:text-black text-lg" />
                </div>
              </Link>
              <Link href="https://instagram.com/seuPerfil" target="_blank" aria-label="Instagram">
                <div className="border border-yellow-400 p-2 rounded-md hover:bg-yellow-400 transition cursor-pointer">
                  <FaInstagram className="text-yellow-400 hover:text-black text-lg" />
                </div>
              </Link>
            </div>
          </div>

          {/* Coluna 3 - Links */}
          <div className="flex flex-col gap-2 text-sm text-right text-gray-300">
            <Link href="/sistema-de-ranking" className="hover:underline">
              Sistema de Ranking
            </Link>
            <Link href="/sistema-de-premiacoes" className="hover:underline">
              Sistema de Premiações
            </Link>
            <Link href="/sistema-de-balanceamento" className="hover:underline">
              Sistema de Balanceamento
            </Link>
            <Link href="/como-funciona" className="hover:underline">
              Como Funciona
            </Link>
            <Link href="/sobre" className="hover:underline">
              Sobre o {rachaConfig.nome}
            </Link>
            <Link href="/termos-de-uso" className="hover:underline">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>

        {/* Logo e frase final */}
        <div className="mt-10 text-center">
          <Link href={rachaConfig.urls.site} target="_blank" aria-label={`Site ${rachaConfig.nome}`}>
            <Image
              src={rachaConfig.logo}
              alt={`Logo ${rachaConfig.nome} sistema de futebol 7 entre amigos`}
              width={64}
              height={64}
              className="mx-auto mb-2"
              priority
            />
          </Link>
          <p className="text-sm text-gray-400">{rachaConfig.frases.principal}</p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {rachaConfig.nome}. Todos os direitos reservados. v1.0
        </div>
      </div>
    </footer>
  );
}
