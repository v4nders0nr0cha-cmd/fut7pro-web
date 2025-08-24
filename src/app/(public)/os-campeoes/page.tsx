import type { Metadata } from "next";
import OsCampeoesClient from "./OsCampeoesClient";

export const metadata: Metadata = {
  title: "Os Campeões | Fut7Pro",
  description:
    "Conheça os destaques do ano, melhores por posição e os campeões de cada quadrimestre. Dados atualizados automaticamente a partir das partidas.",
  alternates: { canonical: "/os-campeoes" },
  openGraph: {
    title: "Os Campeões | Fut7Pro",
    description:
      "Hall da Fama do racha: campeões do ano, por posição e por quadrimestre.",
    type: "website",
  },
};

export default function Page() {
  return (
    <main>
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-yellow-400 md:text-4xl">
            Os Campeões
          </h1>
          <p className="mt-2 text-sm text-gray-300 md:text-base">
            Celebre os grandes momentos do seu racha. Veja os campeões do ano,
            os melhores por posição e os vencedores de cada quadrimestre.
          </p>
        </div>

        <div className="mt-6">
          <OsCampeoesClient />
        </div>
      </section>
    </main>
  );
}
