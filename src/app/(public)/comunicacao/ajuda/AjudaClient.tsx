"use client";

import { useRacha } from "@/context/RachaContext";
import { useAboutPublic } from "@/hooks/useAbout";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { OFFICIAL_YOUTUBE_CHANNEL_URL } from "@/lib/help-center-defaults";

export default function AjudaClient() {
  const { tenantSlug } = useRacha();
  const { publicSlug } = usePublicLinks();
  const slug = publicSlug.trim() || tenantSlug.trim() || "";
  const { about } = useAboutPublic(slug);
  const videos = about?.videos?.length ? about.videos : [];

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-6">Central de Ajuda</h1>
      <p className="text-zinc-400 mb-6">
        Assista aos vídeos abaixo e confira tutoriais rápidos! Para mais conteúdo, acesse nosso
        canal oficial no&nbsp;
        <a
          href={OFFICIAL_YOUTUBE_CHANNEL_URL}
          className="text-brand font-semibold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
        .
      </p>
      {videos.length === 0 ? (
        <div className="rounded border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-400">
          Ainda não há vídeos publicados para este racha. Assim que novos tutoriais forem liberados,
          eles aparecerão aqui automaticamente.
        </div>
      ) : (
        <ul className="space-y-6">
          {videos.map((v, idx) => (
            <li
              key={(v as any).id ?? idx}
              className="bg-zinc-800 rounded-lg p-4 flex flex-col items-start border-l-4 border-brand"
            >
              <span className="font-bold text-zinc-200 mb-2">{v.titulo}</span>
              <div className="w-full aspect-[16/9] rounded overflow-hidden">
                <iframe
                  src={v.url}
                  title={v.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-44 rounded"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
