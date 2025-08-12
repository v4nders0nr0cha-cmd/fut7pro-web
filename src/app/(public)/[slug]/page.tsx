"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { useRacha as useRachaContext } from "@/context/RachaContext";
import { notFound } from "next/navigation";

export default function RachaPublicPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { racha, isLoading, isError } = useRachaPublic(slug);
  const { setRachaId } = useRachaContext();

  // Definir o rachaId no contexto quando a página carregar
  useEffect(() => {
    if (racha?.id) {
      setRachaId(racha.id);
    }
  }, [racha?.id, setRachaId]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-300">Carregando racha...</p>
      </div>
    );
  }

  if (isError || !racha) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-fundo">
      {/* Redirecionar para a página principal do racha */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.location.href = '/';
          `,
        }}
      />
    </div>
  );
}
