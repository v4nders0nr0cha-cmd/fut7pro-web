"use client";

import Head from "next/head";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function HistoricoAtletaPage() {
  const params = useParams() as { slug?: string; athleteSlug?: string };
  const { tenantSlug } = useRacha();
  const { publicHref } = usePublicLinks();
  const tenantFromParams = params.athleteSlug ? params.slug : undefined;
  const athleteSlug = params.athleteSlug || params.slug || "";
  const resolvedTenantSlug = tenantFromParams || tenantSlug;
  const { athlete, isLoading, isError } = usePublicAthlete({
    tenantSlug: resolvedTenantSlug,
    athleteSlug,
  });

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-2 py-10 text-gray-300">Carregando...</div>;
  }

  if (isError || !athlete) {
    notFound();
  }

  return (
    <>
      <Head>
        <title>Historico | {athlete.firstName || "Atleta"} | Fut7Pro</title>
      </Head>
      <main className="max-w-4xl mx-auto px-2 py-10">
        <Link href={publicHref(`/atletas/${athleteSlug}`)} className="text-brand underline text-sm">
          Voltar para o perfil
        </Link>

        <div className="mt-4 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <h1 className="text-2xl font-bold text-brand mb-2">Historico do atleta</h1>
          <p className="text-gray-300 text-sm">
            Historico detalhado sera exibido quando as partidas e presencas estiverem publicadas
            para este atleta.
          </p>
        </div>
      </main>
    </>
  );
}
