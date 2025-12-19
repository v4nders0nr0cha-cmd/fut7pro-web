"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";

export default function Sponsors() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { sponsors, isLoading } = usePublicSponsors(slug);

  const list = useMemo(() => {
    if (!sponsors.length) return [];
    const onlyFooter = sponsors.filter((s) => s.showOnFooter);
    const base = onlyFooter.length ? onlyFooter : sponsors;
    return base.slice(0, 6);
  }, [sponsors]);

  return (
    <section className="bg-[#111] py-8 border-t border-yellow-400 px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">NOSSOS PATROCINADORES</h3>
        {isLoading && list.length === 0 ? (
          <div className="text-gray-400">Carregando patrocinadores...</div>
        ) : list.length === 0 ? (
          <div className="text-gray-400">Nenhum patrocinador publicado ainda.</div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-4">
            {list.map((p) => (
              <Image
                key={p.id}
                src={p.logoUrl}
                alt={p.name}
                width={100}
                height={50}
                className="object-contain h-12 opacity-80 hover:opacity-100 transition duration-300 ease-in-out"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
