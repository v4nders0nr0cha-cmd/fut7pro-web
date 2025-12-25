"use client";

import Head from "next/head";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function ConquistasAtletaPage() {
  const params = useParams() as { slug?: string; athleteSlug?: string };
  const { tenantSlug } = useRacha();
  const { publicHref } = usePublicLinks();
  const tenantFromParams = params.athleteSlug ? params.slug : undefined;
  const athleteSlug = params.athleteSlug || params.slug || "";
  const resolvedTenantSlug = tenantFromParams || tenantSlug;
  const { athlete, conquistas, isLoading, isError } = usePublicAthlete({
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
        <title>Conquistas | {athlete.firstName || "Atleta"} | Fut7Pro</title>
      </Head>
      <main className="max-w-4xl mx-auto px-2 py-10">
        <Link
          href={publicHref(`/atletas/${athleteSlug}`)}
          className="text-yellow-400 underline text-sm"
        >
          Voltar para o perfil
        </Link>

        <div className="mt-6">
          <ConquistasDoAtleta
            slug={athlete.slug}
            titulosGrandesTorneios={conquistas.titulosGrandesTorneios}
            titulosAnuais={conquistas.titulosAnuais}
            titulosQuadrimestrais={conquistas.titulosQuadrimestrais}
          />
        </div>
      </main>
    </>
  );
}
