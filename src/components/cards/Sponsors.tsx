"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePublicSponsors } from "@/hooks/usePublicSponsors";
import { trackSponsorMetric } from "@/lib/track-sponsor-metric";
import { rachaConfig } from "@/config/racha.config";
import type { Patrocinador } from "@/types/patrocinador";

const FALLBACK_SPONSORS: Patrocinador[] = [
  {
    id: "fallback-fut7pro",
    name: "Fut7Pro",
    logoUrl: "https://app.fut7pro.com.br/images/logos/logo_fut7pro.png",
    tier: "PRO",
    displayOrder: 1,
    showOnFooter: true,
  },
];

export default function Sponsors() {
  const { user } = useAuth();
  const slug = user?.tenantSlug ?? rachaConfig.slug;
  const { patrocinadores } = usePublicSponsors(slug);
  const sponsors = patrocinadores.length > 0 ? patrocinadores : FALLBACK_SPONSORS;
  const impressionSet = useRef(new Set<string>());

  useEffect(() => {
    if (!slug) return;
    sponsors.forEach((patro, index) => {
      if (!impressionSet.current.has(patro.id)) {
        trackSponsorMetric({
          slug,
          sponsorId: patro.id,
          type: "impression",
          targetUrl: patro.link,
          source: "card-sponsors",
          metadata: { position: index + 1 },
        });
        impressionSet.current.add(patro.id);
      }
    });
  }, [slug, sponsors]);

  return (
    <section className="bg-[#111] py-8 border-t border-yellow-400 px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">NOSSOS PATROCINADORES</h3>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {sponsors.map((patro) => (
            <Image
              key={patro.id}
              src={patro.logoUrl}
              alt={patro.name}
              width={100}
              height={50}
              className="object-contain h-12 opacity-80 hover:opacity-100 transition duration-300 ease-in-out"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
