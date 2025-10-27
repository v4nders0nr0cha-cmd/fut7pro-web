"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAtletaDetalhe } from "@/hooks/useAtletas";
import { useRacha } from "@/context/RachaContext";
import { useTenant } from "@/hooks/useTenant";

type Conquista = {
  titulo: string;
  ano?: number | null;
  tipo?: string | null;
};

function renderLista(titulo: string, itens: Conquista[]) {
  return (
    <section className="mb-8 w-full max-w-3xl mx-auto">
      <h2 className="text-xl text-yellow-300 font-semibold mb-3 border-b border-zinc-700 pb-1">
        {titulo}
      </h2>
      {itens.length === 0 ? (
        <p className="text-zinc-400 italic">Nenhum registro.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {itens.map((item, index) => (
            <span
              key={`${item.titulo}-${index}`}
              className="bg-[#222] rounded-xl px-3 py-1 text-sm flex items-center gap-1 text-yellow-100"
              title={item.titulo}
            >
              <span>
                {item.tipo?.toLowerCase().includes("torneio")
                  ? "T"
                  : item.tipo?.toLowerCase().includes("quadr")
                    ? "Q"
                    : "A"}
              </span>
              <span>
                {item.titulo}
                {item.ano ? <span className="text-xs text-gray-400"> {item.ano}</span> : null}
              </span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ConquistasTodasPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const { tenant } = useTenant();
  const { rachaId } = useRacha();

  const tenantSlug = tenant?.slug ?? null;
  const effectiveRachaId = tenant?.id ?? rachaId ?? null;

  const { atleta, isLoading, isError, error } = useAtletaDetalhe(
    slug,
    effectiveRachaId,
    tenantSlug
  );

  const conquistas = atleta?.conquistas ?? [];
  const titulosGrandesTorneios = conquistas.filter((c) =>
    (c.tipo ?? "").toLowerCase().includes("torneio")
  );
  const titulosAnuais = conquistas.filter((c) => (c.tipo ?? "").toLowerCase().includes("anual"));
  const titulosQuadrimestrais = conquistas.filter((c) =>
    (c.tipo ?? "").toLowerCase().includes("quadr")
  );

  return (
    <>
      <Head>
        <title>Todas as conquistas de {atleta?.nome ?? "Atleta"} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja todos os titulos e conquistas do atleta ${atleta?.nome ?? ""} no Fut7Pro.`}
        />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-10 text-white">
        <h1 className="text-3xl font-bold text-yellow-400 mt-4 mb-6 text-center">
          Todas as conquistas de {atleta?.nome ?? "Atleta"}
        </h1>

        <div className="mb-8 text-center">
          <Link
            href={`/atletas/${slug}`}
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded transition"
          >
            Voltar para o perfil
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-300 py-12">Carregando conquistas...</div>
        ) : isError ? (
          <div className="text-center text-red-300 bg-red-500/10 border border-red-500/30 mx-auto max-w-xl p-6 rounded">
            {error ?? "Nao foi possivel carregar as conquistas deste atleta."}
          </div>
        ) : !atleta ? (
          <div className="text-center text-gray-400 py-12">
            Atleta nao encontrado.{" "}
            <Link href="/atletas" className="text-yellow-300 hover:underline">
              Ver lista de atletas
            </Link>
          </div>
        ) : (
          <>
            {renderLista("Titulos de grandes torneios", titulosGrandesTorneios)}
            {renderLista("Titulos da temporada", titulosAnuais)}
            {renderLista("Titulos quadrimestrais", titulosQuadrimestrais)}
            {conquistas.length === 0 && (
              <p className="text-center text-sm text-gray-400">Sem conquistas registradas ainda.</p>
            )}
          </>
        )}
      </main>
    </>
  );
}
