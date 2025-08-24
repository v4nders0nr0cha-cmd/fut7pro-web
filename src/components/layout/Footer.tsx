"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useTema } from "@/hooks/useTema";
import { rachaConfig } from "@/config/racha.config";

const patrocinadores = [
  { nome: "Patrocínio 1", logo: "/images/patrocinadores/patrocinador_01.png" },
  { nome: "Patrocínio 2", logo: "/images/patrocinadores/patrocinador_02.png" },
  { nome: "Patrocínio 3", logo: "/images/patrocinadores/patrocinador_03.png" },
  { nome: "Patrocínio 4", logo: "/images/patrocinadores/patrocinador_04.png" },
  { nome: "Patrocínio 5", logo: "/images/patrocinadores/patrocinador_05.png" },
  { nome: "Patrocínio 6", logo: "/images/patrocinadores/patrocinador_06.png" },
  { nome: "Patrocínio 7", logo: "/images/patrocinadores/patrocinador_07.png" },
  { nome: "Patrocínio 8", logo: "/images/patrocinadores/patrocinador_08.png" },
  { nome: "Patrocínio 9", logo: "/images/patrocinadores/patrocinador_09.png" },
  { nome: "Patrocínio 10", logo: "/images/patrocinadores/patrocinador_10.png" },
];

export default function Footer() {
  const tema = useTema();
  const carouselRef = useRef<HTMLDivElement | null>(null);

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
    <footer className="mt-t border-t border-yellow-400 bg-[#0e0e0e] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 animate-pulse text-center text-xl font-bold text-yellow-400">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent">
            NOSSOS PATROCINADORES
          </span>
        </h2>

        {/* Carrossel de Patrocinadores */}
        <div className="group relative mb-12 overflow-hidden">
          <button
            onClick={() => handleManualScroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-black/60 p-2 text-yellow-400 hover:bg-yellow-500 hover:text-black"
          >
            &#9664;
          </button>
          <button
            onClick={() => handleManualScroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-black/60 p-2 text-yellow-400 hover:bg-yellow-500 hover:text-black"
          >
            &#9654;
          </button>
          <div
            ref={carouselRef}
            className="scrollbar-hide flex w-full gap-12 overflow-x-auto whitespace-nowrap"
          >
            {[...patrocinadores, ...patrocinadores].map((patro, index) => (
              <div
                key={index}
                className="flex min-w-[180px] items-center justify-center"
              >
                <Image
                  src={patro.logo}
                  alt={`Logo do patrocinador ${patro.nome} - sistema de racha ${rachaConfig.nome}`}
                  width={160}
                  height={96}
                  className="h-24 w-40 object-contain opacity-80 transition duration-300 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Grid inferior */}
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_auto] lg:grid-cols-3">
          {/* Coluna 1 – Campo + Mapa */}
          <div>
            <p className="mb-2 font-bold text-yellow-400">
              NOSSO CAMPO OFICIAL
            </p>
            <p className="mb-3 text-gray-300">
              {tema.endereco || "Endereço não informado"}
            </p>
            {/* Card do mapa com link para Google Maps */}
            <div className="rounded-lg border border-[#3A3A3A] bg-[#1A1A1A] p-4 transition-colors hover:border-yellow-400">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-lg text-yellow-400" />
                  <span className="text-sm font-medium text-white">
                    Localização
                  </span>
                </div>
                <Link
                  href="https://maps.google.com/?q=Campo+de+Futebol+Exemplo+São+Paulo+SP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-400 underline hover:text-yellow-300"
                >
                  Ver no Google Maps
                </Link>
              </div>

              {/* Imagem estática do mapa ou placeholder */}
              <div className="flex h-32 items-center justify-center rounded-md bg-gradient-to-br from-gray-700 to-gray-800">
                <div className="text-center text-gray-400">
                  <FaMapMarkerAlt className="mx-auto mb-2 text-3xl text-yellow-400" />
                  <p className="text-xs">Campo de Futebol Exemplo</p>
                  <p className="text-xs">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2 – Siga-nos centralizado */}
          <div className="flex flex-col items-center justify-start gap-2">
            <p className="mb-2 font-bold text-yellow-400">Siga - nos</p>
            <div className="flex gap-3">
              <Link
                href="https://facebook.com/suaPagina"
                target="_blank"
                aria-label="Facebook"
              >
                <div className="cursor-pointer rounded-md border border-yellow-400 p-2 transition hover:bg-yellow-400">
                  <FaFacebookF className="text-lg text-yellow-400 hover:text-black" />
                </div>
              </Link>
              <Link
                href="https://wa.me/seuNumero"
                target="_blank"
                aria-label="WhatsApp"
              >
                <div className="cursor-pointer rounded-md border border-yellow-400 p-2 transition hover:bg-yellow-400">
                  <FaWhatsapp className="text-lg text-yellow-400 hover:text-black" />
                </div>
              </Link>
              <Link
                href="https://instagram.com/seuPerfil"
                target="_blank"
                aria-label="Instagram"
              >
                <div className="cursor-pointer rounded-md border border-yellow-400 p-2 transition hover:bg-yellow-400">
                  <FaInstagram className="text-lg text-yellow-400 hover:text-black" />
                </div>
              </Link>
            </div>
          </div>

          {/* Coluna 3 – Links rápidos atualizados com todos os 7 tópicos */}
          <div className="flex flex-col gap-2 text-right text-sm text-gray-300">
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
          <p className="text-sm text-gray-400">
            {rachaConfig.frases.principal}
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {rachaConfig.nome}. Todos os direitos
          reservados. v1.0
        </div>
      </div>
    </footer>
  );
}
