"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import { useAdminChampions } from "@/hooks/useAdminChampions";

const CAMPEOES_PRIORITARIOS = [
  "Melhor do Ano",
  "Artilheiro do Ano",
  "Maestro do Ano",
  "Campeao do Ano",
];

const POSICOES_PRIORITARIAS = [
  "Atacante do Ano",
  "Meia do Ano",
  "Zagueiro do Ano",
  "Goleiro do Ano",
];

export default function OsCampeoesAdminPage() {
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);
  const { data, isLoading, isError, error } = useAdminChampions(anoSelecionado);

  const anosDisponiveis = useMemo(() => data?.availableYears ?? [], [data?.availableYears]);
  const anoAtual = data?.year ?? anoSelecionado ?? anosDisponiveis[0];

  const campeoesPrincipais = useMemo(
    () => (data?.annual ?? []).filter((item) => CAMPEOES_PRIORITARIOS.includes(item.title)),
    [data?.annual]
  );

  const campeoesPorPosicao = useMemo(
    () => (data?.annual ?? []).filter((item) => POSICOES_PRIORITARIAS.includes(item.title)),
    [data?.annual]
  );

  return (
    <>
      <Head>
        <title>Os Campeoes (Admin) | Fut7Pro</title>
        <meta
          name="description"
          content="Visualize os campeoes da temporada e aplique automaticamente os icones de conquistas nos atletas do Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7pro, admin, campeoes, temporada, quadrimestre, futebol 7"
        />
      </Head>

      <main className="bg-fundo text-white min-h-screen pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <header className="max-w-5xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
            Os Campeoes do Racha
          </h1>
          <p className="text-sm text-gray-300 max-w-3xl mx-auto">
            Os campeoes sao calculados com base nos resultados oficiais das partidas e nos rankings
            multi-tenant. Escolha o ano para conferir os destaques anuais e por quadrimestre.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {anosDisponiveis.map((ano) => (
              <button
                key={ano}
                type="button"
                onClick={() => setAnoSelecionado(ano)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                  anoAtual === ano
                    ? "bg-yellow-400 text-black shadow"
                    : "bg-zinc-800 text-gray-200 hover:bg-yellow-200 hover:text-black"
                }`}
              >
                Temporada {ano}
              </button>
            ))}
          </div>
        </header>

        <section className="max-w-5xl mx-auto">
          {isLoading && (
            <div className="text-center text-gray-400 py-10 text-base">
              Carregando resumo de campeoes...
            </div>
          )}
          {isError && (
            <div className="text-center text-red-300 py-10 text-base">
              Falha ao carregar campeoes: {error}
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
                  Campeoes do Ano {anoAtual}
                </h2>
                {campeoesPrincipais.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Nenhum campeao registrado para este ano.
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
                    {campeoesPrincipais.map((item) => (
                      <CampeaoAnoCard
                        key={item.id}
                        titulo={item.title}
                        nome={item.athlete?.name ?? "-"}
                        foto={item.athlete?.photoUrl}
                        icone={item.icon ?? undefined}
                        valor={item.value ?? undefined}
                        slug={item.athlete?.slug ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
                  Melhores por Posicao
                </h2>
                {campeoesPorPosicao.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Nenhum registro de posicao para este ano.
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
                    {campeoesPorPosicao.map((item) => (
                      <CampeaoAnoCard
                        key={item.id}
                        titulo={item.title}
                        nome={item.athlete?.name ?? "-"}
                        foto={item.athlete?.photoUrl}
                        icone={item.icon ?? undefined}
                        valor={item.value ?? undefined}
                        slug={item.athlete?.slug ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="mb-16">
                <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
                  Campeoes por Quadrimestre
                </h2>
                <QuadrimestreGrid quarters={data?.quarters ?? []} />
              </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}
