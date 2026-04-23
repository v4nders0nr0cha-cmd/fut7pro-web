"use client";

import Image from "next/image";
import Link from "next/link";

type ChampionBannerProps = {
  image?: string | null;
  date: string;
  players: string[];
  href: string; // rota dinâmica, obrigatória
  isImageLoading?: boolean;
};

const FALLBACK_BANNER_IMAGE = "/images/torneios/torneio-matador.jpg";

const ChampionBanner = ({
  image,
  date,
  players,
  href,
  isImageLoading = false,
}: ChampionBannerProps) => {
  const bannerImage = image?.trim() || null;

  const altText = `Imagem do Time Campeão do Dia - ${date}`;

  return (
    <Link href={href} className="block mb-10">
      <div className="flex flex-col md:flex-row items-center bg-[#1a1a1a] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-[0_0_20px_2px_var(--brand)] group">
        <div className="w-full md:w-2/3 aspect-[16/9] relative">
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt={altText}
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover brightness-90"
              priority
            />
          ) : isImageLoading ? (
            <div
              role="status"
              aria-live="polite"
              aria-label="Carregando imagem oficial do Time Campeão do Dia"
              className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))]"
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-gray-300 backdrop-blur-sm">
                Carregando foto oficial
              </div>
            </div>
          ) : (
            <Image
              src={FALLBACK_BANNER_IMAGE}
              alt={altText}
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover brightness-90"
              priority
            />
          )}
        </div>
        <div className="w-full md:w-1/3 flex flex-col justify-center items-center md:items-start p-6 text-center md:text-left">
          <p className="text-brand text-xl sm:text-2xl md:text-3xl uppercase font-extrabold mb-2 drop-shadow-[0_0_5px_var(--brand)]">
            Time Campeão do Dia
          </p>
          <p className="text-white text-base sm:text-lg md:text-xl font-semibold mb-2">{date}</p>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
            {players.length ? players.join(", ") : "Jogadores não cadastrados"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ChampionBanner;
