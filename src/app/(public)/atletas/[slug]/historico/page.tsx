"use client";

import { useParams, notFound } from "next/navigation";
import { atletasMock } from "@/components/lists/mockAtletas";
import type { JogoAtleta } from "@/types/atletas";
import Head from "next/head";

export default function HistoricoCompletoPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const atleta = atletasMock.find((a) => a.slug === slug);
  if (!atleta) return notFound();

  const historico = atleta.historico;

  const agrupadoPorAno = historico.reduce<Record<string, JogoAtleta[]>>(
    (acc, jogo) => {
      const ano = new Date(jogo.data).getFullYear().toString();
      if (!acc[ano]) acc[ano] = [];
      acc[ano].push(jogo);
      return acc;
    },
    {},
  );

  const anosOrdenados = Object.keys(agrupadoPorAno).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <>
      <Head>
        <title>Histórico Completo de {atleta.nome} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja o histórico completo de partidas, desempenho e pontuação do atleta ${atleta.nome} no Fut7Pro.`}
        />
        <meta
          name="keywords"
          content={`fut7, histórico, partidas, desempenho, ${atleta.nome}, futebol 7, racha`}
        />
      </Head>

      <h1 className="mb-6 mt-8 text-center text-3xl font-bold text-yellow-400">
        Histórico completo de {atleta.nome}
      </h1>

      {/* Wrapper externo NUNCA deve ter max-w, mx-auto, px-4 */}
      <div className="w-full">
        {anosOrdenados.map((ano) => (
          <div key={ano} className="mb-10 w-full">
            <h2 className="mb-2 text-lg font-semibold text-white">📅 {ano}</h2>
            <div className="scrollbar-dark w-full overflow-x-auto">
              <table className="min-w-[700px] border border-zinc-700 bg-zinc-900 text-sm">
                <thead className="bg-zinc-900 text-gray-300">
                  <tr>
                    <th className="border p-2">Data</th>
                    <th className="border p-2">Time</th>
                    <th className="border p-2">Resultado</th>
                    <th className="border p-2">Gols</th>
                    <th className="border p-2">Campeão?</th>
                    <th className="border p-2">Pontuação</th>
                    <th className="border p-2">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {agrupadoPorAno[ano]?.map((jogo, index) => (
                    <tr key={index} className="text-center">
                      <td className="border p-2">{jogo.data}</td>
                      <td className="border p-2">{jogo.time}</td>
                      <td className="border p-2">{jogo.resultado}</td>
                      <td className="border p-2">{jogo.gols}</td>
                      <td className="border p-2">{jogo.campeao ? "🏆" : ""}</td>
                      <td className="border p-2">{jogo.pontuacao}</td>
                      <td className="border p-2">
                        <button className="text-yellow-400 hover:underline">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

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
