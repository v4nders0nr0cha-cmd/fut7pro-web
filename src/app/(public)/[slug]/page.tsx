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
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-fundo py-10 pb-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-300">Carregando racha...</p>
      </div>
    );
  }

  if (isError || !racha) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-fundo">
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
