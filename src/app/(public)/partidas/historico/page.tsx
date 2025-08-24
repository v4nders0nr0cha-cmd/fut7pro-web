import type { Metadata } from "next";
import HistoricoClient from "./HistoricoClient";

export const metadata: Metadata = {
  title: "Histórico de Partidas | Fut7Pro",
  description:
    "Veja o histórico completo de partidas do seu racha, com placares, locais, datas e destaques. Filtro por time e data.",
  alternates: { canonical: "/partidas/historico" },
  openGraph: {
    title: "Histórico de Partidas | Fut7Pro",
    description:
      "Navegue por todas as partidas passadas com filtros, placares e locais.",
    type: "website",
  },
};

export default function Page() {
  return (
    <main>
      <section className="mx-auto max-w-6xl">
        {/* Cabeçalho padrão (igual Estatísticas) */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-yellow-400 md:text-4xl">
            Histórico de Partidas
          </h1>
          <p className="mt-2 text-sm text-gray-300 md:text-base">
            Consulte partidas anteriores, filtre por time ou data e encontre
            resultados rapidamente. Os dados são atualizados pelo administrador
            do racha.
          </p>
        </div>

        {/* Listagem com filtros e estados visuais padronizados */}
        <div className="mt-6">
          <HistoricoClient />
        </div>
      </section>
    </main>
  );
}
