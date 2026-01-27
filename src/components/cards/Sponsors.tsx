"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";

export default function Sponsors() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { slots, isLoading } = usePublicSponsors(slug);

  const list = useMemo(() => {
    return slots.slice(0, 6);
  }, [slots]);

  return (
    <section className="bg-[#111] py-8 border-t border-brand px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <h3 className="text-lg font-bold text-brand mb-4">NOSSOS PATROCINADORES</h3>
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
                width={106}
                height={64}
                className="object-contain h-14 w-auto max-w-[140px] opacity-80 hover:opacity-100 transition duration-300 ease-in-out"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
