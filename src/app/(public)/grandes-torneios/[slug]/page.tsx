"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  });

export default function DetalheTorneioPage() {
  const params = useParams() as { slug?: string; torneioSlug?: string };
  const torneioSlug = params.torneioSlug || params.slug;
  const { publicSlug } = usePublicLinks();
  const { data: torneio, error } = useSWR(
    torneioSlug ? `/api/public/${publicSlug}/torneios/${torneioSlug}` : null,
    fetcher
  );

  if (error?.message === "404") return notFound();

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
      </div>
    </main>
  );
}
