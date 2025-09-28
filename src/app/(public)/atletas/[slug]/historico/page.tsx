"use client";

import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useAtletaDetalhe } from "@/hooks/useAtletas";
import { useRacha } from "@/context/RachaContext";
import { useTenant } from "@/hooks/useTenant";

function formatDate(iso: string) {
  const [datePart] = iso.split("T");
  const [ano, mes, dia] = datePart.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function HistoricoCompletoPage() {
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

  const agrupadoPorAno = useMemo(() => {
    const historico = atleta?.historicoRecentes ?? [];
    return historico.reduce<Record<string, typeof historico>>((acc, jogo) => {
      const ano = new Date(jogo.dataISO).getFullYear().toString();
      if (!acc[ano]) {
        acc[ano] = [];
      }
      acc[ano].push(jogo);
      return acc;
    }, {});
  }, [atleta]);

  const anosOrdenados = useMemo(
    () => Object.keys(agrupadoPorAno).sort((a, b) => Number(b) - Number(a)),
    [agrupadoPorAno]
  );

  return (
    <>
      <Head>
        <title>Historico completo de {atleta?.nome ?? "Atleta"} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja o historico completo de partidas do atleta ${atleta?.nome ?? ""} no Fut7Pro.`}
        />
      </Head>

      <main className="max-w-5xl mx-auto px-4 py-10 text-white">
        <h1 className="text-3xl font-bold text-yellow-400 mt-4 mb-6 text-center">
          Historico completo de {atleta?.nome ?? "Atleta"}
        </h1>

        {isLoading ? (
          <div className="text-center text-gray-300 py-12">Carregando historico...</div>
        ) : isError ? (
          <div className="text-center text-red-300 bg-red-500/10 border border-red-500/30 mx-auto max-w-xl p-6 rounded">
            {error ?? "Nao foi possivel carregar o historico deste atleta."}
          </div>
        ) : !atleta || anosOrdenados.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Nenhum registro encontrado.{" "}
            <Link href="/atletas" className="text-yellow-300 hover:underline">
              Voltar para os atletas
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-10">
            {anosOrdenados.map((ano) => (
              <section key={ano} className="w-full">
                <h2 className="text-lg font-semibold text-white mb-3">Ano {ano}</h2>
                <div className="w-full overflow-x-auto scrollbar-dark">
                  <table className="min-w-[700px] text-sm border border-zinc-700 bg-zinc-900">
                    <thead className="bg-zinc-900 text-gray-300">
                      <tr>
                        <th className="p-2 border">Data</th>
                        <th className="p-2 border">Adversario</th>
                        <th className="p-2 border">Resultado</th>
                        <th className="p-2 border">Gols</th>
                        <th className="p-2 border">Assistencias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agrupadoPorAno[ano]?.map((jogo) => (
                        <tr key={`${jogo.partidaId}-${jogo.dataISO}`} className="text-center">
                          <td className="p-2 border">{formatDate(jogo.dataISO)}</td>
                          <td className="p-2 border">{jogo.adversario}</td>
                          <td className="p-2 border">
                            {jogo.resultado} ({jogo.placar})
                          </td>
                          <td className="p-2 border">{jogo.gols}</td>
                          <td className="p-2 border">{jogo.assistencias}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          height: 8px;
          background: #18181b;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 6px;
        }
        .scrollbar-dark {
          scrollbar-color: #333 #18181b;
          scrollbar-width: thin;
        }
      `}</style>
    </>
  );
}
